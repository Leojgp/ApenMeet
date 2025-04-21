import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './src/api/routing/userRoutes';
import reviewRoutes from './src/api/routing/reviewRoutes';
import planRoutes from './src/api/routing/planRoutes';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/plans', planRoutes);


mongoose.connect(process.env.DB_KEY!)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));