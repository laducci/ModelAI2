const express = require('express');
const router = express.Router();
const CashFlow = require('../models/CashFlow');
const { auth } = require('../middleware/auth');

// GET /api/cashflow/dashboard - Dados para dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
        const cashFlow = await CashFlow.findOne({ userId: req.user.id });
        
        if (!cashFlow) {
            return res.json({
                success: true,
                data: {
                    periodos: [],
                    projecoes: [],
                    metricas: {
                        totalEntradas: 0,
                        totalSaidas: 0,
                        saldoAtual: 0,
                        mediaEntradas: 0,
                        mediaSaidas: 0,
                        tendencia: { tipo: 'estavel', percentual: 0 }
                    },
                    resumo: {
                        fluxoPositivo: 0,
                        fluxoNegativo: 0,
                        saldoProjetado: 0
                    }
                }
            });
        }
        
        // Calcular métricas atualizadas
        cashFlow.calcularMetricas();
        
        // Processar dados para dashboard
        const dashboardData = {
            periodos: cashFlow.periodos.map(periodo => ({
                periodo: `${periodo.ano}-${String(periodo.mes).padStart(2, '0')}`,
                entradas: periodo.entradas.total,
                saidas: periodo.saidas.total,
                fluxoLiquido: periodo.fluxoLiquido,
                fluxoAcumulado: periodo.fluxoAcumulado,
                detalhes: {
                    entradas: periodo.entradas,
                    saidas: periodo.saidas
                }
            })),
            projecoes: cashFlow.projecoes,
            metricas: cashFlow.metricas,
            resumo: {
                fluxoPositivo: cashFlow.periodos.filter(p => p.fluxoLiquido > 0).length,
                fluxoNegativo: cashFlow.periodos.filter(p => p.fluxoLiquido < 0).length,
                saldoProjetado: cashFlow.fluxoAcumuladoTotal
            }
        };
        
        res.json({
            success: true,
            data: dashboardData
        });
        
    } catch (error) {
        console.error('Erro ao buscar dados do fluxo de caixa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// PUT /api/cashflow/periodo - Atualizar período específico
router.put('/periodo', auth, async (req, res) => {
    try {
        const { ano, mes, entradas, saidas } = req.body;
        
        let cashFlow = await CashFlow.findOne({ userId: req.user.id });
        
        if (!cashFlow) {
            cashFlow = new CashFlow({
                userId: req.user.id,
                incorporadora: req.user.company || 'Incorporadora'
            });
        }
        
        // Encontrar ou criar período
        let periodo = cashFlow.periodos.find(p => p.ano === ano && p.mes === mes);
        
        if (!periodo) {
            periodo = {
                ano,
                mes,
                data: new Date(ano, mes - 1, 1),
                entradas: {
                    vendas: 0,
                    financiamentos: 0,
                    outrasReceitas: 0,
                    total: 0
                },
                saidas: {
                    construccao: 0,
                    marketing: 0,
                    administrativo: 0,
                    impostos: 0,
                    financeiros: 0,
                    outrasDesepesas: 0,
                    total: 0
                },
                fluxoLiquido: 0,
                fluxoAcumulado: 0
            };
            cashFlow.periodos.push(periodo);
        }
        
        // Atualizar valores
        if (entradas) {
            periodo.entradas = { ...periodo.entradas, ...entradas };
            periodo.entradas.total = Object.values(periodo.entradas).reduce((sum, val) => 
                typeof val === 'number' ? sum + val : sum, 0);
        }
        
        if (saidas) {
            periodo.saidas = { ...periodo.saidas, ...saidas };
            periodo.saidas.total = Object.values(periodo.saidas).reduce((sum, val) => 
                typeof val === 'number' ? sum + val : sum, 0);
        }
        
        periodo.fluxoLiquido = periodo.entradas.total - periodo.saidas.total;
        
        // Recalcular fluxo acumulado
        cashFlow.periodos.sort((a, b) => {
            if (a.ano !== b.ano) return a.ano - b.ano;
            return a.mes - b.mes;
        });
        
        let acumulado = 0;
        cashFlow.periodos.forEach(p => {
            acumulado += p.fluxoLiquido;
            p.fluxoAcumulado = acumulado;
        });
        
        cashFlow.calcularMetricas();
        await cashFlow.save();
        
        res.json({
            success: true,
            message: 'Período atualizado com sucesso',
            data: periodo
        });
        
    } catch (error) {
        console.error('Erro ao atualizar período:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar período'
        });
    }
});

// GET /api/cashflow/projecoes - Obter projeções
router.get('/projecoes', auth, async (req, res) => {
    try {
        const { tipo, meses } = req.query;
        
        const cashFlow = await CashFlow.findOne({ userId: req.user.id });
        
        if (!cashFlow) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        let projecoes = cashFlow.projecoes;
        
        if (tipo) {
            projecoes = projecoes.filter(p => p.tipo === tipo);
        }
        
        if (meses) {
            const hoje = new Date();
            const limite = new Date();
            limite.setMonth(hoje.getMonth() + parseInt(meses));
            projecoes = projecoes.filter(p => p.data <= limite);
        }
        
        res.json({
            success: true,
            data: projecoes
        });
        
    } catch (error) {
        console.error('Erro ao buscar projeções:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar projeções'
        });
    }
});

module.exports = router;
