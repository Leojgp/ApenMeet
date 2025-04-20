import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      res.status(401).json({ message: 'Token no proporcionado' });
      return;
    }
  
    jwt.verify(token, JWT_SECRET || '', (err: Error | null, user: any) => {
      if (err) {
        res.status(403).json({ message: 'Token no válido', error: err.message });
        return;
      }

      console.log('Payload del token:', user);
  
      (req as any).user = user;
      next();
    });
  }
