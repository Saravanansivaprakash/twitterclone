import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protectRoute = async (request, response, next) => {
 try {
    const token = request.cookies.jwt
    if (!token) {
        return response.status(404).json({error: "unauthorized: No token Provided"})
    }
    const decode = jwt.verify(token, process.env.MY_SECRET_JWT_KEY)

    if (!decode) {
        return response.status(404).json({error: "unauthorized: Invalid Token"})
    }

   const user = await User.findOne({_id: decode.userId}).select("-password")

   if(!user) {
    return response.status(404).json({error: "User not found"})
   }

   request.user = user;
   next();

 } catch (error) {
    console.log(`error in protect Route middleware: ${error}`)
    response.status(500).json({error: "Internal server error"})
    
 }
}

export default protectRoute
