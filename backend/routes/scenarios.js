const express = require('express');
const Scenario = require('../models/Scenario');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// @route   GET /api/scenarios
// @desc    Listar cenários do usuário
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, tags } = req.query;
        
        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            search: search?.trim(),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };

        const scenarios = await Scenario.findByUser(req.user._id, options)
            .populate('userId', 'name email')
            .select('-history'); // Não incluir histórico na listagem

        const total = await Scenario.countDocuments({ 
            userId: req.user._id, 
            isActive: true 
        });

        res.json({
            scenarios,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Erro ao listar cenários:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/scenarios/:id
// @desc    Obter cenário específico
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const scenario = await Scenario.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isActive: true
        }).populate('userId', 'name email');

        if (!scenario) {
            return res.status(404).json({
                error: 'Cenário não encontrado.'
            });
        }

        res.json({ scenario });

    } catch (error) {
        console.error('Erro ao buscar cenário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   POST /api/scenarios
// @desc    Criar novo cenário
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { name, description, data, tags } = req.body;

        if (!name || !data) {
            return res.status(400).json({
                error: 'Nome e dados do cenário são obrigatórios.'
            });
        }

        // Validar estrutura dos dados
        const requiredFields = ['dadosGerais', 'tabelaVendas', 'propostaCliente'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({
                    error: `Campo ${field} é obrigatório nos dados.`
                });
            }
        }

        const scenario = new Scenario({
            name: name.trim(),
            description: description?.trim(),
            userId: req.user._id,
            data,
            tags: tags || []
        });

        await scenario.save();

        res.status(201).json({
            message: 'Cenário criado com sucesso!',
            scenario
        });

    } catch (error) {
        console.error('Erro ao criar cenário:', error);
        
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

// @route   PUT /api/scenarios/:id
// @desc    Atualizar cenário
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { name, description, data, tags, results } = req.body;

        const scenario = await Scenario.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isActive: true
        });

        if (!scenario) {
            return res.status(404).json({
                error: 'Cenário não encontrado.'
            });
        }

        // Preparar dados para atualização
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (data) updateData.data = data;
        if (tags) updateData.tags = tags;
        if (results) {
            updateData.results = {
                ...results,
                calculatedAt: new Date()
            };
        }

        const updatedScenario = await Scenario.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Cenário atualizado com sucesso!',
            scenario: updatedScenario
        });

    } catch (error) {
        console.error('Erro ao atualizar cenário:', error);
        
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

// @route   DELETE /api/scenarios/:id
// @desc    Excluir cenário (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const scenario = await Scenario.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isActive: true
        });

        if (!scenario) {
            return res.status(404).json({
                error: 'Cenário não encontrado.'
            });
        }

        // Soft delete
        await Scenario.findByIdAndUpdate(req.params.id, { isActive: false });

        res.json({
            message: 'Cenário excluído com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao excluir cenário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   POST /api/scenarios/:id/duplicate
// @desc    Duplicar cenário
// @access  Private
router.post('/:id/duplicate', async (req, res) => {
    try {
        const { name } = req.body;

        const originalScenario = await Scenario.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isActive: true
        });

        if (!originalScenario) {
            return res.status(404).json({
                error: 'Cenário original não encontrado.'
            });
        }

        const duplicatedScenario = new Scenario({
            name: name || `${originalScenario.name} (Cópia)`,
            description: originalScenario.description,
            userId: req.user._id,
            data: originalScenario.data,
            tags: originalScenario.tags
        });

        await duplicatedScenario.save();

        res.status(201).json({
            message: 'Cenário duplicado com sucesso!',
            scenario: duplicatedScenario
        });

    } catch (error) {
        console.error('Erro ao duplicar cenário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/scenarios/:id/history
// @desc    Obter histórico de versões do cenário
// @access  Private
router.get('/:id/history', async (req, res) => {
    try {
        const scenario = await Scenario.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isActive: true
        }).populate('history.modifiedBy', 'name email');

        if (!scenario) {
            return res.status(404).json({
                error: 'Cenário não encontrado.'
            });
        }

        res.json({
            history: scenario.history.sort((a, b) => b.modifiedAt - a.modifiedAt)
        });

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/scenarios/stats/summary
// @desc    Obter estatísticas dos cenários do usuário
// @access  Private
router.get('/stats/summary', async (req, res) => {
    try {
        const scenarios = await Scenario.find({
            userId: req.user._id,
            isActive: true
        }).select('name results createdAt updatedAt version');

        const stats = {
            total: scenarios.length,
            averageVplTabela: 0,
            averageVplProposta: 0,
            totalPositiveVpl: 0,
            totalNegativeVpl: 0,
            lastUpdate: null,
            recentScenarios: []
        };

        if (scenarios.length > 0) {
            const vplTabelaSum = scenarios.reduce((sum, s) => sum + (s.results?.vplTabela || 0), 0);
            const vplPropostaSum = scenarios.reduce((sum, s) => sum + (s.results?.vplProposta || 0), 0);
            
            stats.averageVplTabela = vplTabelaSum / scenarios.length;
            stats.averageVplProposta = vplPropostaSum / scenarios.length;
            stats.totalPositiveVpl = scenarios.filter(s => (s.results?.vplTabela || 0) > 0).length;
            stats.totalNegativeVpl = scenarios.filter(s => (s.results?.vplTabela || 0) < 0).length;
            stats.lastUpdate = Math.max(...scenarios.map(s => new Date(s.updatedAt)));
            stats.recentScenarios = scenarios
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, 5)
                .map(s => s.calculateStats());
        }

        res.json({ stats });

    } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;
