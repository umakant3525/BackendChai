import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js"; 
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId) =>{
    try{
        const user = User.findById(userId) 
       const accessToken = user.generateAccessToken()
       const refreshToken =  user.generateRefreshToken()

       user.refreshToken = refreshToken 
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken }

    }catch(error){
        throw new ApiError(500, " Something went wrong when generating refresh and access token ")
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

const loginUser = asyncHandler( async (req, res) => {

    // req body --> data
    //  username or email
    // find the user
    //  password check
    //  access and refresh token 
    // send cookie  with response
    
    const {email, username, password} = req.body ;

    if(!username || !email){
        throw new  ApiError(400,"Username or Email field cannot be empty");
    }

    const  user = await User.findOne({$or:[{username}, {email}]})

    if(!user) {
        throw new ApiError(404,"user not exist")
    }
    
  const isPasswordValid =  await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user creditials")
  }

  const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id) 

  const loggedInUser = User.findById(user._id).select("-password -refreshToken ")

  const options = {
    httpOnly : true,
    secure : true
}

return res.status(200)
.cookie('accessToken', accessToken ,options )
.cookie('refreshToken', refreshToken ,options )
.json(
    new ApiResponse(
        200,
        {
            user : loggedInUser , accessToken , refreshToken
        },
        "User logged in successfully "
    )
)

}
)

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
export { 
    registerUser, 
    loginUser,
    logoutUser
};
