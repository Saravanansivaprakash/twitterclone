import jwt from 'jsonwebtoken';

const generateToken = (userId, response, request) => {
 const token = jwt.sign({userId}, process.env.MY_SECRET_JWT_KEY, {
   expiresIn: "15d"
 });
 

 
 response.cookie("jwt" , token, {
    maxAge : 15*24*60*60*1000, 
    httpOnly : true , // xss attacks
    sameSite : "strict", //csrf attacks
    secure : process.env.NODE_ENV !== " development"
 })
}

export default generateToken;