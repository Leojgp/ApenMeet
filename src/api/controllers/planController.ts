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
    res.status(500).json({ error: 'Error getting plans' });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { title, description, location, dateTime, maxParticipants } = req.body;
    if (!title || !description || !location || !dateTime || !maxParticipants) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const user = await User.findById(authenticatedUser._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    let imageUrl = 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg';
    if (req.file) {
      imageUrl = (req.file as any).path;
    }
    let coordinates = [0, 0];
    if (location.coordinates && Array.isArray(location.coordinates)) {
      coordinates = location.coordinates;
    }
    let tags: string[] = [];
    if (req.body['tags[]']) {
      tags = Array.isArray(req.body['tags[]']) 
        ? req.body['tags[]'] 
        : [req.body['tags[]']];
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
      tags
    });
    await newPlan.save();
    const populatedPlan = await Plan.findById(newPlan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants.id', 'username profileImage')
      .populate('admins.id', 'username profileImage');
    res.status(201).json({
      message: 'Plan created successfully',
      plan: populatedPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(400).json({ error: 'Error creating plan' });
  }
};

export const getPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('creatorId', 'username')
      .populate('participants.id', 'username')
      .populate('admins.id', 'username');
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Error getting plan' });
  }
};

export const getPlansByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const plans = await Plan.find({ creatorId: user._id });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Error getting user plans' });
  }
};

export const getUserParticipatingPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser) {
      res.status(401).json({ error: 'User not authenticated' });
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
    console.error('Error fetching user plans:', err);
    res.status(500).json({ error: 'Error fetching user plans' });
  }
};

export const joinPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    if (plan.status !== 'open') {
      res.status(400).json({ error: 'This plan is not open for joining' });
      return;
    }
    if (plan.participants.length >= plan.maxParticipants) {
      res.status(400).json({ error: 'Plan is full, no more participants allowed' });
      return;
    }
    if (plan.participants.some(p => p.id.toString() === authenticatedUser._id)) {
      res.status(400).json({ error: 'You are already a participant in this plan' });
      return;
    }
    const user = await User.findById(authenticatedUser._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
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
      message: 'Successfully joined the plan',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error joining plan:', error);
    res.status(500).json({ error: 'Error joining plan' });
  }
};
  

export const leavePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    if (!plan.participants.some(p => p.id.toString() === authenticatedUser._id)) {
      res.status(400).json({ error: 'You are not a participant in this plan' });
      return;
    }

    if (plan.creatorId.toString() === authenticatedUser._id) {
      res.status(400).json({ error: 'You are the plan creator. If you want to cancel it, use the cancel function' });
      return;
    }

    plan.participants = plan.participants.filter(p => p.id.toString() !== authenticatedUser._id);
    await plan.save();

    const updatedPlan = await Plan.findById(id)
      .populate('creatorId', 'username profileImage')
      .populate('participants.id', 'username profileImage')
      .populate('admins.id', 'username profileImage');

    res.status(200).json({
      message: 'Has abandoned the plan successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error abandoning plan:', error);
    res.status(500).json({ error: 'Error abandoning plan' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    if (!plan.admins.some(admin => admin.id.toString() === authenticatedUser._id)) {
      res.status(403).json({ error: 'You do not have permission to update this plan' });
      return;
    }
    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.dateTime) updateData.dateTime = new Date(req.body.dateTime);
    if (req.body.maxParticipants) updateData.maxParticipants = parseInt(req.body.maxParticipants);
    if (req.body.location) {
      try {
        const locationData = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
        if (locationData.address && Array.isArray(locationData.coordinates)) {
          updateData.location = {
            address: locationData.address,
            coordinates: locationData.coordinates
          };
        }
      } catch (e) {
        console.error('Error processing location:', e);
        res.status(400).json({ error: 'Invalid location format' });
        return;
      }
    }
    const tagsData = req.body['tags[]'] || req.body.tags;
    if (tagsData) {
      updateData.tags = Array.isArray(tagsData) 
        ? tagsData 
        : [tagsData];
    }
    if (req.file) {
      if (plan.imageUrl && !plan.imageUrl.includes('depositphotos')) {
        // TODO: Delete old image
      }
      updateData.imageUrl = (req.file as any).path;
    }
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate('creatorId', 'username profileImage')
      .populate('participants.id', 'username profileImage')
      .populate('admins.id', 'username profileImage');
    res.json({
      message: 'Plan updated successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(400).json({ error: 'Error updating plan' });
  }
};

export const cancelPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    if (plan.creatorId.toString() !== authenticatedUser._id) {
      res.status(403).json({ error: 'You do not have permission to cancel this plan' });
      return;
    }
    plan.status = 'cancelled';
    await plan.save();
    res.status(200).json({ message: 'Plan cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling plan' });
  }
};

export const addAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, userId } = req.params;
    console.log('IDs recibidos:', { planId, userId });
    const authenticatedUser = (req as any).user;
    
    if (!mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log('IDs inválidos:', { planId, userId });
      res.status(400).json({ error: 'Invalid IDs' });
      return;
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      console.log('Plan no encontrado:', planId);
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('Usuario no encontrado:', userId);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!plan.admins.some(admin => admin.id.toString() === authenticatedUser._id)) {
      res.status(403).json({ error: 'You do not have permission to add administrators' });
      return;
    }

    if (plan.admins.some(admin => admin.id.toString() === userId)) {
      res.status(400).json({ error: 'User is already an administrator' });
      return;
    }

    console.log('Antes de añadir admin:', plan.admins);
    plan.admins.push({
      id: new mongoose.Types.ObjectId(userId),
      username: user.username
    });
    console.log('Después de añadir admin:', plan.admins);
    await plan.save();
    res.status(200).json({ message: 'Administrator added successfully' });
  } catch (error) {
    console.error('Error en addAdmin:', error);
    res.status(500).json({ error: 'Error adding administrator' });
  }
};

export const removeAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, userId } = req.params;
    const authenticatedUser = (req as any).user;
    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    if (!plan.admins.some(admin => admin.id.toString() === authenticatedUser._id.toString())) {
      res.status(403).json({ error: 'You do not have permission to perform this action' });
      return;
    }
    if (plan.creatorId.toString() === userId) {
      res.status(400).json({ error: 'Cannot remove the creator as administrator' });
      return;
    }
    plan.admins = plan.admins.filter(admin => admin.id.toString() !== userId);
    await plan.save();
    const populatedPlan = await Plan.findById(plan._id)
      .populate('creatorId', 'username profileImage')
      .populate('participants', 'username profileImage')
      .populate('admins', 'username profileImage');
    res.json({
      message: 'Administrator removed successfully',
      plan: populatedPlan
    });
  } catch (error) {
    console.error('Error removing administrator:', error);
    res.status(400).json({ error: 'Error removing administrator' });
  }
};

export const isAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const authenticatedUser = (req as any).user;

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const isUserAdmin = plan.admins.some(adminId => adminId.toString() === authenticatedUser._id.toString());
    res.json({ isAdmin: isUserAdmin });
  } catch (error) {
    console.error('Error verifying administrator:', error);
    res.status(400).json({ error: 'Error verifying administrator' });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    if (!plan.admins.some(admin => admin.id.toString() === authenticatedUser._id)) {
      res.status(403).json({ error: 'You do not have permission to delete this plan' });
      return;
    }
    await Plan.findByIdAndDelete(id);
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Error deleting plan' });
  }
};
