const express = require('express');
const router = express.Router();
const FabricIntegration = require('../integrations/FabricIntegration');
const FabricConfiguration = require('../models/FabricConfiguration');
const SalesData = require('../models/SalesData');
const CashFlow = require('../models/CashFlow');
const Defaults = require('../models/Defaults');
const Budget = require('../models/Budget');
const Construction = require('../models/Construction');
const Expenses = require('../models/Expenses');
const User = require('../models/User');
const Scenario = require('../models/Scenario');
const { auth, adminAuth } = require('../middleware/auth');

// GET /api/fabric/debug-powerbi - Debug PowerBI API (ADMIN ONLY)
router.get('/debug-powerbi', auth, adminAuth, async (req, res) => {
    try {
        
        
        const fabric = new FabricIntegration();
        await fabric.authenticate();
        
        
        
        
        
        // Teste 1: Chamar API de workspaces diretamente
        const workspacesResponse = await fetch('https://api.powerbi.com/v1.0/myorg/groups', {
            headers: {
                'Authorization': `Bearer ${fabric.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        
        const workspacesText = await workspacesResponse.text();
        
        
        // Teste 2: Verificar capacidades do usuário
        const capacitiesResponse = await fetch('https://api.powerbi.com/v1.0/myorg/capacities', {
            headers: {
                'Authorization': `Bearer ${fabric.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        
        const capacitiesText = await capacitiesResponse.text();
        
        
        res.json({
            success: true,
            debug: {
                hasToken: !!fabric.accessToken,
                tenantId: fabric.tenantId,
                clientId: fabric.clientId,
                workspacesStatus: workspacesResponse.status,
                workspacesResponse: workspacesText,
                capacitiesStatus: capacitiesResponse.status,
                capacitiesResponse: capacitiesText
            }
        });
        
    } catch (error) {
        console.error('❌ DEBUG ERROR:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// GET /api/fabric/test-connection - Testar conexão com Fabric (ADMIN ONLY)
router.get('/test-connection', auth, adminAuth, async (req, res) => {
    try {
        const fabric = new FabricIntegration();
        const connectionTest = await fabric.testConnection();
        
        res.json({
            success: true,
            data: connectionTest
        });
        
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao testar conexão com Fabric'
        });
    }
});

// GET /api/fabric/workspaces - Listar workspaces (ADMIN ONLY)
router.get('/workspaces', auth, adminAuth, async (req, res) => {
    try {
        const fabric = new FabricIntegration();
        const workspaces = await fabric.listWorkspaces();
        
        res.json({
            success: true,
            data: {
                mode: 'production',
                workspaces: workspaces,
                message: `${workspaces.length} workspaces encontrados`
            }
        });
        
    } catch (error) {
        console.error('Erro ao listar workspaces:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao conectar com Microsoft Fabric: ' + error.message
        });
    }
});

// GET /api/fabric/datasets/:workspaceId - Listar datasets de um workspace (ADMIN ONLY)
router.get('/datasets/:workspaceId', auth, adminAuth, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        
        
        const fabric = new FabricIntegration();
        
        const datasets = await fabric.listSemanticModels(workspaceId);
        
        
        res.json({
            success: true,
            data: {
                mode: 'production',
                datasets: datasets,
                message: `${datasets.length} datasets encontrados no workspace`,
                workspaceId: workspaceId
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar datasets:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar datasets: ' + error.message,
            workspaceId: req.params.workspaceId
        });
    }
});

// POST /api/fabric/save-configuration - Salvar configuração Incorporadora → Semantic Model (ADMIN ONLY)
router.post('/save-configuration', auth, adminAuth, async (req, res) => {
    try {
        console.log('🧪 [FABRIC SAVE] Recebendo dados:', JSON.stringify(req.body, null, 2));
        
        const { 
            incorporadora,  // Mudando de 'company' para 'incorporadora' 
            workspaceId, 
            workspaceName, 
            datasetId,     // Mudando de 'semanticModelId' para 'datasetId'
            datasetName,   // Mudando de 'semanticModelName' para 'datasetName'
            modules 
        } = req.body;
        
        console.log('🧪 [FABRIC SAVE] Campos extraídos:', {
            incorporadora,
            workspaceId,
            workspaceName,
            datasetId,
            datasetName,
            modules
        });
        
        if (!incorporadora || !workspaceId || !datasetId) {
            
            return res.status(400).json({
                success: false,
                message: 'Incorporadora, workspace e dataset são obrigatórios'
            });
        }
        
        // Verificar se já existe configuração para essa empresa
        let existingConfig = await FabricConfiguration.findByCompany(incorporadora);
        
        if (existingConfig) {
            
            // Atualizar configuração existente
            existingConfig.company = incorporadora;
            existingConfig.workspaceId = workspaceId;
            existingConfig.workspaceName = workspaceName;
            existingConfig.semanticModelId = datasetId;      // Usando datasetId
            existingConfig.semanticModelName = datasetName;  // Usando datasetName
            existingConfig.modules = modules || ['vendas', 'fluxoCaixa', 'orcamento', 'obra', 'despesas'];
            existingConfig.configuredBy = req.user._id;      // Corrigido: usando _id ao invés de userId
            existingConfig.configuredAt = new Date();
            
            await existingConfig.save();
            
            
            res.json({
                success: true,
                message: `Configuração da ${incorporadora} atualizada com sucesso`,
                data: existingConfig
            });
        } else {
            
            // Criar nova configuração
            const newConfig = new FabricConfiguration({
                company: incorporadora,
                workspaceId,
                workspaceName,
                semanticModelId: datasetId,      // Usando datasetId
                semanticModelName: datasetName,  // Usando datasetName
                modules: modules || ['vendas', 'fluxoCaixa', 'orcamento', 'obra', 'despesas'],
                configuredBy: req.user._id       // Corrigido: usando _id ao invés de userId
            });
            
            await newConfig.save();
            
            
            res.json({
                success: true,
                message: `Configuração da ${incorporadora} criada com sucesso`,
                data: newConfig
            });
        }
        
    } catch (error) {
        console.error('❌ [FABRIC SAVE] Erro ao salvar configuração:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar configuração do Fabric',
            error: error.message
        });
    }
});

// GET /api/fabric/configurations - Listar todas as configurações (ADMIN ONLY)
router.get('/configurations', auth, adminAuth, async (req, res) => {
    try {
        const configurations = await FabricConfiguration.find({ isActive: true })
            .populate('configuredBy', 'name email')
            .sort({ configuredAt: -1 });
        
        // Adicionar status da última sincronização
        const configurationsWithStatus = configurations.map(config => ({
            ...config.toObject(),
            lastSyncStatus: config.getLastSyncStatus()
        }));
        
        res.json({
            success: true,
            data: configurationsWithStatus
        });
        
    } catch (error) {
        console.error('Erro ao listar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar configurações'
        });
    }
});

// GET /api/fabric/configuration/:company - Obter configuração de uma empresa específica (ADMIN ONLY)
router.get('/configuration/:company', auth, adminAuth, async (req, res) => {
    try {
        const { company } = req.params;
        
        const configuration = await FabricConfiguration.findByCompany(company)
            .populate('configuredBy', 'name email');
        
        if (!configuration) {
            return res.json({
                success: true,
                data: null,
                message: `Nenhuma configuração encontrada para ${company}`
            });
        }
        
        res.json({
            success: true,
            data: {
                ...configuration.toObject(),
                lastSyncStatus: configuration.getLastSyncStatus()
            }
        });
        
    } catch (error) {
        console.error('Erro ao obter configuração:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter configuração'
        });
    }
});

// POST /api/fabric/sync - Sincronizar dados de um usuário específico (ADMIN ONLY)
router.post('/sync', auth, adminAuth, async (req, res) => {
    try {
        const { userId, workspaceId, datasetId, modules } = req.body;
        
        if (!userId || !workspaceId || !datasetId) {
            return res.status(400).json({
                success: false,
                message: 'userId, workspaceId e datasetId são obrigatórios'
            });
        }
        
        const fabric = new FabricIntegration();
        const modulesToSync = modules || ['vendas', 'fluxoCaixa', 'inadimplencia', 'orcamento', 'obra', 'despesas'];
        
        const results = {};
        
        for (const module of modulesToSync) {
            try {
                
                
                const moduleData = await fabric.syncModuleData(workspaceId, datasetId, module);
                
                // Processar e salvar dados baseado no módulo
                switch (module) {
                    case 'vendas':
                        await processVendasData(userId, moduleData.data);
                        break;
                    case 'fluxoCaixa':
                        await processCashFlowData(userId, moduleData.data);
                        break;
                    case 'inadimplencia':
                        await processDefaultsData(userId, moduleData.data);
                        break;
                    case 'orcamento':
                        await processBudgetData(userId, moduleData.data);
                        break;
                    case 'obra':
                        await processConstructionData(userId, moduleData.data);
                        break;
                    case 'despesas':
                        await processExpensesData(userId, moduleData.data);
                        break;
                }
                
                results[module] = {
                    success: true,
                    records: moduleData.records,
                    syncedAt: moduleData.syncedAt
                };
                
            } catch (error) {
                console.error(`Erro ao sincronizar ${module}:`, error);
                results[module] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        res.json({
            success: true,
            message: 'Sincronização concluída',
            data: {
                userId,
                results,
                syncedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('Erro na sincronização:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na sincronização'
        });
    }
});

// POST /api/fabric/sync-all - Sincronizar todos os usuários (ADMIN ONLY)
router.post('/sync-all', auth, adminAuth, async (req, res) => {
    try {
        const { workspaceId, datasetId } = req.body;
        
        if (!workspaceId || !datasetId) {
            return res.status(400).json({
                success: false,
                message: 'workspaceId e datasetId são obrigatórios'
            });
        }
        
        // Buscar todos os usuários ativos
        const User = require('../models/User');
        const users = await User.find({ isActive: true });
        
        const fabric = new FabricIntegration();
        const syncResults = {};
        
        for (const user of users) {
            try {
                
                
                const userResults = await fabric.syncAllModules(workspaceId, datasetId);
                
                // Processar dados para cada módulo
                for (const [module, data] of Object.entries(userResults)) {
                    if (data.data && !data.error) {
                        switch (module) {
                            case 'vendas':
                                await processVendasData(user._id, data.data);
                                break;
                            case 'fluxoCaixa':
                                await processCashFlowData(user._id, data.data);
                                break;
                            // ... outros módulos
                        }
                    }
                }
                
                syncResults[user._id] = {
                    email: user.email,
                    success: true,
                    modules: userResults
                };
                
            } catch (error) {
                console.error(`Erro ao sincronizar usuário ${user.email}:`, error);
                syncResults[user._id] = {
                    email: user.email,
                    success: false,
                    error: error.message
                };
            }
        }
        
        res.json({
            success: true,
            message: 'Sincronização geral concluída',
            data: {
                totalUsers: users.length,
                results: syncResults,
                syncedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('Erro na sincronização geral:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na sincronização geral'
        });
    }
});

// POST /api/fabric/sync-company - Sincronizar todos os dados de uma incorporadora (ADMIN ONLY)
router.post('/sync-company', auth, adminAuth, async (req, res) => {
    try {
        const { company } = req.body;
        
        if (!company) {
            return res.status(400).json({
                success: false,
                message: 'Nome da empresa é obrigatório'
            });
        }
        
        // Buscar configuração da empresa
        const fabricConfig = await FabricConfiguration.findByCompany(company);
        if (!fabricConfig) {
            return res.status(404).json({
                success: false,
                message: `Configuração do Fabric não encontrada para ${company}. Configure primeiro.`
            });
        }
        
        const startTime = Date.now();
        
        
        // Buscar todos os usuários da empresa
        const users = await User.find({ company, isActive: true });
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Nenhum usuário ativo encontrado para ${company}`
            });
        }
        
        // Buscar todos os cenários dos usuários da empresa
        const userIds = users.map(u => u._id);
        const scenarios = await Scenario.find({ userId: { $in: userIds } });
        
        
        
        const fabric = new FabricIntegration();
        const syncResults = {};
        
        // Organizar dados por módulo
        const moduleData = {
            vendas: await organizeVendasData(scenarios, users),
            fluxoCaixa: await organizeFluxoCaixaData(scenarios, users),
            orcamento: await organizeOrcamentoData(scenarios, users),
            obra: await organizeObraData(scenarios, users),
            despesas: await organizeDespesasData(scenarios, users)
        };
        
        // Sincronizar cada módulo
        for (const module of fabricConfig.modules) {
            try {
                
                
                const tableName = `ModelAI_${module.charAt(0).toUpperCase() + module.slice(1)}_${company.replace(/\s+/g, '')}`;
                const data = moduleData[module];
                
                if (data && data.length > 0) {
                    await fabric.updateTable(fabricConfig.workspaceId, fabricConfig.semanticModelId, tableName, data);
                    
                    syncResults[module] = {
                        success: true,
                        recordsCount: data.length,
                        tableName: tableName
                    };
                    
                    
                } else {
                    syncResults[module] = {
                        success: true,
                        recordsCount: 0,
                        message: 'Nenhum dado encontrado para sincronizar'
                    };
                }
                
            } catch (error) {
                console.error(`❌ Erro ao sincronizar módulo ${module}:`, error);
                syncResults[module] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        const duration = Date.now() - startTime;
        const totalRecords = Object.values(syncResults).reduce((sum, result) => sum + (result.recordsCount || 0), 0);
        
        // Salvar log da sincronização
        await fabricConfig.addSyncLog({
            status: Object.values(syncResults).every(r => r.success) ? 'success' : 'partial',
            recordsCount: totalRecords,
            modules: Object.entries(syncResults).map(([name, result]) => ({
                name,
                recordsCount: result.recordsCount || 0,
                status: result.success ? 'success' : 'failed',
                error: result.error
            })),
            duration
        });
        
        
        
        res.json({
            success: true,
            message: `Sincronização da ${company} concluída com sucesso`,
            data: {
                company,
                totalUsers: users.length,
                totalScenarios: scenarios.length,
                totalRecords,
                duration: `${duration}ms`,
                modules: syncResults,
                syncedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('Erro na sincronização da empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na sincronização da empresa'
        });
    }
});

// === FUNÇÕES AUXILIARES PARA ORGANIZAÇÃO DE DADOS ===

async function organizeVendasData(scenarios, users) {
    const vendasData = [];
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    
    for (const scenario of scenarios) {
        const user = userMap.get(scenario.userId.toString());
        if (!user || !scenario.data || !scenario.results) continue;
        
        const dadosGerais = scenario.data.dadosGerais || {};
        const tabelaVendas = scenario.data.tabelaVendas || {};
        const propostaCliente = scenario.data.propostaCliente || {};
        const results = scenario.results || {};
        
        vendasData.push({
            ID: scenario._id.toString(),
            Data_Venda: scenario.createdAt,
            Usuario_Email: user.email,
            Usuario_Nome: user.name,
            Empresa: user.company,
            Cliente: dadosGerais.cliente || '',
            Imobiliaria: dadosGerais.imobiliaria || '',
            Empreendimento: dadosGerais.empreendimento || '',
            Unidade: dadosGerais.unidade || '',
            Area_Privativa: dadosGerais.areaPrivativa || 0,
            
            // Tabela de Vendas
            Tabela_Valor_Total: (tabelaVendas.entradaValor || 0) + (tabelaVendas.parcelasValor || 0) + (tabelaVendas.reforcoValor || 0),
            Tabela_Entrada_Valor: tabelaVendas.entradaValor || 0,
            Tabela_Entrada_Percent: tabelaVendas.entradaPercent || 0,
            Tabela_Parcelas_Valor: tabelaVendas.parcelasValor || 0,
            Tabela_Parcelas_Qtd: tabelaVendas.parcelasQtd || 0,
            Tabela_Reforco_Valor: tabelaVendas.reforcoValor || 0,
            Tabela_Reforco_Qtd: tabelaVendas.reforcoQtd || 0,
            
            // Proposta Cliente
            Proposta_Valor_Total: (propostaCliente.entradaValor || 0) + (propostaCliente.parcelasValor || 0) + (propostaCliente.reforcoValor || 0),
            Proposta_Entrada_Valor: propostaCliente.entradaValor || 0,
            Proposta_Entrada_Percent: propostaCliente.entradaPercent || 0,
            Proposta_Parcelas_Valor: propostaCliente.parcelasValor || 0,
            Proposta_Parcelas_Qtd: propostaCliente.parcelasQtd || 0,
            Proposta_Reforco_Valor: propostaCliente.reforcoValor || 0,
            Proposta_Reforco_Qtd: propostaCliente.reforcoQtd || 0,
            
            // Resultados
            VPL_Tabela: results.vplTabela || 0,
            VPL_Proposta: results.vplProposta || 0,
            Delta_VPL: results.deltaVpl || 0,
            Percentual_Delta_VPL: results.percentualDeltaVpl || 0,
            Desconto_Nominal_Percent: results.descontoNominalPercent || 0,
            Desconto_Nominal_Reais: results.descontoNominalReais || 0,
            TMA_Mes_Usada: results.tmaMesUsada || 0,
            
            Sincronizado_Em: new Date(),
            Cenario_Nome: scenario.name || '',
            Cenario_Descricao: scenario.description || ''
        });
    }
    
    return vendasData;
}

async function organizeFluxoCaixaData(scenarios, users) {
    const fluxoData = [];
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    
    for (const scenario of scenarios) {
        const user = userMap.get(scenario.userId.toString());
        if (!user || !scenario.data || !scenario.results) continue;
        
        const dadosGerais = scenario.data.dadosGerais || {};
        const propostaCliente = scenario.data.propostaCliente || {};
        
        // Gerar períodos do fluxo de caixa
        const periodosCalculados = scenario.results.periodosCalculados || 50;
        
        for (let periodo = 0; periodo <= periodosCalculados; periodo++) {
            // Calcular valores para cada período
            const isEntrada = periodo === (propostaCliente.mesVenda || 0);
            const isParcela = periodo > 0 && periodo <= (propostaCliente.parcelasQtd || 0);
            const isReforco = periodo > 0 && periodo % (propostaCliente.reforcoFrequencia || 6) === 0 && 
                            periodo <= (propostaCliente.reforcoQtd || 0) * (propostaCliente.reforcoFrequencia || 6);
            
            let valorPeriodo = 0;
            let tipoFluxo = 'Normal';
            
            if (isEntrada) {
                valorPeriodo = propostaCliente.entradaValor || 0;
                tipoFluxo = 'Entrada';
            } else if (isReforco) {
                valorPeriodo = propostaCliente.reforcoValorParcela || 0;
                tipoFluxo = 'Reforço';
            } else if (isParcela) {
                valorPeriodo = propostaCliente.parcelasValorParcela || 0;
                tipoFluxo = 'Parcela';
            }
            
            if (valorPeriodo > 0) {
                fluxoData.push({
                    ID: `${scenario._id}_periodo_${periodo}`,
                    Cenario_ID: scenario._id.toString(),
                    Usuario_Email: user.email,
                    Usuario_Nome: user.name,
                    Empresa: user.company,
                    Empreendimento: dadosGerais.empreendimento || '',
                    Unidade: dadosGerais.unidade || '',
                    Periodo: periodo,
                    Tipo_Fluxo: tipoFluxo,
                    Valor_Periodo: valorPeriodo,
                    Data_Venda: scenario.createdAt,
                    Sincronizado_Em: new Date()
                });
            }
        }
    }
    
    return fluxoData;
}

async function organizeOrcamentoData(scenarios, users) {
    // Para implementação futura - retornando array vazio por enquanto
    return [];
}

async function organizeObraData(scenarios, users) {
    // Para implementação futura - retornando array vazio por enquanto
    return [];
}

async function organizeDespesasData(scenarios, users) {
    // Para implementação futura - retornando array vazio por enquanto
    return [];
}

// Funções auxiliares para processar dados por módulo

async function processVendasData(userId, data) {
    let salesData = await SalesData.findOne({ userId });
    
    if (!salesData) {
        salesData = new SalesData({ userId, incorporadora: 'Fabric Import' });
    }
    
    // Processar dados de vendas do Fabric
    const empreendimentosMap = new Map();
    
    data.forEach(item => {
        const key = item.Projeto || item.projeto;
        if (!empreendimentosMap.has(key)) {
            empreendimentosMap.set(key, {
                nome: key,
                codigo: item.Titulo || item.titulo || '',
                status: 'Buettner',
                tipo: 'Sion',
                unidade: item.Unidade || item.unidade || '',
                vendasMensais: []
            });
        }
        
        const emp = empreendimentosMap.get(key);
        emp.vendasMensais.push({
            ano: new Date(item.Data || item.data).getFullYear(),
            mes: new Date(item.Data || item.data).getMonth() + 1,
            vendas: item.TotalVendas || item.totalVendas || 0,
            area: item.Area || item.area || 0,
            valorM2: item.ValorM2 || item.valorM2 || 0,
            data: new Date(item.Data || item.data)
        });
    });
    
    salesData.empreendimentos = Array.from(empreendimentosMap.values());
    salesData.atualizarMetricas();
    salesData.sincronizadoEm = new Date();
    
    await salesData.save();
}

async function processCashFlowData(userId, data) {
    let cashFlow = await CashFlow.findOne({ userId });
    
    if (!cashFlow) {
        cashFlow = new CashFlow({ userId, incorporadora: 'Fabric Import' });
    }
    
    // Processar dados de fluxo de caixa do Fabric
    const periodosMap = new Map();
    
    data.forEach(item => {
        const chave = `${item.Ano}-${item.Mes}`;
        
        if (!periodosMap.has(chave)) {
            periodosMap.set(chave, {
                ano: item.Ano,
                mes: item.Mes,
                data: new Date(item.Ano, item.Mes - 1, 1),
                entradas: { vendas: 0, financiamentos: 0, outrasReceitas: 0, total: 0 },
                saidas: { construccao: 0, marketing: 0, administrativo: 0, impostos: 0, financeiros: 0, outrasDesepesas: 0, total: 0 },
                fluxoLiquido: 0,
                fluxoAcumulado: 0
            });
        }
        
        const periodo = periodosMap.get(chave);
        
        if (item.Tipo === 'entrada') {
            periodo.entradas[item.Categoria] = item.Valor || 0;
            periodo.entradas.total += item.Valor || 0;
        } else if (item.Tipo === 'saida') {
            periodo.saidas[item.Categoria] = item.Valor || 0;
            periodo.saidas.total += item.Valor || 0;
        }
    });
    
    // Calcular fluxo líquido e acumulado
    let acumulado = 0;
    const periodosArray = Array.from(periodosMap.values()).sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.mes - b.mes;
    });
    
    periodosArray.forEach(periodo => {
        periodo.fluxoLiquido = periodo.entradas.total - periodo.saidas.total;
        acumulado += periodo.fluxoLiquido;
        periodo.fluxoAcumulado = acumulado;
    });
    
    cashFlow.periodos = periodosArray;
    cashFlow.calcularMetricas();
    cashFlow.sincronizadoEm = new Date();
    
    await cashFlow.save();
}

async function processDefaultsData(userId, data) {
    // Implementar processamento de inadimplência
    
}

async function processBudgetData(userId, data) {
    // Implementar processamento de orçamento
    
}

async function processConstructionData(userId, data) {
    // Implementar processamento de obra
    
}

async function processExpensesData(userId, data) {
    // Implementar processamento de despesas
    
}

module.exports = router;
