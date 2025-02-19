// Producer (Envia Mensagens)
import { connectRabbitMQ } from '../config/rabbit';

export const sendMessage = async (queue: string, message: any) => {
  const { channel } = await connectRabbitMQ();
  if (!channel) return

  await channel.assertQueue(queue, { drable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  console.log(`📤 Mensagem enviada para a fila ${queue}:`, message);
}

