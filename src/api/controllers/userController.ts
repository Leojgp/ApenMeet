import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { User } from '../../db/models/User';
import bcrypt from 'bcryptjs';
import { RefreshToken } from '../../db/models/RefreshToken';


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
    const authenticatedUser = (req as any).user;

    if (!authenticatedUser || !authenticatedUser._id) {
      res.status(401).json({ error: 'Token inválido o no proporcionado' });
      return;
    }

    const user = await User.findById(authenticatedUser._id);

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
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

    await RefreshToken.deleteMany({ userId: user._id });

    const accessToken = generateAccesToken(userResponse, false);
    const refreshToken = jwt.sign(userResponse, process.env.REFRESH_TOKEN_SECRET || '');

    const tokenDoc = new RefreshToken({ token: refreshToken, userId: user._id });
    await tokenDoc.save();

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const getToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    res.sendStatus(401);
    return;
  }

  const tokenExists = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenExists) {
    res.sendStatus(403);
    return;
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || '', async (err:Error, userData: any) => {
    if (err) {
      res.sendStatus(403);
      return;
    }

    const user = await User.findById(userData._id);
    if (!user) {
      res.sendStatus(403);
      return;
    }

    const userForToken = {
      _id: user._id,
      username: user.username,
      email: user.email
    };

    const accessToken = generateAccesToken(userForToken, true);
    res.json({ accessToken });
  });
};

function generateAccesToken(user: any,isRefreshToken: boolean){
  return jwt.sign(
    { ...user, isRefreshToken, iat: Math.floor(Date.now() / 1000)}, 
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
  );
}

export const deleteRefreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.body.token;
  try {
    await RefreshToken.findOneAndDelete({ token });
    res.sendStatus(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el token' });
  }
};

