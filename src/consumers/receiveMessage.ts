import { connectRabbitMQ } from '../config/rabbit';

export const consumeMessages = async (queue: string) => {
  const { channel } = await connectRabbitMQ();
  if (!channel) return;

  await channel.assertQueue(queue, { durable: true });
  console.log(`📥 Aguardando mensagens na fila ${queue}...`);

  channel.consume(queue, (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log(`✅ Mensagem recebida:`, content);
      // Aqui você pode acionar o RPA ou outro processamento
      channel.ack(msg);
    }

  })
}