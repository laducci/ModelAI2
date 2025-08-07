const mongoose = require('mongoose');

// Schema para dados de fluxo de caixa
const cashFlowSchema = new mongoose.Schema({
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
    // Dados de fluxo de caixa por período
    periodos: [{
        ano: Number,
        mes: Number,
        data: Date,
        // Entradas
        entradas: {
            vendas: Number,
            financiamentos: Number,
            outrasReceitas: Number,
            total: Number
        },
        // Saídas
        saidas: {
            construccao: Number,
            marketing: Number,
            administrativo: Number,
            impostos: Number,
            financeiros: Number,
            outrasDesepesas: Number,
            total: Number
        },
        // Fluxo líquido
        fluxoLiquido: Number,
        // Fluxo acumulado
        fluxoAcumulado: Number
    }],
    // Projeções futuras
    projecoes: [{
        periodo: String,
        tipo: {
            type: String,
            enum: ['conservador', 'realista', 'otimista']
        },
        valor: Number,
        data: Date
    }],
    // Métricas calculadas
    metricas: {
        totalEntradas: Number,
        totalSaidas: Number,
        saldoAtual: Number,
        mediaEntradas: Number,
        mediaSaidas: Number,
        tendencia: {
            tipo: String, // 'positiva', 'negativa', 'estavel'
            percentual: Number
        }
    },
    // Configurações e filtros
    configuracoes: {
        moeda: {
            type: String,
            default: 'BRL'
        },
        unidadeValor: {
            type: String,
            enum: ['unidades', 'milhares', 'milhoes'],
            default: 'milhoes'
        },
        categoriasPersonalizadas: [{
            nome: String,
            tipo: String, // 'entrada' ou 'saida'
            cor: String
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
cashFlowSchema.index({ userId: 1, incorporadora: 1 });
cashFlowSchema.index({ 'periodos.ano': 1, 'periodos.mes': 1 });
cashFlowSchema.index({ ultimaAtualizacao: -1 });

// Método para calcular métricas
cashFlowSchema.methods.calcularMetricas = function() {
    const periodos = this.periodos || [];
    
    this.metricas = {
        totalEntradas: periodos.reduce((sum, p) => sum + (p.entradas?.total || 0), 0),
        totalSaidas: periodos.reduce((sum, p) => sum + (p.saidas?.total || 0), 0),
        saldoAtual: periodos.length > 0 ? 
            periodos[periodos.length - 1].fluxoAcumulado || 0 : 0,
        mediaEntradas: periodos.length > 0 ? 
            periodos.reduce((sum, p) => sum + (p.entradas?.total || 0), 0) / periodos.length : 0,
        mediaSaidas: periodos.length > 0 ? 
            periodos.reduce((sum, p) => sum + (p.saidas?.total || 0), 0) / periodos.length : 0
    };

    // Calcular tendência
    if (periodos.length >= 2) {
        const ultimosPeriodos = periodos.slice(-3);
        const mediaRecente = ultimosPeriodos.reduce((sum, p) => sum + p.fluxoLiquido, 0) / ultimosPeriodos.length;
        const mediaAnterior = periodos.slice(-6, -3).reduce((sum, p) => sum + p.fluxoLiquido, 0) / 3;
        
        if (mediaRecente > mediaAnterior * 1.05) {
            this.metricas.tendencia = { tipo: 'positiva', percentual: ((mediaRecente - mediaAnterior) / mediaAnterior) * 100 };
        } else if (mediaRecente < mediaAnterior * 0.95) {
            this.metricas.tendencia = { tipo: 'negativa', percentual: ((mediaAnterior - mediaRecente) / mediaAnterior) * 100 };
        } else {
            this.metricas.tendencia = { tipo: 'estavel', percentual: 0 };
        }
    }

    this.ultimaAtualizacao = new Date();
};

// Virtual para calcular fluxo acumulado
cashFlowSchema.virtual('fluxoAcumuladoTotal').get(function() {
    return this.periodos.reduce((acc, periodo) => {
        return acc + (periodo.fluxoLiquido || 0);
    }, 0);
});

module.exports = mongoose.model('CashFlow', cashFlowSchema);
