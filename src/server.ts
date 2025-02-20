import * as express from 'express';
import { config } from 'dotenv';
import { sendMessage } from './producers/sendMessage';
import { consumeMessages } from './consumers/receiveMessage';

config()

const app = express.default();
app.use(express.json());

const QUEUE_NAME = 'rpa-tasks';

app.post('/send', async (req: any, res: any) => {
  const { query, task } = req.body;
  if (!task) return res.status(400).json({ error: 'A tarefa é obrigatória' });

  await sendMessage(QUEUE_NAME, { task, query });
  res.json({ message: 'Mensagem enviada para o RPA', task })
})

// Iniciar Consumer
// consumeMessages(QUEUE_NAME)
consumeMessages()

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));