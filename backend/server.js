import  express from 'express';
import dotenv from 'dotenv';
import cookiesParser from 'cookie-parser';
import cors from 'cors';
import cloudinary from 'cloudinary';
import path from 'path';

import connectDB from './db/connectDB.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'


const app = express();


dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

const port = process.env.PORT || 3500
const __dirname = path.resolve();


app.use(express.json({
    limit: "5mb"
}))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(cookiesParser())
app.use(express.urlencoded({
    extended: true
}))



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/build")));
    app.use("*",(request, response) => {
        response.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    })
}

app.listen(port, () => {
    console.log(`server is running at ${port}`)
    connectDB()
})
