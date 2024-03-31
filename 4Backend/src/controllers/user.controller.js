import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js"; 
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

const loginUser = asyncHandler( async (req, res) => {
    const {email, username, password} = req.body ;

    if(!username || !email){
        throw new  ApiError(400,"Username or Email field cannot be empty");
    }

    const  user = await User.findOne({$or:[{username}, {email}]})

    if(!user) {
        throw new ApiError(404,"user not exist")
    }


}
)
export { registerUser , loginUser};
