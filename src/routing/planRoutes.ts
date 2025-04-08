import express from 'express';
import { getAllPlans, createPlan, getPlanById, getPlansByUsername } from '../controllers/planController';

const router = express.Router();

router.get('/', getAllPlans);
router.post('/', createPlan);
router.get('/user/:username', getPlansByUsername);
router.get('/:id', getPlanById);

export default router;
