import { Request, Response } from 'express';
import { Plan } from '../../db/models/Plan';
import { User } from '../../db/models/User';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await Plan.find()
      .populate('creatorId', 'username')
      .populate('participants.id', 'username');
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
      imageUrl = (req.file as any).path;
      console.log('URL de la imagen subida:', imageUrl);
    }

    let coordinates = [0, 0];
    if (location.coordinates && Array.isArray(location.coordinates)) {
      coordinates = location.coordinates;
    }

    const newPlan = new Plan({
      title,
      description,
      location: {
        address: location.address,
        coordinates: coordinates
      },
      dateTime,
      maxParticipants,
      creatorId: authenticatedUser._id,
      creatorUsername: user.username,
      participants: [{
        id: new mongoose.Types.ObjectId(authenticatedUser._id),
        username: user.username
      }],
      admins: [{
        id: new mongoose.Types.ObjectId(authenticatedUser._id),
        username: user.username
      }],
      origin: 'user',
      createdAt: new Date(),
      status: 'open',
      imageUrl,
      tags: req.body.tags || []
    });

    await newPlan.save();

    const populatedPlan = await Plan.findById(newPlan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants.id', 'username profileImage')
      .populate('admins.id', 'username profileImage');

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
      .populate('participants.id', 'username')
      .populate('admins.id', 'username');
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

export const getUserParticipatingPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const plans = await Plan.find({
      $or: [
        { 'participants.id': authenticatedUser._id },
        { 'admins.id': authenticatedUser._id }
      ],
      status: { $ne: 'cancelled' }
    })
    .populate('creatorId', 'username')
    .populate('participants.id', 'username')
    .populate('admins.id', 'username');

    res.json(plans);
  } catch (err) {
    console.error('Error al obtener los planes del usuario:', err);
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

    if (plan.participants.some(p => p.id.toString() === authenticatedUser._id)) {
      res.status(400).json({ error: 'Ya eres participante de este plan' });
      return;
    }

    const user = await User.findById(authenticatedUser._id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    plan.participants.push({
      id: new mongoose.Types.ObjectId(authenticatedUser._id),
      username: user.username,
      joinedAt: new Date()
    });
    await plan.save();

    const updatedPlan = await Plan.findById(id)
      .populate('creatorId', 'username profileImage')
      .populate('participants.id', 'username profileImage')
      .populate('admins.id', 'username profileImage');

    res.status(200).json({
      message: 'Te has unido al plan con éxito',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error al unirse al plan:', error);
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

    if (!plan.participants.some(p => p.id.toString() === authenticatedUser._id)) {
      res.status(400).json({ error: 'No eres participante de este plan' });
      return;
    }

    if (plan.creatorId.toString() === authenticatedUser._id) {
      res.status(400).json({ error: 'Eres el creador del plan. Si deseas cancelarlo, usa la función cancelar' });
      return;
    }

    plan.participants = plan.participants.filter(p => p.id.toString() !== authenticatedUser._id);
    await plan.save();

    const updatedPlan = await Plan.findById(id)
      .populate('creatorId', 'username profileImage')
      .populate('participants.id', 'username profileImage')
      .populate('admins.id', 'username profileImage');

    res.status(200).json({
      message: 'Has abandonado el plan con éxito',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error al abandonar el plan:', error);
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

    if (!plan.admins.some(admin => admin.id.toString() === authenticatedUser._id)) {
      res.status(403).json({ error: 'No tienes permisos para actualizar este plan' });
      return;
    }

    const updateData: any = { ...req.body };

    if (req.file) {
      if (plan.imageUrl && !plan.imageUrl.includes('depositphotos')) {
      }
      updateData.imageUrl = (req.file as any).path;
      console.log('URL de la imagen actualizada:', updateData.imageUrl);
    }

    if (updateData.location && updateData.location.coordinates) {
      updateData.location.coordinates = updateData.location.coordinates;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { $set: updateData },
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

    if (!mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'IDs inválidos' });
      return;
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    if (!plan.admins.some(admin => admin.id.toString() === authenticatedUser._id)) {
      res.status(403).json({ error: 'No tienes permisos para añadir administradores' });
      return;
    }

    if (plan.admins.some(admin => admin.id.toString() === userId)) {
      res.status(400).json({ error: 'El usuario ya es administrador' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    plan.admins.push({
      id: new mongoose.Types.ObjectId(userId),
      username: user.username
    });
    await plan.save();

    res.status(200).json({ message: 'Administrador añadido con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir administrador' });
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
