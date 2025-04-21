import { Request, Response } from 'express';
import { Message } from '../../db/models/Message';


export const getAllMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await Message.find().populate('senderId', 'username').populate('receiverId', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).send('Error al obtener los mensajes');
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
