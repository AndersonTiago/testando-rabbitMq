
import { connectRabbitMQ } from '@/config/rabbit';
import { searchGoogle } from '@/rpa/googleSearch';

//Essa forma não espera uma tarefa ser completada para iniciar a próxima
/*
export const consumeMessages = async (queue: string) => {
  const { channel } = await connectRabbitMQ();
  if (!channel) return;

  await channel.assertQueue(queue, { durable: true });
  console.log(`📥 Aguardando mensagens na fila ${queue}...`);

  channel.consume(queue, async (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log(`✅ Mensagem recebida:`, content);
      // Aqui você pode acionar o RPA ou outro processamento
      if (content.task === 'search' && content.query) {
        await searchGoogle(content.query);
      } else {
        console.log('❌ Mensagem inválida');
      }

      channel.ack(msg);
    }

  })
}
*/

// Aqui o processo é realizado um por vez
/*
export const consumeMessages = async () => {
  const rabbitMQ = await connectRabbitMQ();
  if (!rabbitMQ) return;

  const { channel } = rabbitMQ;

  await channel.assertQueue('rpa-tasks', { durable: true });

  // 🛑 Define que o RabbitMQ só enviará 1 mensagem por vez
  channel.prefetch(1);

  console.log('📥 Aguardando mensagens na fila rpa-tasks...');

  channel.consume('rpa-tasks', async (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      console.log('✅ Executando tarefa:', content);

      if (content.task === 'search' && content.query) {
        await searchGoogle(content.query); // Agora passamos apenas a string!
      } else {
        console.log('❌ Mensagem inválida');
      }

      channel.ack(msg); // ✅ Confirma a conclusão da mensagem
    }
  });
};
*/

// Aqui podemos rodar quantos processos forem definidos simultaneamente
const MAX_CONCURRENT_TASKS = 5;
let activeTasks = 0;
const taskQueue: (() => Promise<void>)[] = [];

export const consumeMessages = async () => {
  const rabbitMQ = await connectRabbitMQ();
  if (!rabbitMQ) return;

  const { channel } = rabbitMQ;
  await channel.assertQueue("rpa-tasks", { durable: true });

  console.log("📥 Aguardando mensagens na fila rpa-tasks...");

  channel.consume("rpa-tasks", async (msg: any) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());

      // Adiciona tarefa à fila
      taskQueue.push(async () => {
        try {
          console.log("✅ Executando tarefa:", content);
          await searchGoogle(content.query);
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Erro ao executar tarefa:", error);
        } finally {
          activeTasks--;
          processQueue();
        }
      });

      processQueue(); // Inicia processamento
    }
  });
};

async function processQueue() {
  while (activeTasks < MAX_CONCURRENT_TASKS && taskQueue.length > 0) {
    const task = taskQueue.shift();
    if (task) {
      activeTasks++;
      task();
    }
  }
}
