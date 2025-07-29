const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');

// Conectar ao MongoDB
async function connectToDatabase() {
    if (mongoose.connections[0].readyState) {
        return;
    }
    
    const mongoOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        bufferCommands: false,
        bufferMaxEntries: 0
    };
    
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
}

export default async function handler(req, res) {
    // Permitir apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        await connectToDatabase();
        
        const { email, password } = req.body;

        // Validar dados
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email e senha são obrigatórios' 
            });
        }

        // Buscar usuário
        console.log('🔍 Buscando usuário:', email);
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ Usuário não encontrado');
            return res.status(401).json({ 
                error: 'Credenciais inválidas' 
            });
        }

        // Verificar se o usuário está ativo
        if (!user.isActive) {
            console.log('❌ Usuário inativo');
            return res.status(401).json({ 
                error: 'Usuário inativo' 
            });
        }

        // Verificar senha
        console.log('🔐 Verificando senha...');
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            console.log('❌ Senha inválida');
            return res.status(401).json({ 
                error: 'Credenciais inválidas' 
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login realizado com sucesso para:', email);

        // Retornar dados do usuário (sem a senha)
        res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
