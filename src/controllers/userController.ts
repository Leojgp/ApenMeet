import { NextFunction, Request, Response } from 'express';
import { User } from '../db/models/User';
import dotenv from 'dotenv';

dotenv.config();
const jwt = require('jsonwebtoken');

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);

  }
  catch (err) {
    res.status(500).json(
      { error: 'Error al obtener los usuarios' }
    );
  }
};



// Registro
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ message: 'El nombre de usuario o email ya está en uso' });
      return;
    }

    const newUser = new User({
      username,
      email,
      passwordHash: password,
    });

    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };

    res.status(201).json({ message: 'Usuario registrado con éxito', user: userResponse });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Inicio de sesión
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email/usuario y contraseña son requeridos' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || user.passwordHash !== password) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    const accesToken = jwt.sign(userResponse, process.env.ACCESS_TOKEN_SECRET || '');
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      accesToken: accesToken,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

