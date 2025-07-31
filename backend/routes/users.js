const express = require('express');
const User = require('../models/User');
const Scenario = require('../models/Scenario');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// @route   GET /api/users/profile
// @desc    Obter perfil do usuário atual
// @access  Private
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        console.log('🔍 [PROFILE API] Usuário encontrado:', { 
            name: user.name, 
            email: user.email, 
            role: user.role 
        });
        
        // Estatísticas básicas
        const scenarioCount = await Scenario.countDocuments({
            userId: req.user._id,
            isActive: true
        });

        const responseData = {
            user,
            stats: {
                totalScenarios: scenarioCount,
                memberSince: user.createdAt,
                lastLogin: user.lastLogin
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', async (req, res) => {
    try {
        const { name, company, preferences } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (company !== undefined) updateData.company = company.trim();
        if (preferences) {
            updateData.preferences = {
                ...req.user.preferences,
                ...preferences
            };
        }

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
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Dados inválidos.',
                details: messages
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   DELETE /api/users/account
// @desc    Desativar conta do usuário
// @access  Private
router.delete('/account', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                error: 'Senha é obrigatória para desativar a conta.'
            });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Senha incorreta.'
            });
        }

        // Desativar usuário e cenários
        await User.findByIdAndUpdate(req.user._id, { isActive: false });
        await Scenario.updateMany(
            { userId: req.user._id },
            { isActive: false }
        );

        res.json({
            message: 'Conta desativada com sucesso. Esperamos vê-lo novamente!'
        });

    } catch (error) {
        console.error('Erro ao desativar conta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/users/export
// @desc    Exportar dados do usuário
// @access  Private
router.get('/export', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const scenarios = await Scenario.find({
            userId: req.user._id,
            isActive: true
        }).select('-history'); // Sem histórico para reduzir tamanho

        const exportData = {
            user: {
                name: user.name,
                email: user.email,
                company: user.company,
                preferences: user.preferences,
                createdAt: user.createdAt
            },
            scenarios: scenarios.map(scenario => ({
                name: scenario.name,
                description: scenario.description,
                data: scenario.data,
                results: scenario.results,
                tags: scenario.tags,
                createdAt: scenario.createdAt,
                updatedAt: scenario.updatedAt
            })),
            exportedAt: new Date(),
            version: '1.0'
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="modelai-backup-${Date.now()}.json"`);
        res.json(exportData);

    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// Rotas administrativas (apenas para admins)

// @route   GET /api/users
// @desc    Listar todos os usuários (admin)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status = 'all' } = req.query;
        
        const query = {};
        
        // Filtro por status
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;
        
        // Busca por nome ou email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/users/:id
// @desc    Obter usuário específico (admin)
// @access  Private/Admin
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        // Estatísticas do usuário
        const scenarioCount = await Scenario.countDocuments({
            userId: user._id,
            isActive: true
        });

        const recentScenarios = await Scenario.find({
            userId: user._id,
            isActive: true
        })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('name updatedAt results');

        res.json({
            user,
            stats: {
                totalScenarios: scenarioCount,
                recentScenarios,
                memberSince: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/users/:id/status
// @desc    Ativar/desativar usuário (admin)
// @access  Private/Admin
router.put('/:id/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                error: 'Status deve ser true ou false.'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        res.json({
            message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`,
            user
        });

    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Excluir usuário (admin)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        // Não permitir excluir admin principal
        if (user.email === 'administrador@modelai.com' || user.email === 'admin@modelai.com') {
            return res.status(400).json({
                error: 'Não é possível excluir o administrador principal.'
            });
        }

        // Excluir usuário
        await User.findByIdAndDelete(req.params.id);
        
        // Desativar cenários do usuário
        await Scenario.updateMany(
            { userId: req.params.id },
            { isActive: false }
        );

        res.json({
            message: 'Usuário excluído com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Editar usuário (admin)
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { name, email, company, role } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'Nome e email são obrigatórios.'
            });
        }

        // Verificar se o email já existe em outro usuário
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(),
            _id: { $ne: req.params.id }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Email já está em uso por outro usuário.'
            });
        }

        const updateData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            company: company?.trim(),
            role: role || 'user'
        };

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        res.json({
            message: 'Usuário atualizado com sucesso!',
            user
        });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Dados inválidos.',
                details: messages
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/users/stats/dashboard
// @desc    Estatísticas para dashboard admin
// @access  Private/Admin
router.get('/stats/dashboard', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalScenarios = await Scenario.countDocuments({ isActive: true });
        
        // Usuários registrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Cenários criados nos últimos 30 dias
        const newScenarios = await Scenario.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
            isActive: true
        });

        res.json({
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                totalScenarios,
                newUsers,
                newScenarios,
                generatedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/users/stats
// @desc    Estatísticas pessoais do usuário
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        const scenarioCount = await Scenario.countDocuments({
            userId: req.user._id,
            isActive: true
        });

        // Contar análises (simulando baseado em cenários ativos)
        const analysesCount = scenarioCount * 2; // Estimativa

        res.json({
            scenarios: scenarioCount,
            analyses: analysesCount
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/users/change-password
// @desc    Alterar senha do usuário
// @access  Private
router.put('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Senha atual e nova senha são obrigatórias.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'A nova senha deve ter pelo menos 6 caracteres.'
            });
        }

        const user = await User.findById(req.user._id);
        
        // Verificar senha atual
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                error: 'Senha atual incorreta.'
            });
        }

        // Atualizar senha
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Senha alterada com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/users/preferences
// @desc    Salvar preferências do usuário
// @access  Private
router.put('/preferences', async (req, res) => {
    try {
        const { notifications, language, theme } = req.body;

        const user = await User.findById(req.user._id);
        
        // Atualizar preferências
        user.preferences = {
            notifications: notifications || {},
            language: language || 'pt-BR',
            theme: theme || 'claro'
        };

        await user.save();

        res.json({
            message: 'Preferências salvas com sucesso.',
            preferences: user.preferences
        });

    } catch (error) {
        console.error('Erro ao salvar preferências:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/users/export
// @desc    Exportar dados do usuário
// @access  Private
router.get('/export', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const scenarios = await Scenario.find({
            userId: req.user._id,
            isActive: true
        });

        const exportData = {
            user: {
                name: user.name,
                email: user.email,
                company: user.company,
                role: user.role,
                createdAt: user.createdAt,
                preferences: user.preferences
            },
            scenarios: scenarios.map(scenario => ({
                name: scenario.name,
                description: scenario.description,
                inputs: scenario.inputs,
                createdAt: scenario.createdAt,
                updatedAt: scenario.updatedAt
            })),
            exportedAt: new Date()
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="dados-modelai-${user.email}-${new Date().toISOString().split('T')[0]}.json"`);
        
        res.json(exportData);

    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   DELETE /api/users/delete-account
// @desc    Excluir conta do usuário
// @access  Private
router.delete('/delete-account', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                error: 'Senha é obrigatória para confirmar exclusão.'
            });
        }

        const user = await User.findById(req.user._id);
        
        // Verificar senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                error: 'Senha incorreta.'
            });
        }

        // Excluir cenários do usuário
        await Scenario.deleteMany({ userId: req.user._id });

        // Excluir usuário
        await User.findByIdAndDelete(req.user._id);

        res.json({
            message: 'Conta excluída com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;
