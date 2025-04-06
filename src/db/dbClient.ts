import mongoose from 'mongoose';


const uri =process.env.DB_KEY;

const connectDB = async (): Promise<void> => {
  if (!uri) {
    throw new Error('La URL de la base de datos no está definida en las variables de entorno');
  }
  try {
    await mongoose.connect(uri);
    console.log('Conectado a la base de datos con Mongoose');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
};

export { connectDB };