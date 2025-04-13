import express from 'express';
import { getAllUsers, getUserData, loginUser, registerUser,  } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', authenticateToken, getUserData);
router.post('/login', loginUser );
router.post('/register', registerUser );

export default router;