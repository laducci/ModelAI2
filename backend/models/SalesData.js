const mongoose = require('mongoose');

// Schema para dados de vendas por empreendimento
const salesDataSchema = new mongoose.Schema({
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
    // Dados por empreendimento
    empreendimentos: [{
        nome: {
            type: String,
            required: true
        },
        codigo: String,
        status: {
            type: String,
            enum: ['Buettner', 'Era', 'Futura', 'Orgânica', 'Participações', 'Plural'],
            required: true
        },
        tipo: {
            type: String,
            enum: ['Sion', 'Orgânica', 'Era', 'Sunhaus', 'Sunstar', 'Plural', 'Futura'],
            required: true
        },
        unidade: String,
        // Dados de vendas mensais
        vendasMensais: [{
            ano: Number,
            mes: Number,
            vendas: Number,  // em milhões
            area: Number,    // m²
            quantidade: Number,
            valorM2: Number,
            data: Date
        }],
        // Métricas calculadas
        metricas: {
            totalVendas: Number,
            totalArea: Number,
            valorMedioM2: Number,
            variacao: {
                valor: Number,
                percentual: Number,
                tipo: {
                    type: String,
                    enum: ['positiva', 'negativa', 'neutro']
                }
            }
        }
    }],
    // Dados agregados por período
    periodos: [{
        ano: Number,
        mes: Number,
        // Dados por projeto
        projetos: [{
            projeto: String,
            periodo: String,
            medio: Number,
            percentual: Number,
            cliente: String,
            vendas: Number,
            valorM2: Number,
            data: Date
        }]
    }],
    // Configurações de filtros
    filtros: {
        periodoInicio: Date,
        periodoFim: Date,
        empreendimentosSelecionados: [String],
        unidadesSelecionadas: [String],
        titulosSelecionados: [String]
    },
    // Metadados
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
salesDataSchema.index({ userId: 1, incorporadora: 1 });
salesDataSchema.index({ 'empreendimentos.nome': 1 });
salesDataSchema.index({ 'vendasMensais.ano': 1, 'vendasMensais.mes': 1 });
salesDataSchema.index({ ultimaAtualizacao: -1 });

// Virtual para calcular totais
salesDataSchema.virtual('totalGeral').get(function() {
    return this.empreendimentos.reduce((total, emp) => {
        return total + (emp.metricas?.totalVendas || 0);
    }, 0);
});

// Método para atualizar métricas
salesDataSchema.methods.atualizarMetricas = function() {
    this.empreendimentos.forEach(emp => {
        const vendas = emp.vendasMensais || [];
        emp.metricas = {
            totalVendas: vendas.reduce((sum, v) => sum + (v.vendas || 0), 0),
            totalArea: vendas.reduce((sum, v) => sum + (v.area || 0), 0),
            valorMedioM2: vendas.length > 0 ? 
                vendas.reduce((sum, v) => sum + (v.valorM2 || 0), 0) / vendas.length : 0
        };
    });
    this.ultimaAtualizacao = new Date();
};

// Método para filtrar dados
salesDataSchema.methods.filtrarDados = function(filtros = {}) {
    let dados = this.empreendimentos;
    
    if (filtros.empreendimentos && filtros.empreendimentos.length > 0) {
        dados = dados.filter(emp => filtros.empreendimentos.includes(emp.nome));
    }
    
    if (filtros.tipos && filtros.tipos.length > 0) {
        dados = dados.filter(emp => filtros.tipos.includes(emp.tipo));
    }
    
    if (filtros.periodoInicio || filtros.periodoFim) {
        dados.forEach(emp => {
            emp.vendasMensais = emp.vendasMensais.filter(venda => {
                const dataVenda = venda.data;
                if (filtros.periodoInicio && dataVenda < filtros.periodoInicio) return false;
                if (filtros.periodoFim && dataVenda > filtros.periodoFim) return false;
                return true;
            });
        });
    }
    
    return dados;
};

module.exports = mongoose.model('SalesData', salesDataSchema);
