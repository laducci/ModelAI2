const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// MODELS
const User = require('../backend/models/User');

// CONFIG EXPRESS
const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// RATE LIMIT
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});
app.use(limiter);

// DB CONNECT
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://administrador:ModelAI123@cluster0.k5pupmg.mongodb.net/modelai?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('📦 MongoDB conectado');
};

// ROTAS BACKEND
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha obrigatórios.' });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user || user.senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    return res.status(200).json({ message: 'Login bem-sucedido', nome: user.nome });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// EXPORTAÇÃO PARA VERCEL
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
