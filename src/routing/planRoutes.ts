import express from 'express';
import { getAllPlans, createPlan, getPlanById } from '../controllers/planController';

const router = express.Router();

router.get('/', getAllPlans);
router.post('/', createPlan);
router.get('/:id', getPlanById);

export default router;
