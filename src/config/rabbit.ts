// Criando a conexão com o rabbitMQ
import amqplib from 'amqplib';
import { config } from 'dotenv';
config();

const RABBITMQ_URL = process.env.RABBITMQ_URL

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    console.log('🐰 Conectado ao RabbitMQ');
    return { connection, channel }
  } catch (error) {
    console.error('Erro ao conectar no RabbitMQ', error);
  }
}