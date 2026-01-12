import { ApiError } from "../utils/ApiError.js"
import {ayncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

export const  verifyJwt = ayncHandler(async(req , res , next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorisation")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "unauthorised request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // accress token secret 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        

    
        if (!user) {
            throw new ApiError(401, "invalid access token")
        }
    
        req.user= user;
        next()
    } catch (error) {
        throw new ApiError(401,error.message || "invalid access token" )
    }

    
})