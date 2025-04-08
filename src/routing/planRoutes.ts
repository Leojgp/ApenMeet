import express from 'express';
import { getAllPlans, createPlan, getPlanById, getPlansByUsername, joinPlan, leavePlan, updatePlan, cancelPlan } from '../controllers/planController';

const router = express.Router();

router.get('/', getAllPlans);
router.post('/', createPlan);
router.get('/user/:username', getPlansByUsername);
router.get('/:id', getPlanById);
router.post('/:id/join', joinPlan);
router.post('/:id/leave', leavePlan);
router.put('/:id', updatePlan);
router.delete('/:id', cancelPlan);


export default router;
