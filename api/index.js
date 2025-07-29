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
    } else {
      console.log('👑 Usuário administrador já existe:', adminEmail);
    }
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  }
};

// EXPORTAÇÃO UNIVERSAL - Para Vercel e Netlify
const handler = async (req, res) => {
  // Configurar CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Para Netlify Functions
  if (req.httpMethod) {
    if (req.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }
    
    // Adaptar req para compatibilidade
    req.method = req.httpMethod;
    req.url = req.path;
    req.body = req.body ? JSON.parse(req.body) : {};
    
    // Objeto res simulado para Netlify
    res = {
      statusCode: 200,
      headers: corsHeaders,
      json: (data) => ({
        statusCode: res.statusCode,
        headers: corsHeaders,
        body: JSON.stringify(data)
      }),
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      setHeader: () => {}
    };
  } else {
    // Para Vercel
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  }

  await connectDB();

  // Helper para retornar resposta normalizada
  const sendResponse = (statusCode, data) => {
    if (req.httpMethod) {
      // Netlify
      return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    } else {
      // Vercel
      return res.status(statusCode).json(data);
    }
  };

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

    console.log('🔐 === INÍCIO DO LOGIN ===');
    console.log('📧 Email recebido:', email);
    console.log('🔑 Senha recebida:', password ? '***PRESENTE***' : '***AUSENTE***');
    console.log('📦 Body completo:', JSON.stringify(body));

    if (!email || !password) {
      console.log('❌ Email ou senha em branco');
      return sendResponse(400, { message: 'E-mail e senha obrigatórios.' });
    }

    try {
      console.log('� Buscando usuário no banco de dados...');
      
      // Buscar usuário por email (case insensitive)
      const user = await User.findOne({ email: email.toLowerCase() });
      console.log('👤 Usuário encontrado:', user ? 'SIM' : 'NÃO');

      if (!user) {
        console.log('❌ Usuário não encontrado para email:', email);
        return res.status(401).json({ message: 'Email ou senha incorretos.' });
      }

      // Verificar se a conta está ativa
      if (user.isActive === false) {
        console.log('❌ Usuário inativo:', email);
        return res.status(401).json({ message: 'Conta desativada. Entre em contato com o suporte.' });
      }

      console.log('🔍 Verificando senha para usuário:', user.name, 'isActive:', user.isActive);
      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔑 Senha válida:', isValidPassword ? 'SIM' : 'NÃO');
      
      if (!isValidPassword) {
        console.log('❌ Senha incorreta para usuário:', email);
        return res.status(401).json({ message: 'Email ou senha incorretos.' });
      }

      console.log('✅ Login bem-sucedido para:', user.name, 'Role:', user.role);

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
          role: user.role,
          isActive: user.isActive,
          company: user.company,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('❌ ERRO CRÍTICO NO LOGIN:', error.message);
      console.error('❌ Stack:', error.stack);
      return res.status(500).json({ 
        message: 'Erro no servidor.', 
        error: error.message,
        debug: 'Verifique os logs do servidor'
      });
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

  // CRIAR ADMIN INICIAL (sem autenticação necessária - apenas primeira vez)
  if (url === '/api/create-admin' && method === 'POST') {
    try {
      // Verificar se já existe algum admin
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ 
          message: 'Já existe um administrador no sistema.',
          admin: {
            name: existingAdmin.name,
            email: existingAdmin.email
          }
        });
      }
      
      // Criar primeiro admin
      const { name, email, password } = body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
      }
      
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar usuário admin
      const admin = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        company: 'ModelAI'
      });
      
      await admin.save();
      
      console.log('👑 Primeiro admin criado:', admin.email);
      
      return res.status(201).json({ 
        message: 'Administrador criado com sucesso!',
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        instructions: 'Use estas credenciais para fazer login como administrador.'
      });
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // REGISTRO DE USUÁRIO (para admins criarem usuários)
  if (url === '/api/auth/register' && method === 'POST') {
    try {
      // Verificar se o usuário logado é admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
          const requestUser = await User.findById(decoded.userId);
          
          if (!requestUser || requestUser.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem criar usuários.' });
          }
        } catch (tokenError) {
          return res.status(401).json({ message: 'Token inválido.' });
        }
      }
      
      const { name, email, password, company, role = 'user' } = body;
      
      console.log('👥 Criando novo usuário:', email, 'Role:', role);
      
      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe com este email' });
      }
      
      // Criar hash da senha
      // Não precisamos hashear manualmente - o modelo User faz isso automaticamente
      
      // Criar novo usuário
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password, // Senha será hasheada automaticamente pelo middleware do modelo
        role,
        company: company || 'Não informado',
        isActive: true // FUNDAMENTAL: garantir que o usuário está ativo
      });
      
      await newUser.save();
      
      console.log('✅ Usuário criado com sucesso:', newUser.email, 'Role:', newUser.role, 'isActive:', newUser.isActive);
      
      return res.status(201).json({ 
        message: 'Usuário criado com sucesso!',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          company: newUser.company,
          isActive: newUser.isActive
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
      // Verificar se o usuário é admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Token de acesso necessário.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const requestUser = await User.findById(decoded.userId);
      
      if (!requestUser || requestUser.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem listar usuários.' });
      }
      
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      
      console.log('📋 Admin', requestUser.name, 'listando usuários:', users.length);
      
      return res.status(200).json({ 
        users: users,
        total: users.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // DEBUG: LISTAR TODOS OS USUÁRIOS (temporário para debug)
  if (url === '/api/debug/users' && method === 'GET') {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      console.log('🔍 DEBUG: Todos os usuários na base:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      
      return res.status(200).json({ 
        success: true,
        users: users.map(u => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          company: u.company,
          createdAt: u.createdAt
        })),
        total: users.length
      });
    } catch (error) {
      console.error('❌ Erro no debug de usuários:', error);
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

  // EDITAR USUÁRIO (apenas admins)
  if (url.startsWith('/api/users/') && !url.includes('/status') && method === 'PUT') {
    try {
      // Verificar se o usuário logado é admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const requestUser = await User.findById(decoded.userId);
      
      if (!requestUser || requestUser.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
      }

      const userId = url.split('/')[3]; // /api/users/{id}
      const { name, email, company, role } = body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
      }

      // Verificar se o email já existe em outro usuário
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso por outro usuário.' });
      }

      // Atualizar usuário
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          company: company?.trim(),
          role: role || 'user'
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      console.log('✅ Usuário editado com sucesso:', updatedUser.email);

      return res.status(200).json({
        message: 'Usuário atualizado com sucesso!',
        user: updatedUser
      });

    } catch (error) {
      console.error('❌ Erro ao editar usuário:', error);
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

  // CRIAR USUÁRIO DE TESTE (temporário para debug)
  if (url === '/api/debug/create-test-user' && method === 'POST') {
    try {
      const testEmail = 'teste@modelai.com';
      
      // Verificar se já existe
      const existingUser = await User.findOne({ email: testEmail });
      if (existingUser) {
        return res.status(200).json({ 
          message: 'Usuário de teste já existe',
          user: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
          }
        });
      }
      
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // Criar usuário de teste
      const testUser = new User({
        name: 'Usuario Teste',
        email: testEmail,
        password: hashedPassword,
        role: 'user',
        company: 'ModelAI Teste'
      });
      
      await testUser.save();
      console.log('✅ Usuário de teste criado:', testUser.email);
      
      return res.status(201).json({ 
        message: 'Usuário de teste criado com sucesso!',
        user: {
          _id: testUser._id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          company: testUser.company
        },
        credentials: {
          email: testEmail,
          password: '123456'
        }
      });
    } catch (error) {
      console.error('❌ Erro ao criar usuário de teste:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // HEALTH CHECK
  if (url === '/api/health' && method === 'GET') {
    const result = res.json({ status: 'ok', time: new Date().toISOString() });
    return req.httpMethod ? result : result;
  }

  // Rota não encontrada
  const notFoundResult = res.status(404).json({ message: 'Rota não encontrada' });
  return req.httpMethod ? notFoundResult : notFoundResult;
};

// Exportação universal para Vercel e Netlify
module.exports = handler;
module.exports.handler = handler;
