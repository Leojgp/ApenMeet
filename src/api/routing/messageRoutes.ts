import express from 'express';
import { getAllMessages, createMessage, getMessagesByPlan } from '../controllers/messageController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.get('/', getAllMessages);
router.get('/:planId', authenticateToken, getMessagesByPlan);
router.post('/', createMessage);

export default router;
