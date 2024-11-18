import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'
import bcrypt from 'bcryptjs'

export const signup = async (request, response) => {
    try {
        const {username, fullName, email, password} = request.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return response.status(404).json({error: "Invalid email Format"})
        }
        const exsitingEmail =  await User.findOne({email});
        const exsitingUserName = await User.findOne({username});

        if(exsitingEmail || exsitingUserName) {
            return response.status(404).json({error: "Already Existing user or email"})
        }

        //password Validation
        if(password.length < 6 ) {
            return response.status(404).json({error: "Password must have atleast 6 char length"})
        }

        const salt = await bcrypt.genSalt(10);
        const hasedPassword =  await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullName,
            email,
            password: hasedPassword,
        })
        if (newUser) {
            generateToken(newUser._id, response)
            await newUser.save();
            response.status(200).json({
                _id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link,
            })
        } else {
            response.status(404).json({error: "Invalid User Data"})
        }


    } catch (error) {
        console.log(`Error in signup controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
        
    }
}

export const login = async (request, response) => {
    try {
        const {username, password} = request.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user.password || "")

        if (!user || !isPasswordCorrect){
            return response.status(404).json({error: "Invalid username or password"})
        }
        //console.log(request.headers.origin)
        generateToken(user._id, response, request)
        response.status(200).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
            bio: user.bio,
            link: user.link,
        })

    } catch (error) {
        console.log(`Error in login controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
        
    }
}

export const logout = async (request, response) => {
   try {
        response.cookie("jwt", "", {maxAge: 0});
        response.status(200).json({message: "logout successfully"})
    
   } catch (error) {
        console.log(`Error in logout controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
   }
}

export const getMe = async (request, response) => {
    try {
        const user = await User.findOne({_id: request.user.id}).select("-password");
        response.status(200).json(user);
        
    } catch (error) {
        console.log(`Error in getme controller: ${error}`)
        response.status(500).json({error: "Internal Server Error"})
    }
}

