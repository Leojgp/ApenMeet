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
      { error: 'Error fetching users' }
    );
  }
};

export const getUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;

    if (!authenticatedUser || !authenticatedUser._id) {
      res.status(401).json({ error: 'Invalid or missing token' });
      return;
    }

    const user = await User.findById(authenticatedUser._id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        profileImage: user.profileImage,
        rating: user.rating,
        isVerified: user.isVerified
      },
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Internal server error while fetching user data' });
  }
};

// Registration
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Request body completo:', req.body);
    console.log('Location fields:', {
      city: req.body['location[city]'],
      country: req.body['location[country]'],
      coordinates: req.body['location[coordinates][]'],
      formattedAddress: req.body['location[formattedAddress]'],
      postalCode: req.body['location[postalCode]'],
      region: req.body['location[region]'],
      timezone: req.body['location[timezone]']
    });

    const { 
      username, 
      email, 
      password, 
      bio, 
      interests 
    } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ message: 'Username or email already in use' });
      return;
    }

    // Password encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746874674/default_Profile_Image_oiw2nt.webp';
    if (req.file) {
      profileImage = (req.file as any).path;
    }

    const city = req.body.city || '';
    const country = req.body.country || '';
    const formattedAddress = req.body.formattedAddress || '';
    const postalCode = req.body.postalCode || '';
    const region = req.body.region || '';
    const timezone = req.body.timezone || '';
    const coordinates = req.body.coordinates || [0, 0];

    const locationObj = {
      city,
      country,
      coordinates,
      formattedAddress,
      postalCode,
      region,
      timezone
    };

    console.log('Request body completo:', req.body);
    console.log('Location object constructed:', locationObj);

    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
      bio: bio || '',
      location: locationObj,
      interests: Array.isArray(interests) ? interests : interests.split(',').map((i: string) => i.trim()),
      profileImage,
      rating: 0,
      isVerified: false,
    });

    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio,
      location: newUser.location,
      interests: newUser.interests,
      profileImage: newUser.profileImage,
      rating: newUser.rating,
      isVerified: newUser.isVerified,
    };

    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, accessToken: googleAccessToken } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.authProvider === 'google') {
      if (!googleAccessToken) {
        res.status(400).json({ message: 'Google token is required for Google users' });
        return;
      }

      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${googleAccessToken}` }
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }

        const userData = await userInfoResponse.json();
        if (userData.email !== email) {
          res.status(401).json({ message: 'Invalid Google token' });
          return;
        }
      } catch (error) {
        res.status(401).json({ message: 'Invalid Google token' });
        return;
      }

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      };

      await RefreshToken.deleteMany({ userId: user._id });

      const jwtAccessToken = generateAccesToken(userResponse, false);
      const refreshToken = jwt.sign(userResponse, process.env.REFRESH_TOKEN_SECRET || '');

      const newTokenDoc = new RefreshToken({ 
        token: refreshToken, 
        userId: user._id,
        username: user.username 
      });
      await newTokenDoc.save();

      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        accessToken: jwtAccessToken,
        refreshToken
      });
      return;
    }

    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage
    };

    await RefreshToken.deleteMany({ userId: user._id });

    const jwtAccessToken = generateAccesToken(userResponse, false);
    const refreshToken = jwt.sign(userResponse, process.env.REFRESH_TOKEN_SECRET || '');

    const newTokenDoc = new RefreshToken({ 
      token: refreshToken, 
      userId: user._id,
      username: user.username 
    });
    await newTokenDoc.save();

    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      accessToken: jwtAccessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body.token;

    if (!refreshToken) {
      res.status(401).json({ message: 'Token not provided' });
      return;
    }

    const tokenExists = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenExists) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || '', async (err: Error, userData: any) => {
      if (err) {
        res.status(403).json({ message: 'Invalid token' });
        return;
      }

      const user = await User.findById(userData._id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
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
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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

export const updateUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || !authenticatedUser._id) {
      res.status(401).json({ error: 'Invalid or missing token' });
      return;
    }

    const user = await User.findById(authenticatedUser._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { username, email, password, bio, location, interests } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (interests) user.interests = Array.isArray(interests) ? interests : interests.split(',').map((i:string) => i.trim());

    if (req.file) {
      user.profileImage = (req.file as any).path;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        profileImage: user.profileImage,
        rating: user.rating,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Error updating user data:', err);
    res.status(500).json({ error: 'Internal server error while updating user data' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    console.log('Access Token recibido:', accessToken);
    
    if (!accessToken) {
      res.status(400).json({ message: 'No access token provided' });
      return;
    }


    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userData = await userInfoResponse.json();
    console.log('Información del usuario de Google:', userData);

    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = new User({
        username: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        bio: '',
        location: {
          city: 'Granada',
          country: 'Spain',
          coordinates: [-3.6023, 37.1765],
          formattedAddress: 'Granada, Spain',
          postalCode: '18001',
          region: 'Andalusia',
          timezone: 'Europe/Madrid'
        },
        interests: [],
        profileImage: userData.picture || 'https://res.cloudinary.com/dbfh8wmqt/image/upload/v1746874674/default_Profile_Image_oiw2nt.webp',
        rating: 0,
        isVerified: true,
        joinedAt: new Date(),
        authProvider: 'google'
      });

      user = await newUser.save();
      console.log('Usuario creado:', user);
    } else {
      // Si el usuario existe, actualizamos su información y establecemos authProvider como google
      user.authProvider = 'google';
      user.profileImage = userData.picture || user.profileImage;
      user.username = userData.name || user.username;
      await user.save();
      console.log('Usuario actualizado:', user);
    }

    // Generamos los tokens
    const userForToken = {
      _id: user._id,
      username: user.username,
      email: user.email
    };

    const jwtAccessToken = jwt.sign(
      { ...userForToken, isRefreshToken: false, iat: Math.floor(Date.now() / 1000) },
      process.env.ACCESS_TOKEN_SECRET || '',
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      userForToken,
      process.env.REFRESH_TOKEN_SECRET || '',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    );

    // Guardamos el refresh token
    await RefreshToken.deleteMany({ userId: user._id });
    const newTokenDoc = new RefreshToken({ 
      token: refreshToken, 
      userId: user._id,
      username: user.username 
    });
    await newTokenDoc.save();

    // Devolvemos la información del usuario y los tokens
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        profileImage: user.profileImage,
        rating: user.rating,
        isVerified: user.isVerified,
        joinedAt: user.joinedAt,
        authProvider: user.authProvider
      },
      accessToken: jwtAccessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
}; 

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params; 

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      profileImage: user.profileImage,
      rating: user.rating,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ error: 'Internal server error while fetching user data' });
  }
};

