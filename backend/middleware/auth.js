const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Acesso negado. Token não fornecido.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Token inválido. Usuário não encontrado.' 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                error: 'Conta desativada. Entre em contato com o suporte.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado. Faça login novamente.' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token inválido.' 
            });
        }

        console.error('Erro na autenticação:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor.' 
        });
    }
};

// Middleware para verificar se é admin
const adminAuth = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Acesso negado. Privilégios de administrador necessários.' 
        });
    }
};

// Middleware opcional (não bloqueia se não houver token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Não retorna erro, apenas continua sem usuário
        next();
    }
};

module.exports = { auth, adminAuth, optionalAuth };
