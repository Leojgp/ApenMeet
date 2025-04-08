import { Request, Response } from 'express';
import { Plan } from '../db/models/Plan';
import { User } from '../db/models/User';

export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await Plan.find().populate('creatorId', 'username').populate('participants', 'username');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los planes' });
  }
};


export const createPlan = async (req: Request, res: Response) => {
  try {
    const newPlan = new Plan(req.body);
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el plan' });
  }
};


export const getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
      const plan = await Plan.findById(req.params.id)
        .populate('creatorId', 'username')
        .populate('participants', 'username');
  
      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
      }
  
      res.json(plan);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el plan' });
    }
  };

  export const getPlansByUsername = async (req: Request, res: Response): Promise<void>  => {
    try {
      const {username} = req.params;

      if (!username) {
        res.status(400).json({ error: 'Nombre de usuario requerido' });
        return;
      }

      const user = await User.findOne({ username });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
  
      const filter = { creatorId: user._id };

      const plans = await Plan.find(filter)
      
      res.json(plans);
    } catch (err) {
      console.error('Error al obtener planes por username:', err);
      res.status(500).json({ error: 'Error al obtener los planes del usuario' });
    }
  };