import express from 'express';
import { getAllPlans, createPlan, getPlanById, getPlansByUsername, joinPlan, leavePlan, updatePlan, cancelPlan, addAdmin, removeAdmin, isAdmin } from '../controllers/planController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getAllPlans);
router.post('/', authenticateToken, upload.single('image'), createPlan);
router.get('/user/:username', getPlansByUsername);
router.get('/:id', getPlanById);
router.post('/:id/join', authenticateToken, joinPlan);
router.post('/:id/leave', authenticateToken, leavePlan);
router.put('/:id', authenticateToken, upload.single('image'), updatePlan);
router.put('/:id/cancel', authenticateToken, cancelPlan);

// Admin management routes
router.post('/:planId/admins/:userId', authenticateToken, addAdmin);
router.delete('/:planId/admins/:userId', authenticateToken, removeAdmin);
router.get('/:planId/is-admin', authenticateToken, isAdmin);

export default router;
