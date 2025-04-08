import express from 'express';
import { getAllMessages, createMessage } from '../controllers/messageController';

const router = express.Router();

router.get('/', getAllMessages);
router.post('/', createMessage);

export default router;
