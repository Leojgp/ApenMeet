import { Request, Response } from 'express';
import { Plan } from '../../db/models/Plan';
import { User } from '../../db/models/User';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

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

    let imageUrl = 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newPlan = new Plan({
      ...req.body,
      creatorId: authenticatedUser._id,
      participants: [authenticatedUser._id],
      admins: [authenticatedUser._id],
      origin: 'user',
      createdAt: new Date(),
      status: 'open',
      imageUrl
    });

    await newPlan.save();

    const populatedPlan = await Plan.findById(newPlan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage')
      .populate('admins', 'username profileImage');

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
      .populate('participants', 'username')
      .populate('admins', 'username');
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

    if (!plan.admins.includes(authenticatedUser._id)) {
      res.status(403).json({ error: 'No tienes permisos para actualizar este plan' });
      return;
    }


    if (req.file) {
      if (plan.imageUrl && !plan.imageUrl.includes('depositphotos')) {
        const oldImagePath = path.join(__dirname, '..', '..', '..', plan.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    )
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage')
      .populate('admins', 'username profileImage');

    res.json({
      message: 'Plan actualizado con éxito',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    res.status(400).json({ error: 'Error al actualizar el plan' });
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

export const addAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, userId } = req.params;
    const authenticatedUser = (req as any).user;

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (!plan.admins.some(adminId => adminId.toString() === authenticatedUser._id.toString())) {
      res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user._id) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userIdString = user._id.toString();
    if (!plan.participants.some(participantId => participantId.toString() === userIdString)) {
      res.status(400).json({ error: 'El usuario debe ser participante del plan' });
      return;
    }

    if (plan.admins.some(adminId => adminId.toString() === userIdString)) {
      res.status(400).json({ error: 'El usuario ya es administrador' });
      return;
    }

    plan.admins.push(new mongoose.Types.ObjectId(userIdString));
    await plan.save();

    const populatedPlan = await Plan.findById(plan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage')
      .populate('admins', 'username profileImage');

    res.json({
      message: 'Administrador añadido con éxito',
      plan: populatedPlan
    });
  } catch (error) {
    console.error('Error al añadir administrador:', error);
    res.status(400).json({ error: 'Error al añadir administrador' });
  }
};

export const removeAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, userId } = req.params;
    const authenticatedUser = (req as any).user;

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (!plan.admins.some(adminId => adminId.toString() === authenticatedUser._id.toString())) {
      res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
      return;
    }

    if (plan.creatorId.toString() === userId) {
      res.status(400).json({ error: 'No se puede eliminar al creador como administrador' });
      return;
    }

    plan.admins = plan.admins.filter(adminId => adminId.toString() !== userId);
    await plan.save();

    const populatedPlan = await Plan.findById(plan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage')
      .populate('admins', 'username profileImage');

    res.json({
      message: 'Administrador eliminado con éxito',
      plan: populatedPlan
    });
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    res.status(400).json({ error: 'Error al eliminar administrador' });
  }
};

export const isAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const authenticatedUser = (req as any).user;

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    const isUserAdmin = plan.admins.some(adminId => adminId.toString() === authenticatedUser._id.toString());
    res.json({ isAdmin: isUserAdmin });
  } catch (error) {
    console.error('Error al verificar administrador:', error);
    res.status(400).json({ error: 'Error al verificar administrador' });
  }
};
