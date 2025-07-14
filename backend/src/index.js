import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { agenteMarap } from './agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const respuesta = await agenteMarap.run(mensaje);
    let userResponse = respuesta?.data?.result || "No response from agent";
    userResponse = userResponse.replace(/<think>.*?<\/think>/gs, '').replace(/StopEvent/g, '').trim();
    res.json({ response: userResponse });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: 'ERROR, procesando' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});