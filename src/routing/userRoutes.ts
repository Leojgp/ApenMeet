import express from 'express';
import { getAllUsers, loginUser, registerUser,  } from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/login', loginUser );
router.post('/register', registerUser );

export default router;