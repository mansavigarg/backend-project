import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


// * Creating a method for generating access and refresh tokens
const generateAccessAndRefreshTokens =  async(userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // we are storing the refresh token in the database so that we didn't need to ask for password again and again from the user
        user.refreshToken = refreshToken // adding refreshToken in the object user 
        await user.save({ validateBeforeSave: false }) // during saving we need the passsword field to update the database so here we use {validateBeforeSave: false} to save directly 

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend
    // validation for infromation -- not empty validation
    // check if user already exists: with username and email
    // check for images, check for avatar
    // upload them to cloudinary, check if avatar uplaoded
    // create user object -- create entry in db
    // remove password and refresh token field from response (that will be send to fronetend user)
    // check for user creation 
    // return response


    const {fullName, email, username, password} = req.body
    console.log("Email " , email)

    // we are doing checks here aas validation
    // now we can do one thing that we can apply more and more if checks for validation
    // or we can use the different syntax as below
    //! if( fullName === "") {
    //!     throw new ApiError(400, "Full name is required")
    //! }

    // array of if checks
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
        // yha pr agar ek bi field khali hogi then true return ho jayega
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // already if users exists
    const existedUser = await User.findOne({
        // $or checks for array and both the objects in it
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // uploading on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:  username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        // this select method will select all the fields other than the given fields in the string
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while user registration");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

    // res.status(200).json({
    //     message: "Ok"
    // })
})


// ! LOGIN USER
const loginUser = asyncHandler(async (req,res) =>  {
    // TODO: get data from req.body 
    // TODO: check for username or email 
    // TODO: find the user
    // TODO: password check 
    // TODO: generate access and refresh token 
    // TODO: send these tokens in cookies

    const {email,username,password} = req.body
    console.log(email);
    

    if(!username && !email){
        throw new ApiError(400, "Username or Email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:(either email or username)
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(400, "User doesn't exist")
    }

    const isPasswordValid = await user.isPasswordsCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log(loggedInUser);
    

    // creating options for cookies
    const options = {
        httpOnly: true,
        secure: true
    } 
    // ! By default everyone can modify cookies in frontend but by adding this "options" we are making it secure so that only server can channge the cookies

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async(req,res) => {
    // delete the refreshToken and remove the cookie of refreshToken and accessToken
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200 , {} , "User Logged out")
    )
     
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken,newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                { accessToken, newrefreshToken },
                "Access token refreshed" 
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
