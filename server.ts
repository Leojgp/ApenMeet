import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import userRoutes from './src/api/routing/userRoutes';
import reviewRoutes from './src/api/routing/reviewRoutes';
import planRoutes from './src/api/routing/planRoutes';
import messageRoutes from './src/api/routing/messageRoutes';
import { SocketServer } from './src/websocket/chat';
import scrapingRoutes from './src/api/routing/scrapingRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());


app.use(express.json());


const server = http.createServer(app);
const chatServer = new SocketServer(server);

app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/scraping', scrapingRoutes);

const swaggerPath = path.join(__dirname, 'swagger.yaml');
const swaggerDocument = require('yamljs').load(swaggerPath);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mongoose.connect(process.env.DB_KEY!)
  .then(() => {
    console.log('Conectado a MongoDB');
    server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));
