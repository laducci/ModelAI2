const mongoose = require('mongoose');

// Schema para dados de inadimplência
const defaultsSchema = new mongoose.Schema({
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
    // Dados de inadimplência por cliente/contrato
    contratos: [{
        contratoId: String,
        cliente: {
            nome: String,
            cpfCnpj: String,
            email: String,
            telefone: String
        },
        empreendimento: String,
        unidade: String,
        // Valores do contrato
        valores: {
            valorTotal: Number,
            valorPago: Number,
            saldoDevedor: Number,
            valorVencido: Number
        },
        // Parcelas
        parcelas: [{
            numero: Number,
            vencimento: Date,
            valor: Number,
            valorPago: Number,
            dataPagamento: Date,
            status: {
                type: String,
                enum: ['em_dia', 'vencida', 'paga', 'renegociada']
            },
            diasAtraso: Number
        }],
        // Status geral do contrato
        statusGeral: {
            type: String,
            enum: ['adimplente', 'inadimplente', 'renegociado', 'juridico']
        },
        diasAtrasoTotal: Number,
        dataUltimoPagamento: Date,
        // Histórico de ações
        acoes: [{
            tipo: {
                type: String,
                enum: ['cobranca', 'negociacao', 'juridico', 'pagamento']
            },
            data: Date,
            descricao: String,
            valor: Number,
            responsavel: String
        }]
    }],
    // Métricas por período
    metricasPorPeriodo: [{
        ano: Number,
        mes: Number,
        data: Date,
        // Métricas gerais
        totalContratos: Number,
        contratosInadimplentes: Number,
        percentualInadimplencia: Number,
        valorTotalVencido: Number,
        valorTotalRecuperado: Number,
        // Por faixa de atraso
        faixasAtraso: {
            ate30dias: { quantidade: Number, valor: Number },
            de31a60dias: { quantidade: Number, valor: Number },
            de61a90dias: { quantidade: Number, valor: Number },
            de91a180dias: { quantidade: Number, valor: Number },
            acima180dias: { quantidade: Number, valor: Number }
        },
        // Por empreendimento
        porEmpreendimento: [{
            nome: String,
            inadimplencia: Number,
            percentual: Number
        }]
    }],
    // Configurações de cobrança
    configuracoes: {
        diasTolerancia: {
            type: Number,
            default: 5
        },
        escalasCobranca: [{
            diasAtraso: Number,
            acao: String,
            automatica: Boolean
        }],
        jurosMulta: {
            jurosMensal: Number,
            multaAtraso: Number
        }
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
defaultsSchema.index({ userId: 1, incorporadora: 1 });
defaultsSchema.index({ 'contratos.contratoId': 1 });
defaultsSchema.index({ 'contratos.cliente.cpfCnpj': 1 });
defaultsSchema.index({ 'contratos.statusGeral': 1 });
defaultsSchema.index({ ultimaAtualizacao: -1 });

// Método para calcular métricas atuais
defaultsSchema.methods.calcularMetricasAtuais = function() {
    const contratos = this.contratos || [];
    const hoje = new Date();
    
    const inadimplentes = contratos.filter(c => c.statusGeral === 'inadimplente');
    const valorTotal = contratos.reduce((sum, c) => sum + (c.valores?.valorTotal || 0), 0);
    const valorVencido = contratos.reduce((sum, c) => sum + (c.valores?.valorVencido || 0), 0);
    
    // Calcular por faixas de atraso
    const faixas = {
        ate30dias: { quantidade: 0, valor: 0 },
        de31a60dias: { quantidade: 0, valor: 0 },
        de61a90dias: { quantidade: 0, valor: 0 },
        de91a180dias: { quantidade: 0, valor: 0 },
        acima180dias: { quantidade: 0, valor: 0 }
    };

    inadimplentes.forEach(contrato => {
        const dias = contrato.diasAtrasoTotal || 0;
        const valor = contrato.valores?.valorVencido || 0;
        
        if (dias <= 30) {
            faixas.ate30dias.quantidade++;
            faixas.ate30dias.valor += valor;
        } else if (dias <= 60) {
            faixas.de31a60dias.quantidade++;
            faixas.de31a60dias.valor += valor;
        } else if (dias <= 90) {
            faixas.de61a90dias.quantidade++;
            faixas.de61a90dias.valor += valor;
        } else if (dias <= 180) {
            faixas.de91a180dias.quantidade++;
            faixas.de91a180dias.valor += valor;
        } else {
            faixas.acima180dias.quantidade++;
            faixas.acima180dias.valor += valor;
        }
    });

    return {
        totalContratos: contratos.length,
        contratosInadimplentes: inadimplentes.length,
        percentualInadimplencia: contratos.length > 0 ? (inadimplentes.length / contratos.length) * 100 : 0,
        valorTotalVencido: valorVencido,
        faixasAtraso: faixas,
        data: hoje
    };
};

// Método para atualizar status de contratos
defaultsSchema.methods.atualizarStatusContratos = function() {
    const hoje = new Date();
    
    this.contratos.forEach(contrato => {
        const parcelasVencidas = contrato.parcelas.filter(p => 
            p.vencimento < hoje && p.status !== 'paga'
        );
        
        if (parcelasVencidas.length > 0) {
            // Calcular dias de atraso
            const primeiraVencida = parcelasVencidas.sort((a, b) => a.vencimento - b.vencimento)[0];
            contrato.diasAtrasoTotal = Math.floor((hoje - primeiraVencida.vencimento) / (1000 * 60 * 60 * 24));
            
            // Calcular valor vencido
            contrato.valores.valorVencido = parcelasVencidas.reduce((sum, p) => 
                sum + (p.valor - (p.valorPago || 0)), 0
            );
            
            // Definir status geral
            if (contrato.diasAtrasoTotal > (this.configuracoes?.diasTolerancia || 5)) {
                contrato.statusGeral = 'inadimplente';
            }
        } else {
            contrato.statusGeral = 'adimplente';
            contrato.diasAtrasoTotal = 0;
            contrato.valores.valorVencido = 0;
        }
    });
    
    this.ultimaAtualizacao = new Date();
};

// Virtual para total inadimplente
defaultsSchema.virtual('totalInadimplente').get(function() {
    return this.contratos.reduce((sum, contrato) => {
        return sum + (contrato.valores?.valorVencido || 0);
    }, 0);
});

module.exports = mongoose.model('Defaults', defaultsSchema);
