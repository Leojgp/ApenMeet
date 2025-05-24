import { Request, Response } from 'express';
import { Message } from '../../db/models/Message';
import { Plan } from '../../db/models/Plan';

export const getAllMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await Message.find().populate('senderId', 'username').populate('receiverId', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).send('Error al obtener los mensajes');
  }
};

export const getMessagesByPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const userId = (req as any).user._id;

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    const isCreator = plan.creatorId.toString() === userId;
    
    let joinedAt: Date | null = null;
    if (!isCreator) {
      const participant = plan.participants.find(p => p.id.toString() === userId);
      if (!participant) {
        res.status(403).json({ error: 'No eres participante de este plan' });
        return;
      }
      joinedAt = participant.joinedAt;
    }

    const query: any = { planId };
    if (!isCreator && joinedAt) {
      query.createdAt = { $gte: joinedAt };
    }

    const messages = await Message.find(query)
      .populate('sender._id', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error al obtener mensajes del plan:', err);
    res.status(500).json({ error: 'Error al obtener los mensajes del plan' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).send('Error al crear el mensaje');
  }
};
