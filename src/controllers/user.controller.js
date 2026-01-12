import { ayncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // saving to mongoose
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      " went wrong while genrating refresh and access token"
    );
  }
};

const registerUser = ayncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;
  console.log("email", email);

  //    if(fullName===""){
  //     throw new ApiError(400, "fullName is required")
  //    }

  // get user details
  //validate the user
  // check if user already existed
  // check image and avatar
  // upload on cloudinary
  // create obeject - create entry in db
  // remove password and resfresh token filed from response
  // check user creation
  // return res

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or usename exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("avatar:" , avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user created succesfully"));
});

const loginUser = ayncHandler(async (req, res) => {
  // req body -> data
  //username or email
  // / find the user
  // password
  // access and resfresh token
  // send cookie

  const { email, username, password } = req.body ;

  if (!(username || email)) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, " user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid password");
  }
  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // sending cookies
  const options = {
    httpOnly: true,
   secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = ayncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    // secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = ayncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorised request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "unauthorised request");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = {
      httpOnly: true,
     // secure: true,
    };
    const { accessToken, refreshToken: newrefreshToken } =
      await generateRefreshAndAccessToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newrefreshToken },
          "accessed token refreshed "
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = ayncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "password changed"));
});

const getCurrentUser = ayncHandler(async (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse( 200, req.user, "current user fetched "));

});

const updateAccountDetailes = ayncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.body?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200), user, "account details updated succesfully");
});

const updateUserAvatar = ayncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, " avatar field is missing ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, " error while uploading avatar ");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            avatar: avatar.url
        }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user , "avatar updated "))

});

const updateCoverImage = ayncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, " coverImage field is missing ");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, " error while uploading coverImage  ");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            coverImage: coverImage.url
        }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user , "coverimage updated "))

});

const getUserChannelProfile = ayncHandler(async (req, res) => {
  const {username} = req.params
  if (!username) {
    throw new ApiError(400, "user name missing")
  }

  const channel = await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()

      }
    },
    {// finding number subsbribers
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField:"channel", // selected channel to get subscribers
        as: "subscribers"

      }
    },
    {// finding subscribed channel
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField:"subscriber", // selected channel subscribed to 
        as: "subscribedTo"

      }
    },
    {// giving the total no. of subscirbers and subscribedTo 
      $addFields:{
        subscriberCount:{
          $size: "$subscribers"        // $ cause its a filed 
        },
        channelSubscribedTo:{
          $size: "subscribedTo"
        },
        isSubscribed:{
          $cond:{
            if:{ $in: [req.user?._id,"$subscribers.subscriber"]},
            then: true,
            else:false
          }
        }
      }
    },
    { // what to show on screen to the user 
      $project: {
        fullName:1,
        username:1,
        subscriberCount:1,
        channelSubscribedTo:1,
        isSubscribed: 1,
        avatar: 1,
        coverImage:1,
        email:1,
        createdAt:1
      }
    }

  ])

  if(!channel?.length){
    throw new ApiError(400,"channel not exist  ")
  }

  return res
  .status(200)
  .json(new ApiResponse( 200, channel[0] , " User channel fetched succefully"))

});

const getWatchHistory = ayncHandler(async(req, res) =>{
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        form:"videos",
        localField:"watchHistory",
        foreignField:"._id",
        as: "watchHistory",
        pipeline:[
          {
            $lookup:"users",
            localField: "owner",
            foreignField: "._id",
            as: "owner",
            pipeline:[
              {
                $project:{
                  fullName: 1,
                  username:1,
                  avatar:1
                }
              }
            ]
          },
          {
            $addFields:{
              owner:{
                $first: $owner
              }
            }

          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(new ApiResponse(200 , user[0].watchHistory , " watch history fetched "))

})




export {
    generateRefreshAndAccessToken,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetailes,
  updateUserAvatar, 
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
