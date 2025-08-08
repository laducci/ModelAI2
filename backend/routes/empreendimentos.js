const express = require('express');
const Empreendimento = require('../models/Empreendimento');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// @route   GET /api/empreendimentos
// @desc    Listar empreendimentos do usuário
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, search } = req.query;
        
        const query = {
            user: req.user._id,
            isActive: true
        };

        // Filtro de busca
        if (search?.trim()) {
            query.$or = [
                { nome: { $regex: search, $options: 'i' } },
                { incorporadora: { $regex: search, $options: 'i' } }
            ];
        }

        const empreendimentos = await Empreendimento.find(query)
            .select('nome incorporadora tabelaVendas createdAt')
            .sort({ nome: 1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Empreendimento.countDocuments(query);

        res.json({
            empreendimentos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Erro ao listar empreendimentos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   GET /api/empreendimentos/:id
// @desc    Obter empreendimento específico
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const empreendimento = await Empreendimento.findOne({
            _id: req.params.id,
            user: req.user._id,
            isActive: true
        });

        if (!empreendimento) {
            return res.status(404).json({
                error: 'Empreendimento não encontrado.'
            });
        }

        res.json(empreendimento);

    } catch (error) {
        console.error('Erro ao buscar empreendimento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'ID do empreendimento inválido.'
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   POST /api/empreendimentos
// @desc    Criar novo empreendimento
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { nome, incorporadora, tabelaVendas } = req.body;

        // Validações básicas
        if (!nome?.trim()) {
            return res.status(400).json({
                error: 'Nome do empreendimento é obrigatório.'
            });
        }

        if (!incorporadora?.trim()) {
            return res.status(400).json({
                error: 'Incorporadora é obrigatória.'
            });
        }

        // Verificar se já existe empreendimento com o mesmo nome para o usuário
        const existingEmpreendimento = await Empreendimento.findOne({
            nome: nome.trim(),
            user: req.user._id,
            isActive: true
        });

        if (existingEmpreendimento) {
            return res.status(400).json({
                error: 'Já existe um empreendimento com este nome.'
            });
        }

        const empreendimento = new Empreendimento({
            nome: nome.trim(),
            incorporadora: incorporadora.trim(),
            tabelaVendas: tabelaVendas || {},
            user: req.user._id
        });

        await empreendimento.save();

        res.status(201).json({
            message: 'Empreendimento criado com sucesso.',
            empreendimento
        });

    } catch (error) {
        console.error('Erro ao criar empreendimento:', error);
        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   PUT /api/empreendimentos/:id
// @desc    Atualizar empreendimento
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { nome, incorporadora, tabelaVendas } = req.body;

        const empreendimento = await Empreendimento.findOne({
            _id: req.params.id,
            user: req.user._id,
            isActive: true
        });

        if (!empreendimento) {
            return res.status(404).json({
                error: 'Empreendimento não encontrado.'
            });
        }

        // Validações
        if (nome?.trim()) {
            // Verificar se outro empreendimento já tem este nome
            const existing = await Empreendimento.findOne({
                nome: nome.trim(),
                user: req.user._id,
                isActive: true,
                _id: { $ne: req.params.id }
            });

            if (existing) {
                return res.status(400).json({
                    error: 'Já existe outro empreendimento com este nome.'
                });
            }

            empreendimento.nome = nome.trim();
        }

        if (incorporadora?.trim()) {
            empreendimento.incorporadora = incorporadora.trim();
        }

        if (tabelaVendas) {
            empreendimento.tabelaVendas = {
                ...empreendimento.tabelaVendas,
                ...tabelaVendas
            };
        }

        await empreendimento.save();

        res.json({
            message: 'Empreendimento atualizado com sucesso.',
            empreendimento
        });

    } catch (error) {
        console.error('Erro ao atualizar empreendimento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'ID do empreendimento inválido.'
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

// @route   DELETE /api/empreendimentos/:id
// @desc    Excluir empreendimento (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const empreendimento = await Empreendimento.findOne({
            _id: req.params.id,
            user: req.user._id,
            isActive: true
        });

        if (!empreendimento) {
            return res.status(404).json({
                error: 'Empreendimento não encontrado.'
            });
        }

        empreendimento.isActive = false;
        await empreendimento.save();

        res.json({
            message: 'Empreendimento excluído com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao excluir empreendimento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'ID do empreendimento inválido.'
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;
