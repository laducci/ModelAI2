const express = require('express');
const router = express.Router();
const SalesData = require('../models/SalesData');
const { auth } = require('../middleware/auth');

// GET /api/sales - Buscar dados de vendas do usuário
router.get('/', auth, async (req, res) => {
    try {
        const { empreendimento, periodo, tipo, unidade } = req.query;
        
        let salesData = await SalesData.findOne({ userId: req.user.id });
        
        if (!salesData) {
            return res.status(404).json({
                success: false,
                message: 'Dados de vendas não encontrados'
            });
        }
        
        // Aplicar filtros se fornecidos
        const filtros = {};
        if (empreendimento) filtros.empreendimentos = empreendimento.split(',');
        if (tipo) filtros.tipos = tipo.split(',');
        if (periodo) {
            const [inicio, fim] = periodo.split('|');
            if (inicio) filtros.periodoInicio = new Date(inicio);
            if (fim) filtros.periodoFim = new Date(fim);
        }
        
        const dadosFiltrados = salesData.filtrarDados(filtros);
        
        res.json({
            success: true,
            data: {
                empreendimentos: dadosFiltrados,
                filtros: salesData.filtros,
                totalGeral: salesData.totalGeral,
                ultimaAtualizacao: salesData.ultimaAtualizacao
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/sales/dashboard - Dados formatados para dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
        const salesData = await SalesData.findOne({ userId: req.user.id });
        
        if (!salesData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados'
            });
        }
        
        // Processar dados para gráficos
        const dashboardData = {
            // Dados para gráfico de barras por período
            vendasPorPeriodo: {},
            
            // Dados para gráfico de variação
            variacaoPorEmpreendimento: [],
            
            // Dados para tabela principal
            tabelaPrincipal: [],
            
            // Métricas resumo
            resumo: {
                totalVendas: 0,
                totalArea: 0,
                valorMedioM2: 0,
                quantidadeEmpreendimentos: salesData.empreendimentos.length
            },
            
            // Opções para filtros
            opcoesFiltros: {
                empreendimentos: [...new Set(salesData.empreendimentos.map(e => e.nome))],
                tipos: [...new Set(salesData.empreendimentos.map(e => e.tipo))],
                unidades: [...new Set(salesData.empreendimentos.map(e => e.unidade).filter(Boolean))]
            }
        };
        
        // Processar vendas por período
        salesData.empreendimentos.forEach(emp => {
            emp.vendasMensais.forEach(venda => {
                const periodo = `${venda.ano}-${String(venda.mes).padStart(2, '0')}`;
                if (!dashboardData.vendasPorPeriodo[periodo]) {
                    dashboardData.vendasPorPeriodo[periodo] = {
                        periodo,
                        vendas: 0,
                        area: 0,
                        quantidade: 0
                    };
                }
                dashboardData.vendasPorPeriodo[periodo].vendas += venda.vendas || 0;
                dashboardData.vendasPorPeriodo[periodo].area += venda.area || 0;
                dashboardData.vendasPorPeriodo[periodo].quantidade += venda.quantidade || 0;
            });
            
            // Dados para variação por empreendimento
            if (emp.metricas && emp.metricas.variacao) {
                dashboardData.variacaoPorEmpreendimento.push({
                    nome: emp.nome,
                    variacao: emp.metricas.variacao.percentual,
                    tipo: emp.metricas.variacao.tipo,
                    valor: emp.metricas.totalVendas
                });
            }
            
            // Dados para tabela principal
            dashboardData.tabelaPrincipal.push({
                projeto: emp.nome,
                unidade: emp.unidade || '',
                titulo: emp.codigo || '',
                cliente: req.user.company || '',
                vendas: emp.metricas?.totalVendas || 0,
                valorM2: emp.metricas?.valorMedioM2 || 0,
                area: emp.metricas?.totalArea || 0,
                data: emp.vendasMensais.length > 0 ? 
                    emp.vendasMensais[emp.vendasMensais.length - 1].data : null
            });
            
            // Somar para resumo
            dashboardData.resumo.totalVendas += emp.metricas?.totalVendas || 0;
            dashboardData.resumo.totalArea += emp.metricas?.totalArea || 0;
        });
        
        // Calcular valor médio m² geral
        if (dashboardData.resumo.totalArea > 0) {
            dashboardData.resumo.valorMedioM2 = dashboardData.resumo.totalVendas / dashboardData.resumo.totalArea;
        }
        
        // Converter vendas por período para array ordenado
        dashboardData.vendasPorPeriodo = Object.values(dashboardData.vendasPorPeriodo)
            .sort((a, b) => a.periodo.localeCompare(b.periodo));
        
        res.json({
            success: true,
            data: dashboardData
        });
        
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// POST /api/sales - Criar/Atualizar dados de vendas
router.post('/', auth, async (req, res) => {
    try {
        const { incorporadora, empreendimentos, periodos } = req.body;
        
        let salesData = await SalesData.findOne({ userId: req.user.id });
        
        if (salesData) {
            // Atualizar dados existentes
            salesData.incorporadora = incorporadora || salesData.incorporadora;
            salesData.empreendimentos = empreendimentos || salesData.empreendimentos;
            salesData.periodos = periodos || salesData.periodos;
            salesData.atualizarMetricas();
        } else {
            // Criar novos dados
            salesData = new SalesData({
                userId: req.user.id,
                incorporadora: incorporadora || req.user.company,
                empreendimentos: empreendimentos || [],
                periodos: periodos || []
            });
        }
        
        await salesData.save();
        
        res.json({
            success: true,
            message: 'Dados de vendas salvos com sucesso',
            data: salesData
        });
        
    } catch (error) {
        console.error('Erro ao salvar dados de vendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar dados'
        });
    }
});

// PUT /api/sales/filters - Atualizar filtros salvos
router.put('/filters', auth, async (req, res) => {
    try {
        const filtros = req.body;
        
        const salesData = await SalesData.findOne({ userId: req.user.id });
        
        if (!salesData) {
            return res.status(404).json({
                success: false,
                message: 'Dados não encontrados'
            });
        }
        
        salesData.filtros = { ...salesData.filtros, ...filtros };
        await salesData.save();
        
        res.json({
            success: true,
            message: 'Filtros atualizados com sucesso',
            data: salesData.filtros
        });
        
    } catch (error) {
        console.error('Erro ao atualizar filtros:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar filtros'
        });
    }
});

module.exports = router;
