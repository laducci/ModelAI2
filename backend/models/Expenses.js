const mongoose = require('mongoose');

// Schema para dados de despesas
const expensesSchema = new mongoose.Schema({
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
    // Despesas por categoria
    categorias: [{
        nome: String,
        codigo: String,
        tipo: {
            type: String,
            enum: ['operacional', 'administrativa', 'comercial', 'financeira', 'tributaria']
        },
        cor: String, // Para gráficos
        // Subcategorias
        subcategorias: [{
            nome: String,
            codigo: String,
            descricao: String
        }]
    }],
    // Despesas individuais
    despesas: [{
        data: Date,
        periodo: String, // ex: "2024-08"
        categoria: String,
        subcategoria: String,
        empreendimento: String,
        centroCusto: String,
        descricao: String,
        // Valores
        valor: Number,
        moeda: String,
        // Classificação
        tipoDocumento: {
            type: String,
            enum: ['nota_fiscal', 'recibo', 'boleto', 'transferencia', 'outros']
        },
        numeroDocumento: String,
        fornecedor: {
            nome: String,
            cnpj: String,
            contato: String
        },
        // Status
        status: {
            type: String,
            enum: ['pendente', 'aprovada', 'paga', 'cancelada']
        },
        dataVencimento: Date,
        dataPagamento: Date,
        formaPagamento: String,
        // Aprovação
        aprovacao: {
            aprovador: String,
            dataAprovacao: Date,
            observacoes: String
        },
        // Rateio por empreendimento (se aplicável)
        rateio: [{
            empreendimento: String,
            percentual: Number,
            valor: Number
        }],
        // Anexos e observações
        anexos: [{
            nome: String,
            tipo: String,
            url: String
        }],
        observacoes: String
    }],
    // Análises por período
    analisePorPeriodo: [{
        ano: Number,
        mes: Number,
        data: Date,
        // Totais por categoria
        totalPorCategoria: [{
            categoria: String,
            valor: Number,
            percentual: Number,
            quantidade: Number
        }],
        // Totais por empreendimento
        totalPorEmpreendimento: [{
            empreendimento: String,
            valor: Number,
            percentual: Number
        }],
        // Comparativo com período anterior
        comparativo: {
            periodoAnterior: {
                total: Number,
                data: String
            },
            variacao: {
                valor: Number,
                percentual: Number,
                tipo: String // 'aumento', 'reducao', 'estavel'
            }
        },
        // Métricas do período
        metricas: {
            totalGeral: Number,
            ticketMedio: Number,
            despesaPorEmpreendimento: Number,
            eficienciaGasto: Number
        }
    }],
    // Orçamento vs Realizado
    orcamentoVsRealizado: [{
        periodo: String,
        categoria: String,
        orcado: Number,
        realizado: Number,
        variacao: Number,
        percentualVariacao: Number,
        status: {
            type: String,
            enum: ['dentro_orcamento', 'acima_orcamento', 'muito_acima']
        }
    }],
    // Fornecedores
    fornecedores: [{
        nome: String,
        cnpj: String,
        categoria: String,
        contato: {
            email: String,
            telefone: String,
            responsavel: String
        },
        // Histórico com fornecedor
        totalGasto: Number,
        numeroTransacoes: Number,
        ticketMedio: Number,
        ultimaCompra: Date,
        avaliacao: {
            qualidade: Number,
            prazo: Number,
            atendimento: Number,
            geral: Number
        }
    }],
    // Configurações
    configuracoes: {
        moeda: {
            type: String,
            default: 'BRL'
        },
        limitesAprovacao: [{
            nivel: String,
            valorMinimo: Number,
            valorMaximo: Number,
            aprovadores: [String]
        }],
        centroCusto: [{
            codigo: String,
            nome: String,
            responsavel: String
        }],
        workflow: {
            aprovacaoAutomatica: Boolean,
            valorLimiteAprovacao: Number,
            notificacoes: Boolean
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
expensesSchema.index({ userId: 1, incorporadora: 1 });
expensesSchema.index({ 'despesas.data': -1 });
expensesSchema.index({ 'despesas.categoria': 1 });
expensesSchema.index({ 'despesas.empreendimento': 1 });
expensesSchema.index({ 'despesas.status': 1 });
expensesSchema.index({ ultimaAtualizacao: -1 });

// Método para calcular análise do período
expensesSchema.methods.calcularAnalisePeriodo = function(ano, mes) {
    const despesasPeriodo = this.despesas.filter(d => {
        const dataDespesa = new Date(d.data);
        return dataDespesa.getFullYear() === ano && dataDespesa.getMonth() + 1 === mes;
    });
    
    const totalGeral = despesasPeriodo.reduce((sum, d) => sum + (d.valor || 0), 0);
    
    // Agrupar por categoria
    const porCategoria = {};
    despesasPeriodo.forEach(despesa => {
        if (!porCategoria[despesa.categoria]) {
            porCategoria[despesa.categoria] = { valor: 0, quantidade: 0 };
        }
        porCategoria[despesa.categoria].valor += despesa.valor || 0;
        porCategoria[despesa.categoria].quantidade += 1;
    });
    
    const totalPorCategoria = Object.entries(porCategoria).map(([categoria, data]) => ({
        categoria,
        valor: data.valor,
        percentual: totalGeral > 0 ? (data.valor / totalGeral) * 100 : 0,
        quantidade: data.quantidade
    }));
    
    // Agrupar por empreendimento
    const porEmpreendimento = {};
    despesasPeriodo.forEach(despesa => {
        if (despesa.empreendimento) {
            if (!porEmpreendimento[despesa.empreendimento]) {
                porEmpreendimento[despesa.empreendimento] = 0;
            }
            porEmpreendimento[despesa.empreendimento] += despesa.valor || 0;
        }
    });
    
    const totalPorEmpreendimento = Object.entries(porEmpreendimento).map(([empreendimento, valor]) => ({
        empreendimento,
        valor,
        percentual: totalGeral > 0 ? (valor / totalGeral) * 100 : 0
    }));
    
    return {
        ano,
        mes,
        data: new Date(ano, mes - 1, 1),
        totalPorCategoria,
        totalPorEmpreendimento,
        metricas: {
            totalGeral,
            ticketMedio: despesasPeriodo.length > 0 ? totalGeral / despesasPeriodo.length : 0,
            despesaPorEmpreendimento: Object.keys(porEmpreendimento).length > 0 ? 
                totalGeral / Object.keys(porEmpreendimento).length : 0
        }
    };
};

// Método para atualizar fornecedores
expensesSchema.methods.atualizarFornecedores = function() {
    const fornecedoresMap = new Map();
    
    this.despesas.forEach(despesa => {
        if (despesa.fornecedor && despesa.fornecedor.cnpj) {
            const cnpj = despesa.fornecedor.cnpj;
            
            if (!fornecedoresMap.has(cnpj)) {
                fornecedoresMap.set(cnpj, {
                    nome: despesa.fornecedor.nome,
                    cnpj: cnpj,
                    totalGasto: 0,
                    numeroTransacoes: 0,
                    ultimaCompra: despesa.data
                });
            }
            
            const fornecedor = fornecedoresMap.get(cnpj);
            fornecedor.totalGasto += despesa.valor || 0;
            fornecedor.numeroTransacoes += 1;
            
            if (despesa.data > fornecedor.ultimaCompra) {
                fornecedor.ultimaCompra = despesa.data;
            }
        }
    });
    
    // Calcular ticket médio
    fornecedoresMap.forEach(fornecedor => {
        fornecedor.ticketMedio = fornecedor.numeroTransacoes > 0 ? 
            fornecedor.totalGasto / fornecedor.numeroTransacoes : 0;
    });
    
    this.fornecedores = Array.from(fornecedoresMap.values());
    this.ultimaAtualizacao = new Date();
};

// Virtual para total de despesas
expensesSchema.virtual('totalDespesas').get(function() {
    return this.despesas.reduce((sum, despesa) => {
        return sum + (despesa.valor || 0);
    }, 0);
});

// Virtual para despesas pendentes
expensesSchema.virtual('despesasPendentes').get(function() {
    return this.despesas.filter(d => d.status === 'pendente');
});

module.exports = mongoose.model('Expenses', expensesSchema);
