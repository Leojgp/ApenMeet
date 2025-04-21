import { Request, Response } from 'express';
import { Plan } from '../../db/models/Plan';
import { User } from '../../db/models/User';
import mongoose from 'mongoose';

export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await Plan.find().populate('creatorId', 'username').populate('participants', 'username');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los planes' });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;

    const { title, description, location, dateTime, maxParticipants } = req.body;

    if (!title || !description || !location || !dateTime || !maxParticipants) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const user = await User.findById(authenticatedUser._id);
    if (!user) {
      res.status(404).json({ error: 'Usuario creador no encontrado' });
      return;
    }

    const newPlan = new Plan({
      ...req.body,
      creatorId: authenticatedUser._id,
      participants: [authenticatedUser._id],
      origin: 'user',
      createdAt: new Date(),
      status: 'open'
    });

    await newPlan.save();

    const populatedPlan = await Plan.findById(newPlan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage');

    res.status(201).json({
      message: 'Plan creado con éxito',
      plan: populatedPlan
    });
  } catch (error) {
    console.error('Error al crear plan:', error);
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
      return;
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el plan' });
  }
};

export const getPlansByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    if (!username) {
      res.status(400).json({ error: 'Nombre de usuario requerido' });
      return;
    }
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const plans = await Plan.find({ creatorId: user._id });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los planes del usuario' });
  }
};

export const joinPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'ID de plan inválido' });
      return;
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (plan.status !== 'open') {
      res.status(400).json({ error: 'Este plan no está abierto para unirse' });
      return;
    }

    if (plan.participants.length >= plan.maxParticipants) {
      res.status(400).json({ error: 'Plan completo, no se permiten más participantes' });
      return;
    }

    if (plan.participants.some(p => p.toString() === authenticatedUser._id)) {
      res.status(400).json({ error: 'Ya eres participante de este plan' });
      return;
    }

    plan.participants.push(new mongoose.Types.ObjectId(authenticatedUser._id));
    await plan.save();

    const updatedPlan = await Plan.findById(id)
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage');

    res.status(200).json({
      message: 'Te has unido al plan con éxito',
      plan: updatedPlan
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al unirse al plan' });
  }
};
  

export const leavePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'ID de plan inválido' });
      return;
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (!plan.participants.some(p => p.toString() === authenticatedUser._id.toString())) {
      res.status(400).json({ error: `No eres participante de este plan ${authenticatedUser._id}` });
      return;
    }

    if (plan.creatorId.toString() === authenticatedUser._id) {
      res.status(400).json({ error: 'Eres el creador del plan. Si deseas cancelarlo, usa la función cancelar' });
      return;
    }

    plan.participants = plan.participants.filter(p => p.toString() !== authenticatedUser._id);
    await plan.save();

    res.status(200).json({ message: 'Has abandonado el plan con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al abandonar el plan' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'ID de plan inválido' });
      return;
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (plan.creatorId.toString() !== authenticatedUser._id) {
      res.status(403).json({ error: 'No tienes permiso para actualizar este plan' });
      return;
    }

    const { _id, creatorId, participants, createdAt, origin, ...updateData } = req.body;

    if (updateData.maxParticipants && updateData.maxParticipants < plan.participants.length) {
      res.status(400).json({ error: 'No puedes reducir el número máximo de participantes por debajo del número actual' });
      return;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('creatorId', 'username profileImage')
     .populate('participants', 'username profileImage');

    res.status(200).json({
      message: 'Plan actualizado con éxito',
      plan: updatedPlan
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el plan' });
  }
};

export const cancelPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'ID de plan inválido' });
      return;
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (plan.creatorId.toString() !== authenticatedUser._id) {
      res.status(403).json({ error: 'No tienes permiso para cancelar este plan' });
      return;
    }

    plan.status = 'cancelled';
    await plan.save();

    res.status(200).json({ message: 'Plan cancelado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar el plan' });
  }
};
