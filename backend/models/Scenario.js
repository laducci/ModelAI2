const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome do cenário é obrigatório'],
        trim: true,
        maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Descrição não pode ter mais de 1000 caracteres']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        // Dados Gerais - 8 campos
        dadosGerais: {
            cliente: String,
            imobiliaria: String,
            incorporadora: String,
            empreendimento: String,
            unidade: String,
            areaPrivativa: Number,
            tmaAno: Number,
            tmaMes: Number
        },
        
        // Tabela de Vendas - 17 campos  
        tabelaVendas: {
            // Valor do Imóvel (1 campo)
            valorImovel: Number,
            
            // Entrada (4 campos)
            entradaValor: Number,
            entradaPercent: Number,
            entradaParcelas: Number,
            entradaValorParcela: Number,
            
            // Parcelas (4 campos)
            parcelasValor: Number,
            parcelasPercent: Number,
            parcelasQtd: Number,
            parcelasValorParcela: Number,
            
            // Reforço (5 campos)
            reforcoValor: Number,
            reforcoPercent: Number,
            reforcoQtd: Number,
            reforcoFrequencia: Number, // 3, 6 ou 12 meses
            reforcoValorParcela: Number,
            
            // Nas Chaves (2 campos)
            nasChavesValor: Number,
            nasChavesPercent: Number,
            
            // Outros (4 campos)
            bemMovelImovel: Number,
            bemMovelImovelMes: Number,
            bemMovelImovelPercent: Number,
            desagio: Number
        },
        
        // Proposta Cliente - 17 campos
        propostaCliente: {
            mesVenda: Number,
            
            // Entrada (4 campos)
            entradaValor: Number,
            entradaPercent: Number,
            entradaParcelas: Number,
            entradaValorParcela: Number,
            
            // Parcelas (4 campos)  
            parcelasValor: Number,
            parcelasPercent: Number,
            parcelasQtd: Number,
            parcelasValorParcela: Number,
            
            // Reforço (5 campos)
            reforcoValor: Number,
            reforcoPercent: Number,
            reforcoQtd: Number,
            reforcoFrequencia: Number, // 3, 6 ou 12 meses
            reforcoValorParcela: Number,
            
            // Outros (3 campos)
            bemMovelImovel: Number,
            bemMovelImovelPercent: Number,
            desagio: Number
        }
    },
    
    // Resultados calculados
    results: {
        // Valores totais
        valorTotalTabela: Number,
        valorTotalProposta: Number,
        
        // Descontos
        descontoNominalPercent: Number, // (Valor Proposta/Valor Tabela)-1
        descontoNominalReais: Number,   // Valor Tabela - Valor Proposta
        
        // VPLs
        vplTabela: Number,
        vplProposta: Number,
        
        // Deltas
        deltaVpl: Number,           // VPL Proposta - VPL Tabela
        percentualDeltaVpl: Number, // Delta VPL / VPL Tabela (com proteção SEERRO)
        
        // Metadados do cálculo
        calculatedAt: Date,
        tmaMesUsada: Number,
        periodosCalculados: Number
    },
    
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    version: {
        type: Number,
        default: 1
    },
    
    // Histórico de versões (para auditoria)
    history: [{
        version: Number,
        data: mongoose.Schema.Types.Mixed,
        results: mongoose.Schema.Types.Mixed,
        modifiedAt: Date,
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Middleware para salvar histórico antes de atualizar
scenarioSchema.pre('findOneAndUpdate', async function() {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
        const historyEntry = {
            version: docToUpdate.version,
            data: docToUpdate.data,
            results: docToUpdate.results,
            modifiedAt: docToUpdate.updatedAt,
            modifiedBy: this.getUpdate().userId || docToUpdate.userId
        };
        
        await this.model.updateOne(
            this.getQuery(),
            { 
                $push: { history: historyEntry },
                $inc: { version: 1 }
            }
        );
    }
});

// Índices para performance
scenarioSchema.index({ userId: 1, createdAt: -1 });
scenarioSchema.index({ name: 'text', description: 'text' });
scenarioSchema.index({ tags: 1 });
scenarioSchema.index({ isActive: 1 });

// Métodos estáticos
scenarioSchema.statics.findByUser = function(userId, options = {}) {
    const query = { userId, isActive: true };
    
    if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
    }
    
    if (options.search) {
        query.$text = { $search: options.search };
    }
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
};

// Método para calcular estatísticas
scenarioSchema.methods.calculateStats = function() {
    return {
        id: this._id,
        name: this.name,
        vplTabela: this.results?.vplTabela || 0,
        vplProposta: this.results?.vplProposta || 0,
        diferenca: this.results?.diferenca || 0,
        percentualDiferenca: this.results?.percentualDiferenca || 0,
        createdAt: this.createdAt,
        lastModified: this.updatedAt,
        version: this.version
    };
};

module.exports = mongoose.model('Scenario', scenarioSchema);