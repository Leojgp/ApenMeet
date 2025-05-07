import express from 'express';
import { deleteRefreshToken, getAllUsers, getToken, getUserData, loginUser, registerUser, updateUserData } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', authenticateToken, getUserData);
router.patch('/me', authenticateToken, upload.single('profileImage'), handleMulterError, updateUserData);
router.post('/login', loginUser);
router.post('/register', upload.single('profileImage'), handleMulterError, registerUser);
router.post('/token', getToken);
router.delete('/logout', deleteRefreshToken);

export default router;