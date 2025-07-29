require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Modelos
const User = require('./backend/models/User');

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('📦 MongoDB Connected');
    
    // Criar usuário admin padrão se não existir
    try {
        const adminEmail = 'administrador@modelai.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const adminUser = new User({
                name: 'Administrador',
                email: adminEmail,
                password: 'admin123', // Será hasheada automaticamente
                role: 'admin',
                isActive: true,
                company: 'ModelAI'
            });
            
            await adminUser.save();
            console.log('👑 Usuário administrador criado:', adminEmail);
            console.log('🔑 Senha padrão: admin123');
        } else {
            console.log('👑 Usuário administrador já existe:', adminEmail);
        }
    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    }
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// ROTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha obrigatórios.' });
  }

  try {
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
      process.env.JWT_SECRET || 'modelai-secret-key',
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
app.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ valid: false, error: 'Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'modelai-secret-key');
    
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
app.post('/api/create-admin', async (req, res) => {
  try {
    const { email = 'admin@modelai.com', name = 'Administrador', role = 'admin' } = req.body;
    
    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      // Atualizar role se necessário
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        return res.status(200).json({ message: 'Role do admin atualizada para admin' });
      }
      return res.status(200).json({ message: 'Admin já existe com role correto' });
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar usuário admin
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      company: 'ModelAI'
    });
    
    await admin.save();
    
    return res.status(201).json({ 
      message: 'Admin criado com sucesso!',
      email,
      password: 'admin123',
      role: 'admin'
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Middleware para rotas da API (direciona para o handler universal)
app.use('/api', async (req, res, next) => {
    // Pular as rotas já definidas acima
    if (req.path === '/auth/login' || req.path === '/auth/verify' || req.path === '/create-admin' || req.path === '/health') {
        return next();
    }
    
    // Usar o handler universal para outras rotas da API
    try {
        const apiHandler = require('./api/index.js');
        await apiHandler(req, res);
    } catch (error) {
        console.error('❌ Erro no handler da API:', error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
});

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all para SPAs
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ModelAI rodando na porta ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
});
