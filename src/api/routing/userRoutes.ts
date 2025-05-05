import express from 'express';
import { deleteRefreshToken, getAllUsers, getToken, getUserData, loginUser, registerUser, updateUserData } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', authenticateToken, getUserData);
router.patch('/me', authenticateToken, upload.single('profileImage'), updateUserData);
router.post('/login', loginUser );
router.post('/register', registerUser );
router.post('/token',getToken);
router.delete('/logout', deleteRefreshToken)

export default router;