const mongoose = require('mongoose');

// Schema para dados de obra
const constructionSchema = new mongoose.Schema({
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
    // Obras/Empreendimentos
    obras: [{
        nome: String,
        codigo: String,
        endereco: {
            logradouro: String,
            numero: String,
            complemento: String,
            bairro: String,
            cidade: String,
            uf: String,
            cep: String
        },
        // Informações gerais da obra
        informacoes: {
            tipoEmpreendimento: String,
            areaTotal: Number,
            areaPrivativa: Number,
            numeroUnidades: Number,
            numeroTorres: Number,
            numeroAndares: Number,
            dataInicio: Date,
            dataPrevisaoTermino: Date,
            dataTerminoReal: Date,
            status: {
                type: String,
                enum: ['planejamento', 'licenciamento', 'em_construcao', 'finalizada', 'entregue']
            }
        },
        // Cronograma de execução
        cronograma: [{
            etapa: String,
            codigo: String,
            descricao: String,
            dataInicioPlaneada: Date,
            dataFimPlaneada: Date,
            dataInicioReal: Date,
            dataFimReal: Date,
            percentualPlanejado: Number,
            percentualRealizado: Number,
            status: {
                type: String,
                enum: ['nao_iniciada', 'em_andamento', 'concluida', 'atrasada']
            },
            // Sub-etapas
            subetapas: [{
                nome: String,
                percentualConcluido: Number,
                responsavel: String,
                observacoes: String
            }]
        }],
        // Medições e acompanhamento
        medicoes: [{
            data: Date,
            periodo: String, // ex: "2024-08"
            // Progresso físico por etapa
            progressoFisico: [{
                etapa: String,
                percentualAnterior: Number,
                percentualAtual: Number,
                percentualPeriodo: Number,
                valorMedido: Number
            }],
            // Totais da medição
            totais: {
                percentualGeralAnterior: Number,
                percentualGeralAtual: Number,
                percentualPeriodo: Number,
                valorTotalMedido: Number
            },
            // Indicadores
            indicadores: {
                prazo: {
                    planejado: Number,
                    realizado: Number,
                    desvio: Number
                },
                custo: {
                    planejado: Number,
                    realizado: Number,
                    desvio: Number
                },
                qualidade: {
                    itensVerificados: Number,
                    itensConformes: Number,
                    percentualConformidade: Number
                }
            }
        }],
        // Controle de custos
        custos: [{
            categoria: String,
            subcategoria: String,
            descricao: String,
            orcado: Number,
            realizado: Number,
            comprometido: Number,
            saldo: Number,
            variacao: Number,
            percentualExecutado: Number
        }],
        // Equipe e recursos
        recursos: {
            equipe: [{
                nome: String,
                funcao: String,
                empresa: String,
                telefone: String,
                email: String,
                dataInicio: Date,
                dataFim: Date,
                ativo: Boolean
            }],
            equipamentos: [{
                tipo: String,
                modelo: String,
                quantidade: Number,
                valorDiario: Number,
                dataInicio: Date,
                dataFim: Date
            }]
        },
        // Documentação e licenças
        documentos: [{
            tipo: String,
            nome: String,
            numero: String,
            orgaoEmissor: String,
            dataEmissao: Date,
            dataVencimento: Date,
            status: String,
            observacoes: String
        }],
        // Métricas calculadas
        metricas: {
            percentualConclusao: Number,
            diasRestantes: Number,
            diasAtraso: Number,
            custoRealizado: Number,
            custoProjetado: Number,
            produtividade: Number,
            eficiencia: Number
        }
    }],
    // Configurações
    configuracoes: {
        unidadeMedida: {
            type: String,
            enum: ['m2', 'm3', 'unidade'],
            default: 'm2'
        },
        moeda: {
            type: String,
            default: 'BRL'
        },
        frequenciaMedicao: {
            type: String,
            enum: ['semanal', 'quinzenal', 'mensal'],
            default: 'mensal'
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
constructionSchema.index({ userId: 1, incorporadora: 1 });
constructionSchema.index({ 'obras.nome': 1 });
constructionSchema.index({ 'obras.informacoes.status': 1 });
constructionSchema.index({ ultimaAtualizacao: -1 });

// Método para calcular métricas da obra
constructionSchema.methods.calcularMetricasObra = function(obraId) {
    const obra = this.obras.id(obraId);
    if (!obra) return null;
    
    const hoje = new Date();
    const cronograma = obra.cronograma || [];
    const medicoes = obra.medicoes || [];
    
    // Calcular percentual de conclusão baseado na última medição
    const ultimaMedicao = medicoes.length > 0 ? 
        medicoes.sort((a, b) => b.data - a.data)[0] : null;
    
    obra.metricas = {
        percentualConclusao: ultimaMedicao ? ultimaMedicao.totais.percentualGeralAtual : 0,
        diasRestantes: obra.informacoes.dataPrevisaoTermino ? 
            Math.max(0, Math.ceil((obra.informacoes.dataPrevisaoTermino - hoje) / (1000 * 60 * 60 * 24))) : 0,
        diasAtraso: 0,
        custoRealizado: obra.custos.reduce((sum, c) => sum + (c.realizado || 0), 0),
        custoProjetado: obra.custos.reduce((sum, c) => sum + (c.orcado || 0), 0)
    };
    
    // Calcular atraso se passou da data prevista
    if (obra.informacoes.dataPrevisaoTermino && hoje > obra.informacoes.dataPrevisaoTermino) {
        obra.metricas.diasAtraso = Math.ceil((hoje - obra.informacoes.dataPrevisaoTermino) / (1000 * 60 * 60 * 24));
    }
    
    // Calcular produtividade e eficiência
    if (obra.metricas.custoProjetado > 0) {
        obra.metricas.eficiencia = (obra.metricas.percentualConclusao / 100) / 
            (obra.metricas.custoRealizado / obra.metricas.custoProjetado);
    }
    
    this.ultimaAtualizacao = new Date();
    return obra.metricas;
};

// Método para atualizar status das etapas
constructionSchema.methods.atualizarStatusEtapas = function() {
    const hoje = new Date();
    
    this.obras.forEach(obra => {
        obra.cronograma.forEach(etapa => {
            // Determinar status baseado nas datas e percentual
            if (etapa.percentualRealizado >= 100) {
                etapa.status = 'concluida';
            } else if (etapa.dataInicioReal && etapa.percentualRealizado > 0) {
                // Verificar se está atrasada
                if (etapa.dataFimPlaneada && hoje > etapa.dataFimPlaneada) {
                    etapa.status = 'atrasada';
                } else {
                    etapa.status = 'em_andamento';
                }
            } else if (etapa.dataInicioPlaneada && hoje >= etapa.dataInicioPlaneada) {
                etapa.status = 'atrasada';
            } else {
                etapa.status = 'nao_iniciada';
            }
        });
    });
    
    this.ultimaAtualizacao = new Date();
};

// Virtual para cronograma consolidado
constructionSchema.virtual('cronogramaConsolidado').get(function() {
    return this.obras.reduce((consolidado, obra) => {
        const etapas = obra.cronograma || [];
        
        consolidado.totalEtapas += etapas.length;
        consolidado.etapasConcluidas += etapas.filter(e => e.status === 'concluida').length;
        consolidado.etapasAtrasadas += etapas.filter(e => e.status === 'atrasada').length;
        
        return consolidado;
    }, { 
        totalEtapas: 0, 
        etapasConcluidas: 0, 
        etapasAtrasadas: 0 
    });
});

module.exports = mongoose.model('Construction', constructionSchema);
