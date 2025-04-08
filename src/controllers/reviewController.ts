import { Request, Response } from 'express';
import { Review } from '../db/models/Review';


export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find().populate('userId', 'username');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
};


export const createReview = async (req: Request, res: Response) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear la reseña' });
  }
};
