import  express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { getProfile, followUnfollowUser, getSuggestedUsers, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get("/profile/:username", protectRoute, getProfile);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.get('/suggested', protectRoute, getSuggestedUsers)
router.post('/update', protectRoute, updateUser)

export default router
