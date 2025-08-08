const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MODELS
const User = require('../backend/models/User');
const Scenario = require('../backend/models/Scenario');
const Empreendimento = require('../backend/models/Empreendimento');

// INTEGRATIONS
let FabricIntegration;
try {
  FabricIntegration = require('../backend/integrations/FabricIntegration');
  console.log('✅ FabricIntegration carregado com sucesso');
} catch (error) {
  console.warn('⚠️ FabricIntegration não carregado:', error.message);
  // Classe mock melhorada para produção
  FabricIntegration = class {
    constructor() {
      this.baseUrl = 'https://api.fabric.microsoft.com/v1';
      this.accessToken = null;
      this.tenantId = process.env.FABRIC_TENANT_ID;
      this.clientId = process.env.FABRIC_CLIENT_ID;
      this.clientSecret = process.env.FABRIC_CLIENT_SECRET;
    }

    async testConnection() {
      // Verificar se as variáveis de ambiente estão configuradas
      const hasEnvVars = this.tenantId && this.clientId && this.clientSecret;
      
      if (!hasEnvVars) {
        return {
          connected: false,
          mode: 'config-missing',
          message: 'Variáveis de ambiente do Fabric não configuradas no Vercel',
          error: 'Missing environment variables: FABRIC_TENANT_ID, FABRIC_CLIENT_ID, FABRIC_CLIENT_SECRET',
          instructions: 'Configure as variáveis de ambiente no painel do Vercel'
        };
      }

      try {
        // Tentar autenticação real
        const authUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
        
        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            scope: 'https://analysis.windows.net/powerbi/api/.default'
          })
        });

        const data = await response.json();
        
        if (data.access_token) {
          this.accessToken = data.access_token;
          return {
            connected: true,
            mode: 'production',
            message: 'Conectado ao Microsoft Fabric com sucesso',
            timestamp: new Date().toISOString(),
            tenantId: this.tenantId
          };
        } else {
          throw new Error(data.error_description || data.error || 'Erro na autenticação');
        }
      } catch (error) {
        return {
          connected: false,
          mode: 'error',
          message: 'Erro na conexão com Fabric: ' + error.message,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    async updateConfiguration(config) {
      return {
        success: false,
        message: 'Configuração não suportada no ambiente Vercel. Use variáveis de ambiente.',
        data: config
      };
    }
  };
}

// DB CONNECT
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lauraguillarducci:Lauroca7!@modelai.k5pupmg.mongodb.net/modelai?retryWrites=true&w=majority&appName=ModelAI', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB conectado');
  
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
      console.log('Usuário administrador criado:', adminEmail);
    } else {
      console.log('Usuário administrador já existe:', adminEmail);
    }
  } catch (error) {
    console.error('Erro ao criar admin:', error);
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
  
  // Limpar query parameters da URL
  const cleanUrl = url.split('?')[0];
  
  // DEBUG: Imprimir informações da requisição
  console.log('🔍 [API DEBUG] URL original:', url);
  console.log('🔍 [API DEBUG] URL limpa:', cleanUrl);
  console.log('🔍 [API DEBUG] Method:', method);
  console.log('🔍 [API DEBUG] Headers:', req.headers);
  
  // Parse do body para requisições POST e PUT
  let body = {};
  if ((method === 'POST' || method === 'PUT') && req.body) {
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
  
  // DEBUG: Imprimir body
  console.log('🔍 [API DEBUG] Body:', body);
  
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
          active: newUser.isActive // MAPEAMENTO: isActive -> active
        }
      });
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
  }

  // CRIAR USUÁRIO (rota para admins - compatibilidade com frontend)
  if (cleanUrl === '/api/users' && method === 'POST') {
    try {
      // Verificar se o usuário logado é admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token de acesso necessário.' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
        const requestUser = await User.findById(decoded.userId);
        
        if (!requestUser || requestUser.role !== 'admin') {
          return sendResponse(403, { message: 'Acesso negado. Apenas administradores podem criar usuários.' });
        }
      } catch (tokenError) {
        return sendResponse(401, { message: 'Token inválido.' });
      }
      
      const { name, email, password, company, role = 'user' } = body;
      
      console.log('👥 Criando novo usuário via /api/users:', email, 'Role:', role);
      
      // Validações básicas
      if (!name || !email || !password) {
        return sendResponse(400, { message: 'Nome, email e senha são obrigatórios.' });
      }
      
      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return sendResponse(400, { message: 'Usuário já existe com este email' });
      }
      
      // Criar novo usuário
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password, // Senha será hasheada automaticamente pelo middleware do modelo
        role: role || 'user',
        company: company || 'Não informado',
        isActive: true
      });
      
      await newUser.save();
      
      console.log('✅ Usuário criado com sucesso via /api/users:', newUser.email, 'Role:', newUser.role);
      
      return sendResponse(201, { 
        message: 'Usuário criado com sucesso!',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          company: newUser.company,
          active: newUser.isActive
        }
      });
    } catch (error) {
      console.error('❌ Erro ao criar usuário via /api/users:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // LISTAR USUÁRIOS (apenas para admins)
  if (cleanUrl === '/api/users' && method === 'GET') {
    try {
      // Verificar se o usuário é admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Token de acesso necessário.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const requestUser = await User.findById(decoded.userId);
      
      if (!requestUser || requestUser.role !== 'admin') {
        return sendResponse(403, { message: 'Acesso negado. Apenas administradores podem listar usuários.' });
      }
      
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      
      console.log('📋 Admin', requestUser.name, 'listando usuários:', users.length);
      
      // Mapear isActive para active para compatibilidade com frontend
      const usersFormatted = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        active: user.isActive, // MAPEAMENTO: isActive -> active
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      
      return sendResponse(200, { 
        success: true,
        message: 'Usuários carregados com sucesso',
        users: usersFormatted,
        total: usersFormatted.length
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // OBTER PERFIL DO USUÁRIO ATUAL
  if (cleanUrl === '/api/users/profile' && method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return sendResponse(404, { message: 'Usuário não encontrado.' });
      }

      // Estatísticas básicas
      const scenarioCount = await Scenario.countDocuments({
        userId: user._id,
        isActive: true
      });

      return sendResponse(200, {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        stats: {
          totalScenarios: scenarioCount,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }

  // ATUALIZAR PERFIL DO USUÁRIO
  if (cleanUrl === '/api/users/profile' && method === 'PUT') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const { name, company } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (company !== undefined) updateData.company = company.trim();
      
      const user = await User.findByIdAndUpdate(
        decoded.userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return sendResponse(404, { message: 'Usuário não encontrado.' });
      }

      return sendResponse(200, {
        message: 'Perfil atualizado com sucesso!',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }

  // ALTERAR SENHA DO USUÁRIO
  if (cleanUrl === '/api/users/change-password' && method === 'PUT') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return sendResponse(400, { message: 'Senha atual e nova senha são obrigatórias.' });
      }

      if (newPassword.length < 6) {
        return sendResponse(400, { message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }

      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return sendResponse(404, { message: 'Usuário não encontrado.' });
      }

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return sendResponse(400, { message: 'Senha atual incorreta.' });
      }

      // Atualizar senha
      user.password = newPassword; // O pre-save hook irá hasher automaticamente
      await user.save();

      return sendResponse(200, { message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }

  // ESTATÍSTICAS DO USUÁRIO
  if (cleanUrl === '/api/users/stats' && method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
      const scenarioCount = await Scenario.countDocuments({
        userId: decoded.userId,
        isActive: true
      });

      return sendResponse(200, {
        totalScenarios: scenarioCount,
        totalActiveScenarios: scenarioCount
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
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
  if (cleanUrl.startsWith('/api/users/') && cleanUrl.endsWith('/status') && method === 'PUT') {
    try {
      const userId = cleanUrl.split('/')[3]; // Extrair ID da URL
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
  if (cleanUrl.startsWith('/api/users/') && !cleanUrl.includes('/status') && method === 'PUT') {
    try {
      // Verificar se o usuário logado é admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const requestUser = await User.findById(decoded.userId);
      
      if (!requestUser || requestUser.role !== 'admin') {
        return sendResponse(403, { message: 'Acesso negado. Apenas administradores.' });
      }

      const userId = cleanUrl.split('/')[3]; // /api/users/{id}
      const { name, email, company, role, active, password } = body;

      console.log('Atualizando usuário:', userId);
      console.log('Body recebido:', body);
      console.log('Chaves do body:', Object.keys(body));
      console.log('Quantidade de chaves:', Object.keys(body).length);
      console.log('Tipo de active:', typeof active, active);

      // Se é apenas toggle de status (active), não validar name/email
      if (Object.keys(body).length === 1 && typeof active === 'boolean') {
        console.log('Toggle de status apenas:', active);
        
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { isActive: active }, // CORRIGIDO: mapear active -> isActive
          { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
          return sendResponse(404, { message: 'Usuário não encontrado.' });
        }

        return sendResponse(200, { 
          success: true,
          message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso!`,
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            company: updatedUser.company,
            active: updatedUser.isActive // MAPEAMENTO: isActive -> active
          }
        });
      }

      // Para edição completa, validar name e email
      if (!name || !email) {
        return sendResponse(400, { message: 'Nome e email são obrigatórios.' });
      }

      // Verificar se o email já existe em outro usuário
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });

      if (existingUser) {
        return sendResponse(400, { message: 'Email já está em uso por outro usuário.' });
      }

      // Preparar dados para atualização
      const updateData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        company: company?.trim(),
        role: role || 'user'
      };

      // Se foi fornecida uma nova senha, incluir no update
      if (password && password.trim()) {
        const bcrypt = require('bcryptjs');
        updateData.password = await bcrypt.hash(password.trim(), 10);
        console.log('🔑 Senha será atualizada para o usuário');
      }

      // Se active foi especificado, incluir
      if (typeof active === 'boolean') {
        updateData.isActive = active; // CORRIGIDO: mapear active -> isActive
      }

      console.log('💾 Dados de atualização:', { ...updateData, password: updateData.password ? '[HIDDEN]' : undefined });

      // Atualizar usuário
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return sendResponse(404, { message: 'Usuário não encontrado.' });
      }

      console.log('Usuário editado com sucesso:', updatedUser.email);

      return sendResponse(200, { 
        success: true,
        message: 'Usuário atualizado com sucesso!',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          company: updatedUser.company,
          active: updatedUser.isActive // MAPEAMENTO: isActive -> active
        }
      });

    } catch (error) {
      console.error('❌ Erro ao editar usuário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // EXCLUIR USUÁRIO
  if (cleanUrl.startsWith('/api/users/') && !cleanUrl.includes('/status') && method === 'DELETE') {
    try {
      const userId = cleanUrl.split('/')[3]; // Extrair ID da URL
      
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) {
        return sendResponse(404, { message: 'Usuário não encontrado' });
      }
      
      console.log('Usuário excluído:', user.email);
      
      return sendResponse(200, { 
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
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

  // ==================== ROTAS DE GERENCIAMENTO DE USUÁRIOS ====================
  
  // Deletar usuário
  if (cleanUrl.startsWith('/api/users/') && method === 'DELETE') {
    try {
      const userId = cleanUrl.split('/')[3];
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
      // Verificar se é admin
      const adminUser = await User.findById(decoded.userId);
      if (!adminUser || adminUser.role !== 'admin') {
        return sendResponse(403, { message: 'Acesso negado. Apenas administradores.' });
      }

      // Não permitir deletar a si mesmo
      if (userId === decoded.userId) {
        return sendResponse(400, { message: 'Não é possível deletar sua própria conta.' });
      }

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return sendResponse(404, { message: 'Usuário não encontrado.' });
      }

      return sendResponse(200, { message: 'Usuário deletado com sucesso!' });

    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // ==================== ROTAS DE EMPREENDIMENTOS ====================
  
  // Listar empreendimentos do usuário
  if (url === '/api/empreendimentos' && method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
      const empreendimentos = await Empreendimento.find({ 
        user: decoded.userId,
        isActive: true 
      }).sort({ createdAt: -1 });
      
      return sendResponse(200, { empreendimentos });
    } catch (error) {
      console.error('Erro ao listar empreendimentos:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }
  
  // Criar empreendimento
  if (url === '/api/empreendimentos' && method === 'POST') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const { nome, incorporadora, tabelaVendas } = body;

      if (!nome || !incorporadora) {
        return sendResponse(400, { message: 'Nome e incorporadora são obrigatórios.' });
      }
      
      const empreendimento = new Empreendimento({
        nome,
        incorporadora,
        tabelaVendas: tabelaVendas || {},
        user: decoded.userId
      });

      await empreendimento.save();
      
      return sendResponse(201, { 
        message: 'Empreendimento salvo com sucesso!',
        empreendimento
      });
    } catch (error) {
      console.error('Erro ao salvar empreendimento:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }
  
  // Atualizar empreendimento
  if (url.startsWith('/api/empreendimentos/') && method === 'PUT') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const empreendimentoId = url.split('/').pop();
      const { nome, incorporadora, tabelaVendas } = body;

      const empreendimento = await Empreendimento.findOne({ 
        _id: empreendimentoId,
        user: decoded.userId 
      });

      if (!empreendimento) {
        return sendResponse(404, { message: 'Empreendimento não encontrado.' });
      }

      empreendimento.nome = nome || empreendimento.nome;
      empreendimento.incorporadora = incorporadora || empreendimento.incorporadora;
      empreendimento.tabelaVendas = tabelaVendas || empreendimento.tabelaVendas;

      await empreendimento.save();

      return sendResponse(200, { 
        message: 'Empreendimento atualizado com sucesso!',
        empreendimento
      });
    } catch (error) {
      console.error('Erro ao atualizar empreendimento:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }
  
  // Deletar empreendimento
  if (url.startsWith('/api/empreendimentos/') && method === 'DELETE') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const empreendimentoId = url.split('/').pop();

      const empreendimento = await Empreendimento.findOne({ 
        _id: empreendimentoId,
        user: decoded.userId 
      });

      if (!empreendimento) {
        return sendResponse(404, { message: 'Empreendimento não encontrado.' });
      }

      // Soft delete
      empreendimento.isActive = false;
      await empreendimento.save();

      return sendResponse(200, { message: 'Empreendimento removido com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar empreendimento:', error);
      return sendResponse(500, { message: 'Erro interno do servidor.' });
    }
  }

  // ==================== ROTAS DE CENÁRIOS ====================
  
  // Salvar cenário
  if (url === '/api/scenarios' && method === 'POST') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      const { name, description, data } = body;

      if (!name || !data) {
        return sendResponse(400, { message: 'Nome e dados do cenário são obrigatórios.' });
      }
      
      const scenario = new Scenario({
        name,
        description: description || '',
        userId: decoded.userId,
        data,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await scenario.save();
      
      return sendResponse(201, { 
        message: 'Cenário salvo com sucesso!',
        scenario: {
          id: scenario._id,
          name: scenario.name,
          description: scenario.description,
          createdAt: scenario.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Erro ao salvar cenário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // Listar cenários do usuário
  if (url === '/api/scenarios' && method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
      const scenarios = await Scenario.find({ userId: decoded.userId })
        .sort({ createdAt: -1 });

      return sendResponse(200, { 
        scenarios: scenarios.map(s => ({
          id: s._id,
          name: s.name,
          description: s.description,
          data: s.data,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        }))
      });

    } catch (error) {
      console.error('❌ Erro ao listar cenários:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // Deletar cenário
  if (url.startsWith('/api/scenarios/') && method === 'DELETE') {
    try {
      const scenarioId = url.split('/')[3];
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
      const scenario = await Scenario.findOne({ _id: scenarioId, userId: decoded.userId });
      
      if (!scenario) {
        return sendResponse(404, { message: 'Cenário não encontrado.' });
      }

      await Scenario.deleteOne({ _id: scenarioId });

      return sendResponse(200, { message: 'Cenário deletado com sucesso!' });

    } catch (error) {
      console.error('❌ Erro ao deletar cenário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // Atualizar cenário
  if (url.startsWith('/api/scenarios/') && method === 'PUT') {
    try {
      const scenarioId = url.split('/')[3];
      console.log('🔄 [API] Atualizando cenário ID:', scenarioId);
      console.log('🔄 [API] URL completa:', url);
      
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      console.log('🔄 [API] User ID:', decoded.userId);
      
      const { name, description, data } = body;
      console.log('🔄 [API] Dados recebidos:', { name, description, data: !!data });

      if (!name || !data) {
        return sendResponse(400, { message: 'Nome e dados do cenário são obrigatórios.' });
      }
      
      const scenario = await Scenario.findOne({ _id: scenarioId, userId: decoded.userId });
      console.log('🔄 [API] Cenário encontrado:', !!scenario);
      
      if (!scenario) {
        return sendResponse(404, { message: 'Cenário não encontrado.' });
      }

      // Atualizar campos
      scenario.name = name;
      scenario.description = description || '';
      scenario.data = data;
      scenario.updatedAt = new Date();

      await scenario.save();
      console.log('✅ [API] Cenário atualizado com sucesso');

      return sendResponse(200, { 
        message: 'Cenário atualizado com sucesso!',
        scenario: {
          id: scenario._id,
          name: scenario.name,
          description: scenario.description,
          data: scenario.data,
          createdAt: scenario.createdAt,
          updatedAt: scenario.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar cenário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // Obter cenário específico
  if (url.startsWith('/api/scenarios/') && method === 'GET') {
    try {
      const scenarioId = url.split('/')[3];
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendResponse(401, { message: 'Token não fornecido.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ModelAI_2025_Super_Secure_JWT_Key_32_Characters_Long_For_Production');
      
      const scenario = await Scenario.findOne({ _id: scenarioId, userId: decoded.userId });
      
      if (!scenario) {
        return sendResponse(404, { message: 'Cenário não encontrado.' });
      }

      return sendResponse(200, { 
        scenario: {
          id: scenario._id,
          name: scenario.name,
          description: scenario.description,
          data: scenario.data,
          createdAt: scenario.createdAt,
          updatedAt: scenario.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar cenário:', error);
      return sendResponse(500, { message: 'Erro no servidor.', error: error.message });
    }
  }

  // HEALTH CHECK
  if (cleanUrl === '/api/health' && method === 'GET') {
    const result = res.json({ status: 'ok', time: new Date().toISOString() });
    return req.httpMethod ? result : result;
  }

  // ROTA DE TESTE
  if (cleanUrl === '/api/test' && method === 'GET') {
    console.log('🧪 [API] Rota de teste acessada no handler!');
    const result = res.json({ 
      message: 'Teste do handler API funcionando!', 
      url: url, 
      cleanUrl: cleanUrl,
      method: method,
      timestamp: new Date().toISOString()
    });
    return req.httpMethod ? result : result;
  }

  // ==================== ROTAS FABRIC ====================
  
  // Debug da API - Rota simples para testar se está funcionando
  if (cleanUrl === '/api/fabric/debug' && method === 'GET') {
    return sendResponse(200, {
      success: true,
      message: 'API Fabric funcionando',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      hasEnvVars: {
        FABRIC_TENANT_ID: !!process.env.FABRIC_TENANT_ID,
        FABRIC_CLIENT_ID: !!process.env.FABRIC_CLIENT_ID,
        FABRIC_CLIENT_SECRET: !!process.env.FABRIC_CLIENT_SECRET
      }
    });
  }
  
  // Testar conexão com Fabric
  if ((cleanUrl === '/api/fabric/test' || cleanUrl === '/api/fabric/test-connection') && method === 'GET') {
    try {
      const fabricIntegration = new FabricIntegration();
      const testResult = await fabricIntegration.testConnection();
      
      // Garantir que sempre retornamos um formato consistente
      const response = {
        success: testResult.connected || false,
        connected: testResult.connected || false,
        mode: testResult.mode || 'unknown',
        message: testResult.message || 'Teste de conexão executado',
        timestamp: testResult.timestamp || new Date().toISOString(),
        ...testResult
      };
      
      return sendResponse(200, response);
    } catch (error) {
      console.error('❌ Erro no teste Fabric:', error);
      return sendResponse(500, { 
        success: false,
        connected: false,
        mode: 'error',
        message: 'Erro no teste de conexão com Fabric',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Configurar credenciais do Fabric
  if (cleanUrl === '/api/fabric/configure' && method === 'POST') {
    try {
      const { tenantId, clientId, clientSecret } = body;
      
      if (!tenantId || !clientId || !clientSecret) {
        return sendResponse(400, { 
          success: false,
          message: 'Tenant ID, Client ID e Client Secret são obrigatórios' 
        });
      }

      const fabricIntegration = new FabricIntegration();
      const result = await fabricIntegration.updateConfiguration({
        tenantId,
        clientId,
        clientSecret
      });

      return sendResponse(200, {
        success: result.success || false,
        message: result.message || 'Configuração atualizada',
        ...result
      });
    } catch (error) {
      console.error('❌ Erro na configuração Fabric:', error);
      return sendResponse(500, { 
        success: false,
        message: 'Erro ao configurar Fabric',
        error: error.message 
      });
    }
  }

  // Listar workspaces do Fabric
  if (cleanUrl === '/api/fabric/workspaces' && method === 'GET') {
    try {
      const fabricIntegration = new FabricIntegration();
      const workspaces = await fabricIntegration.listWorkspaces();
      return sendResponse(200, { 
        success: true,
        workspaces 
      });
    } catch (error) {
      console.error('❌ Erro ao listar workspaces:', error);
      return sendResponse(500, { 
        success: false,
        message: 'Erro ao listar workspaces',
        error: error.message 
      });
    }
  }

  // Exportar dados para Fabric
  if (cleanUrl === '/api/fabric/export' && method === 'POST') {
    try {
      const { workspaceId, datasetName, scenarios } = body;
      
      if (!workspaceId || !datasetName || !scenarios) {
        return sendResponse(400, { 
          success: false,
          message: 'Workspace ID, nome do dataset e cenários são obrigatórios' 
        });
      }

      const fabricIntegration = new FabricIntegration();
      const result = await fabricIntegration.exportData(workspaceId, datasetName, scenarios);
      return sendResponse(200, {
        success: result.success !== false,
        ...result
      });
    } catch (error) {
      console.error('❌ Erro na exportação:', error);
      return sendResponse(500, { 
        success: false,
        message: 'Erro ao exportar dados para Fabric',
        error: error.message 
      });
    }
  }

  // Obter configuração atual do Fabric
  if (cleanUrl === '/api/fabric/config' && method === 'GET') {
    try {
      const fabricIntegration = new FabricIntegration();
      const config = await fabricIntegration.getConfiguration();
      return sendResponse(200, {
        success: true,
        ...config
      });
    } catch (error) {
      console.error('❌ Erro ao obter configuração:', error);
      return sendResponse(500, { 
        success: false,
        message: 'Erro ao obter configuração do Fabric',
        error: error.message 
      });
    }
  }

  // Rota não encontrada
  console.log('❌ [API] Rota não encontrada:', cleanUrl, method);
  const notFoundResult = res.status(404).json({ message: 'Rota não encontrada' });
  return req.httpMethod ? notFoundResult : notFoundResult;
};

// Exportação universal para Vercel e Netlify
module.exports = handler;
module.exports.handler = handler;
