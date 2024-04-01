import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js"; 
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); 
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong when generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All information is required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    }); 

    if (existingUser) {
        throw new ApiError(409, "Username or Email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath ;

    if(req.files && Array.isArray(req.files.coverImage) &&req.files.coverImage.length > 0 ){
        coverImageLocalPath
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath); 

    if (!avatar) {
        throw new ApiError(400, "Avatar image upload failed"); 
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath); 

    const user = await User.create({ 
        fullname,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "", 
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering the user');
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User has been registered successfully")
    );
});

   
    
    const loginUser = asyncHandler(async (req, res) => {
         // req body --> data
    //  username or email
    // find the user
    //  password check
    //  access and refresh token 
    // send cookie  with response

        const { email, username, password } = req.body;
    
        if (!username && !email) {
            throw new ApiError(400, "Username or Email field cannot be empty");
        }
    
        const user = await User.findOne({ $or: [{ username }, { email }] });
    
        if (!user) {
            throw new ApiError(404, "User not found");
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password);
    
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        };
    
        return res.status(200)
            .cookie('accessToken', accessToken, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
            .json(new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            ));
    });


const logoutUser = asyncHandler( async (req, res) => {
   await  User.findByIdAndUpdate(req.user._id,{
        $set : {
            refreshToken : undefined
        }
    },{
        new : true
    })

  const options = {
    httpOnly : true,
    secure : true
}

 return res
 .status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(
    new ApiResponse(200,{}, "Usr logout Successfully ")
 )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id);
    
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is invalid or used ");
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
      
        const {newaccessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie('accessToken', newaccessToken, options)
        .cookie('accessToken', newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken : newaccessToken,
                   refreshToken : newrefreshToken
                },
                "RefreshToken token refreshed successfully "
            )
        )
    } catch (error) {
        ApiError(401,error?.message || "Invalid request ")
    }

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "Current User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.secure_url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.secure_url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})



const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.secure_url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.secure_url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res) =>{
    const {username} = req.params ;

    if(username?.trim()){
        throw new ApiError(400, "Username is mission ")        
    }
    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscription",
                localField : _id,
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscription",
                localField : _id,
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed: {
                    $cond : {
                        if : {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project: {
                fullname : 1,
                username : 1,
                subscribersCount : 1,
                channelSubscribedToCount : 1,
                isSubscribed: 1,
                avatar : 1,
                coverImage : 1,
                email : 1

            }
        }
    ])

    console.log(channel)

    if(!channel?.length){
        throw new ApiError(404, "channel does not exit")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            channel[0],"User channel details fetched successfully ")
    )

})




export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};
