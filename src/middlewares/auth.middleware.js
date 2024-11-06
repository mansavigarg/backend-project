import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


// bottom here as res is not used in the whole code so we can replace this with a _ as well -> (req, _ , next)
export const verifyJWT = asyncHandler(async(req,res,next) => {
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user) {
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user; // req.user mein user ka access de diya hai yha pr
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})