import express from 'express';
import { getAllReviews, createReview } from '../controllers/reviewController';

const router = express.Router();

router.get('/', getAllReviews);
router.post('/', createReview);

export default router;
