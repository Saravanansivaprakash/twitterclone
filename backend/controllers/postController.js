import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from '../models/notificationModel.js';
import cloudinary from 'cloudinary';

export const createPost = async (request, response) => {
    try {
        const {text} = request.body;
        let {img} = request.body;

        const userId = request.user._id.toString();

        const user = await User.findOne({_id: userId})
        if(!user){
            return response.status(404).json({error: "User not found"});
        }
        if(!text && !img){
            return response.status(404).json({error: "Post must have text or image"});
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save();
        response.status(201).json(newPost);
    } catch (error) {
        console.log(`Error in createPost controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
        
    }

}

export const deletePost = async (request, response) => {
    try {
        const {id} = request.params;

        const post = await Post.findOne({_id: id});

        if (!post) {
			return response.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== request.user._id.toString()) {
			return response.status(401).json({ error: "You are not authorized to delete this post" });
		}
        if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(request.params.id);

		response.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(`Error in deletePost controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
    }

}

export const createComment =  async (request, response) => {
    try {
		const { text } = request.body;
		const postId = request.params.id;
		const userId = request.user._id;

		if (!text) {
			return response.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return response.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		response.status(200).json(post);
	} catch (error) {
		console.log("Error in create comment controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}

}

export const likeUnlikePost = async (request, response) => {
    try {
		const userId = request.user._id;
		const { id: postId } = request.params;

		const post = await Post.findById(postId);

		if (!post) {
			return response.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			response.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			response.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		response.status(500).json({ error: "Internal server error" });
	}
}

export const getAllPosts = async (request, response) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return response.status(200).json([]);
		}

		response.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		response.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (request, response) => {
	try {
		const userId = request.params.id;
		const user = await User.findById(userId);

		if (!user) return response.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		response.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		response.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (request, response) => {
	try {
		const userId = request.user._id;
		const user = await User.findById(userId);

		if (!user) return response.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		response.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		response.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (request, response) => {
	try {
		const { username } = request.params;

		const user = await User.findOne({ username });
		if (!user) return response.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		response.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		response.status(500).json({ error: "Internal server error" });
	}
};