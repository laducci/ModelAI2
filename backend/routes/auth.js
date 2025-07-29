const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: {
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company } = req.body;

        // Validações
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Nome, email e senha são obrigatórios.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Senha deve ter pelo menos 6 caracteres.'
            });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email já está em uso.'
            });
        }

        // Criar usuário
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            company: company?.trim()
        });

        await user.save();

        // Gerar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login do usuário
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validações
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios.'
            });
        }

        // Buscar usuário
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                error: 'Credenciais inválidas.'
            });
        }

        // Verificar se conta está ativa
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // Verificar senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Credenciais inválidas.'
            });
        }

        // Atualizar último login
        await user.updateLastLogin();

        // Gerar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                company: req.user.company,
                role: req.user.role,
                lastLogin: req.user.lastLogin,
                preferences: req.user.preferences,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, company, preferences } = req.body;
        const updateData = {};

        if (name) updateData.name = name.trim();
        if (company !== undefined) updateData.company = company.trim();
        if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Perfil atualizado com sucesso!',
            user
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Alterar senha
// @access  Private
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Senha atual e nova senha são obrigatórias.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Nova senha deve ter pelo menos 6 caracteres.'
            });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Senha atual incorreta.'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Senha alterada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/auth/verify
// @desc    Verificar token
// @access  Private
router.get('/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            valid: true,
            user: user
        });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(401).json({
            valid: false,
            error: 'Token inválido.'
        });
    }
});

module.exports = router;
