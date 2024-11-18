import User from '../models/userModel.js';
import Notification from "../models/notificationModel.js";
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

export const getProfile = async (request, response) => {
    try {
        const {username} = request.params;
        const user = await User.findOne({username}).select("-password")

        if(!user) {
            return response.status(404).json({error: "user not found"})
        }
        response.status(200).json(user)
    } catch (error) {
        console.log(`Error in get userProfile controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
    }

}

export const followUnfollowUser = async (request, response) => {
    try {
        const {id} = request.params;
        const usertoModify = await User.findById({_id: id}) //findOne method also we can use
        const currentUSer = await User.findById({_id: request.user._id})

        if(id === request.user._id){
            return response.status(400).json({error: "you can't unfollow/follow"})

        }
        if(!usertoModify || !currentUSer) {
            return response.status(400).json({error: "user not found"})
        }

        const isFollowing = currentUSer.following.includes(id);

        if(isFollowing) {
            //unfollow
            await User.findByIdAndUpdate({_id: id},{$pull: {followers: request.user._id}})
            await User.findByIdAndUpdate({_id: request.user._id},{$pull: {following: id}}) 
            response.status(200).json({message: "Unfollow successfully"})

        }else{
            //follow
            await User.findByIdAndUpdate({_id: id},{$push: {followers: request.user._id}})
            await User.findByIdAndUpdate({_id: request.user._id},{$push: {following: id}}) 
            //send notification
            const newNotification = new Notification({
                type: "follow",
                from: request.user._id,
                to: usertoModify._id
            })
            await newNotification.save()
            response.status(200).json({message: "Follow successfully"})

        }
        
    } catch (error) {
        console.log(`Error in get followUnfollowUSer controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
    }

}

export const getSuggestedUsers = async (request, response) => {
    try {
        const userId = request.user._id;
        const userFollowedByMe = await User.findById({_id: userId}).select("-password")

        const users = await User.aggregate([
            {
                $match : {
                    _id: {$ne : userId}
                }
            },{
                $sample: {
                    size: 10
                }
            }
        ])
        const fillteredUSer = users.filter((user) => !userFollowedByMe.following.includes(user._id))
        const suggestedUsers  = fillteredUSer.slice(0, 4);
        suggestedUsers.forEach(user => (user.password = null));
        response.status(200).json(suggestedUsers)


    } catch (error) {
        console.log(`Error in getSuggested users controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
    }

}

export const updateUser = async (request, response) => {
    try {
        const userId = request.user._id;
        const {username, email, fullName, currentPassword, newPassword, bio, link} = request.body
        let {profileImg, coverImg} = request.body;

        let user = await User.findById({_id: userId})

        if(!user) {
            return response.status(404).json({error: "user not found"})
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return response.status(400).json({error: "Please provide both the new password"})
        }
        
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return response.status(404).json({error: "Current Password is Incorrect"})
            }
            if(newPassword.length < 6 ) {
                return response.status(404).json({error: "Password must have atleast 6 char length"})
            }
            const salt = await bcrypt.genSalt(10);
            user.password =  await bcrypt.hash(newPassword, salt);

        }
        
        if(profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;

        }

        if(coverImg) {

            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;

        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg  || user.coverImg; 

        user = await user.save();

        user.password = null; // only response not in mongoDB

        return response.status(200).json(user);

    } catch (error) {
        console.log(`Error in update users controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
    }

}




