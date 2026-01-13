import { Router } from "express";
import { registerUser, loginUser,logoutUser , refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetailes, updateUserAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory, deleteUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
   
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    //  (req, res, next) => {
    // console.log(" FILES:", req.files);
    // next();},

    
    registerUser
)

router.route("/login").post(loginUser)




//scured route
router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJwt ,changeCurrentPassword)

router.route("/current-user").post(verifyJwt ,getCurrentUser)

router.route("/update-account").patch(updateAccountDetailes)

router.route("/avatar").patch(verifyJwt , upload.single("avatar") ,updateUserAvatar)

router.route("/cover-image").patch(verifyJwt , upload.single("coverImage") ,updateCoverImage)

router.route("/c/:username").get(verifyJwt , getUserChannelProfile)

router.route("/watch-history").get(verifyJwt, getWatchHistory)

router.route("/delete").delete(verifyJwt, deleteUser)



export  default router