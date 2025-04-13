import { Request, Response } from 'express';
import { User } from '../db/models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

export const getUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const authenticatedUser = (req as any).user;

    if (!authenticatedUser || authenticatedUser.username !== user.username) {
      res.status(403).json({ error: 'Acceso denegado. Usuario no autenticado' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Error al obtener los datos del usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor al obtener los datos del usuario' });
  }
};

// Registro
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      username, 
      email, 
      password, 
      bio, 
      location, 
      interests, 
      profileImage, 
      rating, 
      isVerified 
    } = req.body;

    if (!username || !email || !password || !location || !interests) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ message: 'El nombre de usuario o email ya está en uso' });
      return;
    }

// Encriptación de la contraseña porque no puedo guardarla en texto plano
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
      bio: bio || '',
      location: {
        city: location.city || '',
        coordinates: location.coordinates || [0, 0],
      },
      interests: interests || [],
      profileImage: profileImage || '',
      rating: rating || 0,
      isVerified: isVerified || false,
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
    if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash); 
    if (!passwordMatch) {
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
