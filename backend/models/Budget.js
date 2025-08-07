const mongoose = require('mongoose');

// Schema para dados de orçamento
const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    incorporadora: {
        type: String,
        required: true,
        trim: true
    },
    // Orçamentos por empreendimento
    empreendimentos: [{
        nome: String,
        codigo: String,
        status: {
            type: String,
            enum: ['planejamento', 'aprovado', 'em_execucao', 'finalizado']
        },
        // Orçamento por categorias
        categorias: [{
            nome: String,
            codigo: String,
            tipo: {
                type: String,
                enum: ['receita', 'despesa', 'investimento']
            },
            // Subcategorias
            subcategorias: [{
                nome: String,
                codigo: String,
                orcadoAnual: Number,
                orcadoMensal: Number,
                realizadoAcumulado: Number,
                saldoDisponivel: Number,
                percentualExecutado: Number
            }],
            totalOrcado: Number,
            totalRealizado: Number,
            variacao: Number,
            percentualVariacao: Number
        }],
        // Orçamento por período
        periodos: [{
            ano: Number,
            mes: Number,
            // Valores orçados
            orcado: {
                receitas: Number,
                despesas: Number,
                investimentos: Number,
                resultado: Number
            },
            // Valores realizados
            realizado: {
                receitas: Number,
                despesas: Number,
                investimentos: Number,
                resultado: Number
            },
            // Variações
            variacoes: {
                receitas: { valor: Number, percentual: Number },
                despesas: { valor: Number, percentual: Number },
                investimentos: { valor: Number, percentual: Number },
                resultado: { valor: Number, percentual: Number }
            }
        }],
        // Métricas do empreendimento
        metricas: {
            totalOrcado: Number,
            totalRealizado: Number,
            variacaoTotal: Number,
            percentualExecucao: Number,
            roi: Number, // Return on Investment
            payback: Number // em meses
        }
    }],
    // Configurações e cenários
    cenarios: [{
        nome: String,
        tipo: {
            type: String,
            enum: ['conservador', 'realista', 'otimista']
        },
        premissas: [{
            categoria: String,
            descricao: String,
            valor: Number,
            unidade: String
        }],
        resultados: {
            receita: Number,
            despesa: Number,
            lucro: Number,
            margem: Number
        }
    }],
    // Configurações gerais
    configuracoes: {
        moeda: {
            type: String,
            default: 'BRL'
        },
        anoBase: Number,
        periodoOrcamentario: {
            inicio: Date,
            fim: Date
        },
        aprovadores: [{
            nome: String,
            email: String,
            nivel: Number
        }]
    },
    ultimaAtualizacao: {
        type: Date,
        default: Date.now
    },
    sincronizadoEm: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para performance
budgetSchema.index({ userId: 1, incorporadora: 1 });
budgetSchema.index({ 'empreendimentos.nome': 1 });
budgetSchema.index({ 'empreendimentos.status': 1 });
budgetSchema.index({ ultimaAtualizacao: -1 });

// Método para calcular métricas por empreendimento
budgetSchema.methods.calcularMetricasEmpreendimento = function(empreendimentoId) {
    const emp = this.empreendimentos.id(empreendimentoId);
    if (!emp) return null;
    
    const categorias = emp.categorias || [];
    
    emp.metricas = {
        totalOrcado: categorias.reduce((sum, cat) => sum + (cat.totalOrcado || 0), 0),
        totalRealizado: categorias.reduce((sum, cat) => sum + (cat.totalRealizado || 0), 0)
    };
    
    emp.metricas.variacaoTotal = emp.metricas.totalRealizado - emp.metricas.totalOrcado;
    emp.metricas.percentualExecucao = emp.metricas.totalOrcado > 0 ? 
        (emp.metricas.totalRealizado / emp.metricas.totalOrcado) * 100 : 0;
    
    this.ultimaAtualizacao = new Date();
    return emp.metricas;
};

// Método para atualizar subcategorias
budgetSchema.methods.atualizarSubcategorias = function() {
    this.empreendimentos.forEach(emp => {
        emp.categorias.forEach(cat => {
            cat.subcategorias.forEach(subcat => {
                subcat.saldoDisponivel = (subcat.orcadoAnual || 0) - (subcat.realizadoAcumulado || 0);
                subcat.percentualExecutado = subcat.orcadoAnual > 0 ? 
                    (subcat.realizadoAcumulado / subcat.orcadoAnual) * 100 : 0;
            });
            
            // Atualizar totais da categoria
            cat.totalOrcado = cat.subcategorias.reduce((sum, sub) => sum + (sub.orcadoAnual || 0), 0);
            cat.totalRealizado = cat.subcategorias.reduce((sum, sub) => sum + (sub.realizadoAcumulado || 0), 0);
            cat.variacao = cat.totalRealizado - cat.totalOrcado;
            cat.percentualVariacao = cat.totalOrcado > 0 ? (cat.variacao / cat.totalOrcado) * 100 : 0;
        });
    });
    
    this.ultimaAtualizacao = new Date();
};

// Virtual para orçamento consolidado
budgetSchema.virtual('orcamentoConsolidado').get(function() {
    return this.empreendimentos.reduce((consolidado, emp) => {
        const empTotal = {
            orcado: emp.categorias.reduce((sum, cat) => sum + (cat.totalOrcado || 0), 0),
            realizado: emp.categorias.reduce((sum, cat) => sum + (cat.totalRealizado || 0), 0)
        };
        
        consolidado.totalOrcado += empTotal.orcado;
        consolidado.totalRealizado += empTotal.realizado;
        
        return consolidado;
    }, { totalOrcado: 0, totalRealizado: 0 });
});

module.exports = mongoose.model('Budget', budgetSchema);
