import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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

export { registerUser }