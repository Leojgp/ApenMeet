import { Request, Response } from 'express';
import { Plan } from '../db/models/Plan';

interface AuthRequest extends Request {
  user: {
    _id: string;
  };
}

export const getUserParticipatingPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const plans = await Plan.find({
      $or: [
        { participants: userId },
        { creator: userId }
      ]
    }).populate('creator', 'username');

    res.json(plans);
  } catch (error) {
    console.error('Error al obtener los planes:', error);
    res.status(500).json({ message: 'Error al obtener los planes' });
  }
};

export const getCreatedPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const plans = await Plan.find({ creator: userId });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los planes creados' });
  }
}; 