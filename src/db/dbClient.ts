import mongoose from 'mongoose';


const uri = process.env.DB_KEY;

export const connectDB = async (): Promise<void> => {
  if (!uri) {
    console.error('Error: La variable de entorno DB_KEY no está definida');
    console.error('Asegúrate de tener un archivo .env con la variable DB_KEY');
    throw new Error('La URL de la base de datos no está definida en las variables de entorno');
  }

  try {

    await mongoose.connect(uri);
    console.log('Conectado a MongoDB con éxito');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error al desconectar de MongoDB:', error);
  }
};