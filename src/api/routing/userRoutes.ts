import express from 'express';
import { deleteRefreshToken, getAllUsers, getToken, getUserData, loginUser, registerUser,  } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', authenticateToken, getUserData);
router.post('/login', loginUser );
router.post('/register', registerUser );
router.post('/token',getToken);
router.delete('/logout', deleteRefreshToken)

export default router;