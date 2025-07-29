const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});
app.use(limiter);

// DB CONNECT
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lauraguillarducci:Lauroca7!@modelai.k5pupmg.mongodb.net/modelai?retryWrites=true&w=majority&appName=ModelAI', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('📦 MongoDB conectado');
};

// ROTA DE LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha obrigatórios.' });
  }

  try {
    await connectDB();
    
    // Buscar usuário por email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production',
      { expiresIn: '7d' }
    );

    // Retornar dados no formato que o frontend espera
    return res.status(200).json({ 
      message: 'Login realizado com sucesso!',
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// ROTA DE VERIFICAÇÃO DE TOKEN
app.get('/auth/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ valid: false, error: 'Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ valid: false, error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ 
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    return res.status(401).json({ valid: false, error: 'Token inválido.' });
  }
});

// ENDPOINT TEMPORÁRIO PARA CRIAR ADMIN
app.post('/create-admin', async (req, res) => {
  try {
    await connectDB();
    
    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ email: 'admin@modelai.com' });
    if (existingAdmin) {
      return res.status(200).json({ message: 'Admin já existe', user: existingAdmin });
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar usuário admin
    const admin = new User({
      name: 'Administrador',
      email: 'admin@modelai.com',
      password: hashedPassword,
      role: 'admin',
      company: 'ModelAI'
    });
    
    await admin.save();
    
    return res.status(201).json({ 
      message: 'Admin criado com sucesso!',
      email: 'admin@modelai.com',
      password: 'admin123' 
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// EXPORTAÇÃO PARA VERCEL
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
