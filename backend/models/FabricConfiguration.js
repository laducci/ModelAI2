const mongoose = require('mongoose');

const fabricConfigurationSchema = new mongoose.Schema({
    // Identificação da empresa
    company: {
        type: String,
        required: true,
        index: true
    },
    
    // Configuração do Workspace
    workspaceId: {
        type: String,
        required: true
    },
    workspaceName: {
        type: String,
        required: true
    },
    
    // Configuração do Semantic Model
    semanticModelId: {
        type: String,
        required: true
    },
    semanticModelName: {
        type: String,
        required: true
    },
    
    // Módulos habilitados para sincronização
    modules: [{
        type: String,
        enum: ['vendas', 'fluxoCaixa', 'orcamento', 'obra', 'despesas', 'inadimplencia'],
        default: ['vendas', 'fluxoCaixa', 'orcamento', 'obra', 'despesas']
    }],
    
    // Configuração de sincronização
    syncSettings: {
        autoSync: {
            type: Boolean,
            default: true
        },
        syncFrequency: {
            type: String,
            enum: ['realtime', 'hourly', 'daily', 'weekly'],
            default: 'daily'
        },
        lastSync: {
            type: Date,
            default: null
        },
        nextSync: {
            type: Date,
            default: null
        }
    },
    
    // Metadados
    configuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    configuredAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Log de sincronizações
    syncHistory: [{
        syncDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['success', 'partial', 'failed'],
            required: true
        },
        recordsCount: {
            type: Number,
            default: 0
        },
        modules: [{
            name: String,
            recordsCount: Number,
            status: String,
            error: String
        }],
        error: String,
        duration: Number // em milissegundos
    }]
}, {
    timestamps: true,
    collection: 'fabricconfigurations'
});

// Índices
fabricConfigurationSchema.index({ company: 1, isActive: 1 });
fabricConfigurationSchema.index({ configuredBy: 1 });
fabricConfigurationSchema.index({ 'syncSettings.nextSync': 1 });

// Métodos
fabricConfigurationSchema.methods.addSyncLog = function(syncResult) {
    this.syncHistory.unshift(syncResult);
    
    // Manter apenas os últimos 50 logs
    if (this.syncHistory.length > 50) {
        this.syncHistory = this.syncHistory.slice(0, 50);
    }
    
    // Atualizar configurações de sync
    this.syncSettings.lastSync = new Date();
    
    // Calcular próxima sincronização
    if (this.syncSettings.autoSync) {
        const now = new Date();
        switch (this.syncSettings.syncFrequency) {
            case 'hourly':
                this.syncSettings.nextSync = new Date(now.getTime() + 60 * 60 * 1000);
                break;
            case 'daily':
                this.syncSettings.nextSync = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                this.syncSettings.nextSync = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                this.syncSettings.nextSync = null;
        }
    }
    
    return this.save();
};

fabricConfigurationSchema.methods.getLastSyncStatus = function() {
    if (this.syncHistory.length === 0) {
        return { status: 'never', message: 'Nunca sincronizado' };
    }
    
    const lastSync = this.syncHistory[0];
    return {
        status: lastSync.status,
        date: lastSync.syncDate,
        recordsCount: lastSync.recordsCount,
        message: lastSync.error || 'Sincronização realizada com sucesso'
    };
};

// Statics
fabricConfigurationSchema.statics.findByCompany = function(company) {
    return this.findOne({ company, isActive: true });
};

fabricConfigurationSchema.statics.getConfigurationsForSync = function() {
    const now = new Date();
    return this.find({
        isActive: true,
        'syncSettings.autoSync': true,
        $or: [
            { 'syncSettings.nextSync': { $lte: now } },
            { 'syncSettings.nextSync': null }
        ]
    });
};

module.exports = mongoose.model('FabricConfiguration', fabricConfigurationSchema);
