import express from 'express';
import { getAllPlans, createPlan, getPlanById, getPlansByUsername, joinPlan, leavePlan, updatePlan, cancelPlan, addAdmin, removeAdmin, isAdmin, getUserParticipatingPlans, deletePlan, getPlansByLocation, removeParticipant, getPlansByUserId } from '../controllers/planController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/location', getPlansByLocation);
router.get('/', getAllPlans);
router.post('/', authenticateToken, upload.single('image'), handleMulterError, createPlan);
router.get('/user/:userId', authenticateToken, getPlansByUserId);
router.get('/created-by/:username', getPlansByUsername);
router.get('/participating', authenticateToken, getUserParticipatingPlans);
router.get('/:id', getPlanById);
router.post('/:id/join', authenticateToken, joinPlan);
router.post('/:id/leave', authenticateToken, leavePlan);
router.put('/:id', authenticateToken, upload.single('image'), handleMulterError, updatePlan);
router.put('/:id/cancel', authenticateToken, cancelPlan);

// Admin management routes
router.post('/:planId/admins/:userId', authenticateToken, addAdmin);
router.delete('/:planId/admins/:userId', authenticateToken, removeAdmin);
router.get('/:planId/is-admin', authenticateToken, isAdmin);

router.delete('/:id', authenticateToken, deletePlan);
router.delete('/:planId/participants/:participantUserId/remove', authenticateToken, removeParticipant);

export default router;
