// Sistema de Integração com Microsoft Fabric
class FabricIntegration {
    constructor() {
        this.baseUrl = 'https://api.fabric.microsoft.com/v1';
        this.accessToken = null;
        this.refreshToken = null;
        this.tenantId = process.env.FABRIC_TENANT_ID;
        this.clientId = process.env.FABRIC_CLIENT_ID;
        this.clientSecret = process.env.FABRIC_CLIENT_SECRET;
    }

    // Testar conexão com Fabric
    async testConnection() {
        try {
            await this.authenticate();
            
            // Testar uma chamada real para a API do Fabric
            const workspaces = await this.listWorkspaces();
            return {
                connected: true,
                mode: 'production',
                message: 'Conectado ao Microsoft Fabric com sucesso',
                workspaceCount: workspaces.length,
                timestamp: new Date().toISOString(),
                tenantId: this.tenantId
            };
        } catch (error) {
            console.error('❌ Erro no teste de conexão:', error);
            return {
                connected: false,
                mode: 'error',
                message: 'Erro ao testar conexão: ' + error.message,
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    // Autenticação com Azure AD
    async authenticate() {
        try {
            // Verificar se temos todas as configurações necessárias
            if (!this.tenantId || !this.clientId || !this.clientSecret) {
                throw new Error('Configuração do Azure incompleta. Verifique FABRIC_TENANT_ID, FABRIC_CLIENT_ID e FABRIC_CLIENT_SECRET no arquivo .env');
            }

            const authUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
            
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    scope: 'https://analysis.windows.net/powerbi/api/.default'
                })
            });

            const data = await response.json();
            
            if (data.access_token) {
                this.accessToken = data.access_token;
                console.log('✅ Autenticação com Microsoft Fabric realizada com sucesso');
                return true;
            } else {
                console.error('❌ Erro na autenticação:', data);
                throw new Error(`Falha na autenticação: ${data.error_description || data.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('❌ Erro ao autenticar com Fabric:', error);
            throw error;
        }
    }

    // Listar workspaces disponíveis
    async listWorkspaces() {
        if (!await this.ensureAuthenticated()) {
            throw new Error('Falha na autenticação');
        }

        try {
            console.log('🔍 [FABRIC] Tentando API normal primeiro...');
            
            // Primeiro tenta a API normal
            let response = await fetch('https://api.powerbi.com/v1.0/myorg/groups', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                const errorText = await response.text();
                console.error('❌ ERRO 401 - Service Principal não autorizado:', errorText);
                throw new Error(`PERMISSÃO NEGADA: O Service Principal não tem permissão para acessar workspaces. Configure no Power BI Admin Portal: Tenant Settings > Developer Settings > "Service principals can use Power BI APIs" e adicione o Service Principal ${process.env.AZURE_CLIENT_ID} ao workspace.`);
            }

            if (response.ok) {
                const data = await response.json();
                if (data.value && data.value.length > 0) {
                    console.log(`✅ Workspaces encontrados via API normal: ${data.value.length}`);
                    return this.formatWorkspaces(data.value);
                }
            }

            // Se não encontrou workspaces, tenta a API de administrador
            console.log('🔍 [FABRIC] Tentando API de administrador...');
            response = await fetch('https://api.powerbi.com/v1.0/myorg/admin/groups?$top=1000', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                const errorText = await response.text();
                console.error('❌ ERRO 401 - Service Principal não autorizado para API admin:', errorText);
                throw new Error(`PERMISSÃO NEGADA: O Service Principal não tem permissão de administrador. Configure no Power BI Admin Portal: Tenant Settings > Developer Settings > "Service principals can access read-only admin APIs" e habilite para o Service Principal.`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta do Power BI API:', response.status, errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log(`✅ Workspaces encontrados via API admin: ${data.value?.length || 0}`);
            return this.formatWorkspaces(data.value || []);
            
        } catch (error) {
            console.error('❌ Erro ao listar workspaces:', error);
            throw error;
        }
    }

    formatWorkspaces(workspaces) {
        return workspaces.map(workspace => ({
            id: workspace.id,
            name: workspace.name || workspace.displayName,
            type: workspace.type || 'Workspace',
            isReadOnly: workspace.isReadOnly || false,
            isOnDedicatedCapacity: workspace.isOnDedicatedCapacity || false,
            capacityId: workspace.capacityId || null,
            state: workspace.state || 'Active'
        }));
    }

    // Listar semantic models em um workspace
    async listSemanticModels(workspaceId) {
        if (!await this.ensureAuthenticated()) {
            throw new Error('Falha na autenticação');
        }

        try {
            console.log('🔍 Listando datasets para workspace:', workspaceId);
            
            const response = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Status da resposta:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta do Power BI API:', response.status, errorText);
                
                // Se for 404, pode ser que o workspace não existe ou não tem acesso
                if (response.status === 404) {
                    throw new Error(`Workspace não encontrado ou sem acesso (${response.status})`);
                }
                
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Dados recebidos:', {
                workspaceId,
                datasetCount: data.value?.length || 0,
                datasets: data.value?.map(d => ({ id: d.id, name: d.name })) || []
            });
            
            return data.value || [];
        } catch (error) {
            console.error('❌ Erro ao listar semantic models:', error);
            throw error;
        }
    }

    // Executar query DAX no semantic model
    async executeDAXQuery(workspaceId, datasetId, daxQuery) {
        if (!await this.ensureAuthenticated()) {
            throw new Error('Falha na autenticação');
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/myorg/groups/${workspaceId}/datasets/${datasetId}/executeQueries`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        queries: [{
                            query: daxQuery
                        }],
                        serializerSettings: {
                            includeNulls: false
                        }
                    })
                }
            );

            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                return this.processDAXResults(data.results[0]);
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao executar query DAX:', error);
            throw error;
        }
    }

    // Processar resultados DAX
    processDAXResults(result) {
        if (!result.tables || result.tables.length === 0) {
            return [];
        }

        const table = result.tables[0];
        const columns = table.rows[0] || [];
        const rows = table.rows.slice(1) || [];

        return rows.map(row => {
            const item = {};
            columns.forEach((column, index) => {
                item[column] = row[index];
            });
            return item;
        });
    }

    // Queries DAX predefinidas para cada módulo
    getDAXQueries() {
        return {
            vendas: `
                EVALUATE
                SUMMARIZECOLUMNS(
                    'Vendas'[Projeto],
                    'Vendas'[Unidade],
                    'Vendas'[Titulo],
                    'Vendas'[Cliente],
                    'Vendas'[Data],
                    "TotalVendas", SUM('Vendas'[Valor]),
                    "ValorM2", SUM('Vendas'[ValorM2]),
                    "Area", SUM('Vendas'[Area])
                )
            `,
            
            fluxoCaixa: `
                EVALUATE
                SUMMARIZECOLUMNS(
                    'FluxoCaixa'[Ano],
                    'FluxoCaixa'[Mes],
                    'FluxoCaixa'[Tipo],
                    'FluxoCaixa'[Categoria],
                    "Valor", SUM('FluxoCaixa'[Valor])
                )
            `,
            
            inadimplencia: `
                EVALUATE
                SUMMARIZECOLUMNS(
                    'Inadimplencia'[ContratoId],
                    'Inadimplencia'[Cliente],
                    'Inadimplencia'[Empreendimento],
                    'Inadimplencia'[Status],
                    'Inadimplencia'[DiasAtraso],
                    "ValorVencido", SUM('Inadimplencia'[ValorVencido]),
                    "SaldoDevedor", SUM('Inadimplencia'[SaldoDevedor])
                )
            `,
            
            orcamento: `
                EVALUATE
                SUMMARIZECOLUMNS(
                    'Orcamento'[Empreendimento],
                    'Orcamento'[Categoria],
                    'Orcamento'[Subcategoria],
                    'Orcamento'[Periodo],
                    "Orcado", SUM('Orcamento'[Orcado]),
                    "Realizado", SUM('Orcamento'[Realizado])
                )
            `,
            
            obra: `
                EVALUATE
                SUMMARIZECOLUMNS(
                    'Obra'[Nome],
                    'Obra'[Etapa],
                    'Obra'[Status],
                    'Obra'[DataInicio],
                    'Obra'[DataFim],
                    "PercentualConclusao", MAX('Obra'[PercentualConclusao]),
                    "CustoRealizado", SUM('Obra'[CustoRealizado])
                )
            `,
            
            despesas: `
                EVALUATE
                SUMMARIZECOLUMNS(
                    'Despesas'[Data],
                    'Despesas'[Categoria],
                    'Despesas'[Empreendimento],
                    'Despesas'[Fornecedor],
                    'Despesas'[Status],
                    "Valor", SUM('Despesas'[Valor])
                )
            `
        };
    }

    // Sincronizar dados de um módulo específico
    async syncModuleData(workspaceId, datasetId, module) {
        const queries = this.getDAXQueries();
        
        if (!queries[module]) {
            throw new Error(`Módulo '${module}' não encontrado`);
        }

        try {
            console.log(`🔄 Sincronizando dados do módulo: ${module}`);
            
            const data = await this.executeDAXQuery(workspaceId, datasetId, queries[module]);
            
            console.log(`✅ ${data.length} registros sincronizados para ${module}`);
            
            return {
                module,
                records: data.length,
                data: data,
                syncedAt: new Date()
            };
            
        } catch (error) {
            console.error(`❌ Erro ao sincronizar ${module}:`, error);
            throw error;
        }
    }

    // Sincronizar todos os módulos
    async syncAllModules(workspaceId, datasetId) {
        const modules = ['vendas', 'fluxoCaixa', 'inadimplencia', 'orcamento', 'obra', 'despesas'];
        const results = {};

        for (const module of modules) {
            try {
                results[module] = await this.syncModuleData(workspaceId, datasetId, module);
            } catch (error) {
                console.error(`Erro ao sincronizar ${module}:`, error);
                results[module] = { error: error.message };
            }
        }

        return results;
    }

    // Verificar se a autenticação ainda é válida
    async ensureAuthenticated() {
        if (!this.accessToken) {
            return await this.authenticate();
        }
        
        // Aqui você poderia implementar verificação de expiração do token
        return true;
    }

    // Configurar sincronização automática
    setupAutoSync(workspaceId, datasetId, intervalMinutes = 60) {
        console.log(`🔄 Configurando sincronização automática a cada ${intervalMinutes} minutos`);
        
        setInterval(async () => {
            try {
                console.log('🔄 Iniciando sincronização automática...');
                await this.syncAllModules(workspaceId, datasetId);
                console.log('✅ Sincronização automática concluída');
            } catch (error) {
                console.error('❌ Erro na sincronização automática:', error);
            }
        }, intervalMinutes * 60 * 1000);
    }

    // Garantir que estamos autenticados
    async ensureAuthenticated() {
        if (!this.accessToken) {
            return await this.authenticate();
        }
        return true;
    }
}

module.exports = FabricIntegration;
