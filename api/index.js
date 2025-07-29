const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MODELS
const User = require('../backend/models/User');

// DB CONNECT
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lauraguillarducci:Lauroca7!@modelai.k5pupmg.mongodb.net/modelai?retryWrites=true&w=majority&appName=ModelAI', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('📦 MongoDB conectado');
};

// EXPORTAÇÃO PARA VERCEL - Função principal que trata todas as rotas da API
module.exports = async (req, res) => {
  // Configurar CORS para Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  // Parse da URL para identificar a rota
  const { url, method } = req;
  
  // Parse do body para requisições POST
  let body = {};
  if (method === 'POST' && req.body) {
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        body = req.body;
      }
    } else {
      body = req.body;
    }
  }
  
  // LOGIN
  if (url === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;

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
  }

  // VERIFICAÇÃO DE TOKEN
  if (url === '/api/auth/verify' && method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ valid: false, error: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
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
  }

  // CRIAR ADMIN
  if (url === '/api/create-admin' && method === 'POST') {
    try {
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
  }

  // REGISTRO DE USUÁRIO (para admins criarem usuários)
  if (url === '/api/auth/register' && method === 'POST') {
    try {
      const { name, email, password, company, role = 'user' } = body;
      
      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe com este email' });
      }
      
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar novo usuário
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        company: company || 'Não informado'
      });
      
      await newUser.save();
      
      console.log('✅ Usuário criado:', newUser.email);
      
      return res.status(201).json({ 
        message: 'Usuário criado com sucesso!',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          company: newUser.company
        }
      });
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // LISTAR USUÁRIOS (apenas para admins)
  if (url === '/api/users' && method === 'GET') {
    try {
      // TODO: Verificar se o usuário é admin (por agora, permitir acesso)
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      
      console.log('📋 Listando usuários:', users.length);
      
      return res.status(200).json({ 
        users: users,
        total: users.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // ATUALIZAR STATUS DO USUÁRIO
  if (url.startsWith('/api/users/') && url.endsWith('/status') && method === 'PUT') {
    try {
      const userId = url.split('/')[3]; // Extrair ID da URL
      const { isActive } = body;
      
      const user = await User.findByIdAndUpdate(
        userId, 
        { isActive }, 
        { new: true, select: '-password' }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      console.log('🔄 Status do usuário atualizado:', user.email, 'isActive:', isActive);
      
      return res.status(200).json({ 
        message: 'Status atualizado com sucesso',
        user: user
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // EXCLUIR USUÁRIO
  if (url.startsWith('/api/users/') && !url.includes('/status') && method === 'DELETE') {
    try {
      const userId = url.split('/')[3]; // Extrair ID da URL
      
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      console.log('🗑️ Usuário excluído:', user.email);
      
      return res.status(200).json({ 
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // HEALTH CHECK
  if (url === '/api/health' && method === 'GET') {
    return res.json({ status: 'ok', time: new Date().toISOString() });
  }

  // Rota não encontrada
  return res.status(404).json({ message: 'Rota não encontrada' });
};
