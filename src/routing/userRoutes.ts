import express from 'express';
import { authenticateToken, getAllUsers, getUserData, loginUser, registerUser,  } from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', authenticateToken,getUserData);
router.post('/login', loginUser );
router.post('/register', registerUser );

export default router;