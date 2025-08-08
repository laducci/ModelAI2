/**
 * FABRIC ADMIN - SISTEMA EXCLUSIVO PARA ADMINISTRADORES
 * Gerenciamento de integração com Microsoft Fabric
 * Acesso restrito apenas para usuários com role 'admin'
 */

class FabricAdmin {
    constructor() {
        this.fabricStatus = 'disconnected';
        this.currentUser = null;
        this.apiClient = null;
        this.selectedWorkspace = null;
        this.selectedDataset = null;
        this.selectedIncorporadora = null;
        this.users = [];
        
        this.init();
    }

    async init() {
        
        
        // Verificar se o usuário é admin ANTES de qualquer coisa
        if (!this.checkAdminAccess()) {
            this.redirectNonAdmin();
            return;
        }

        // Inicializar API client
        this.apiClient = new ApiClient();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar incorporadoras automaticamente
        await this.loadIncorporadoras();
        
        // Testar conexão inicial
        await this.testFabricConnection();
        
        
    }

    /**
     * Verificar se o usuário atual é administrador
     */
    checkAdminAccess() {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            console.error('❌ [FABRIC-ADMIN] Usuário não autenticado');
            return false;
        }
        
        try {
            this.currentUser = JSON.parse(userData);
            
            if (this.currentUser.role !== 'admin') {
                console.error('❌ [FABRIC-ADMIN] Usuário não é administrador:', this.currentUser.role);
                return false;
            }
            
            
            return true;
            
        } catch (error) {
            console.error('❌ [FABRIC-ADMIN] Erro ao verificar dados do usuário:', error);
            return false;
        }
    }

    /**
     * Redirecionar usuários não-admin
     */
    redirectNonAdmin() {
        // Esconder o conteúdo da página
        const mainContent = document.querySelector('.lg\\:ml-72');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="min-h-screen flex items-center justify-center">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto text-center">
                        <i class="fas fa-lock text-red-600 text-4xl mb-4"></i>
                        <h2 class="text-xl font-bold text-red-800 mb-2">Acesso Negado</h2>
                        <p class="text-red-700 mb-4">Esta funcionalidade é exclusiva para administradores.</p>
                        <p class="text-sm text-red-600 mb-4">Você será redirecionado em alguns segundos...</p>
                        <button onclick="window.location.href='inputs.html'" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Mostrar mensagem de erro
        if (typeof showError === 'function') {
            showError('Acesso Negado! Apenas administradores podem acessar o Fabric Admin.');
        }
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
            window.location.href = 'inputs.html';
        }, 3000);
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        
        
        // Testar conexão
        const testConnectionBtn = document.getElementById('testConnection');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => {
                
                this.testFabricConnection();
            });
            
        } else {
            console.error('❌ [FABRIC-ADMIN] Botão testConnection não encontrado');
        }

        // Debug PowerBI API
        const debugBtn = document.getElementById('debugPowerBI');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => this.debugPowerBI());
            
        }

        // Carregar workspaces
        const loadWorkspacesBtn = document.getElementById('loadWorkspaces');
        if (loadWorkspacesBtn) {
            loadWorkspacesBtn.addEventListener('click', () => this.loadWorkspaces());
            
        }

        // Carregar datasets
        const loadDatasetsBtn = document.getElementById('loadDatasets');
        if (loadDatasetsBtn) {
            loadDatasetsBtn.addEventListener('click', () => this.loadDatasets());
            
        }

        // Carregar usuários
        const loadUsersBtn = document.getElementById('loadUsers');
        if (loadUsersBtn) {
            loadUsersBtn.addEventListener('click', () => this.loadUsersByCompany());
            
        }

        // Sincronização
        const syncCurrentUserBtn = document.getElementById('syncCurrentUser');
        if (syncCurrentUserBtn) {
            syncCurrentUserBtn.addEventListener('click', () => this.syncCurrentUser());
        }

        const syncAllUsersBtn = document.getElementById('syncAllUsers');
        if (syncAllUsersBtn) {
            syncAllUsersBtn.addEventListener('click', () => this.syncAllUsers());
        }

        // Seleção de workspace
        const workspaceSelect = document.getElementById('workspaceSelect');
        if (workspaceSelect) {
            workspaceSelect.addEventListener('change', (e) => {
                this.selectedWorkspace = e.target.value;
                const loadDatasetsBtn = document.getElementById('loadDatasets');
                if (loadDatasetsBtn) {
                    loadDatasetsBtn.disabled = !this.selectedWorkspace;
                }
            });
        }

        // Seleção de incorporadora
        const incorporadoraSelect = document.getElementById('incorporadoraSelect');
        if (incorporadoraSelect) {
            incorporadoraSelect.addEventListener('change', (e) => {
                this.selectedIncorporadora = e.target.value;
                this.loadExistingConfiguration();
            });
        }

        // Salvar configuração
        const saveConfigBtn = document.getElementById('saveConfiguration');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => this.saveConfiguration());
        }

        // Sincronizar incorporadora
        const syncCompanyBtn = document.getElementById('syncCompany');
        if (syncCompanyBtn) {
            syncCompanyBtn.addEventListener('click', () => this.syncCompanyData());
        }

        // Limpar log
        const clearLogBtn = document.getElementById('clearLog');
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => this.clearLog());
        }
    }

    /**
     * Testar conexão com Microsoft Fabric
     */
    async testFabricConnection() {
        this.updateConnectionStatus('connecting');
        this.addLog('🔄 Testando conexão com Microsoft Fabric...', 'info');
        
        try {
            const response = await this.apiClient.request('/fabric/test-connection', 'GET');
            
            console.log('🔍 [FABRIC-ADMIN] Resposta da API:', response);
            
            // Verificar se a resposta tem o formato esperado
            if (response && (response.connected === true || response.success === true)) {
                this.fabricStatus = 'connected';
                this.updateConnectionStatus('connected');
                this.addLog('✅ Conexão com Fabric estabelecida com sucesso', 'success');
                
                // Log adicional baseado no modo
                if (response.mode) {
                    this.addLog(`📋 Modo: ${response.mode}`, 'info');
                }
                if (response.tenantId) {
                    this.addLog(`🏢 Tenant ID: ${response.tenantId}`, 'info');
                }
                
            } else {
                // Lidar com diferentes tipos de erro
                let errorMessage = 'Erro desconhecido';
                
                if (response && response.mode === 'config-missing') {
                    errorMessage = 'Configuração do Fabric não encontrada no Vercel. Verifique as variáveis de ambiente.';
                    this.addLog('⚠️ Configuração necessária:', 'warning');
                    this.addLog('• FABRIC_TENANT_ID', 'warning');
                    this.addLog('• FABRIC_CLIENT_ID', 'warning');
                    this.addLog('• FABRIC_CLIENT_SECRET', 'warning');
                } else if (response && response.message) {
                    errorMessage = response.message;
                } else if (response && response.error) {
                    errorMessage = response.error;
                }
                
                this.fabricStatus = 'disconnected';
                this.updateConnectionStatus('disconnected');
                this.addLog('❌ ' + errorMessage, 'error');
                
                if (response && response.instructions) {
                    this.addLog('💡 ' + response.instructions, 'info');
                }
            }
            
        } catch (error) {
            this.fabricStatus = 'disconnected';
            this.updateConnectionStatus('disconnected');
            this.addLog('❌ Erro de rede na conexão: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro na conexão:', error);
        }
    }

    /**
     * Debug PowerBI API
     */
    async debugPowerBI() {
        
        this.addLog('🔍 Executando debug detalhado da PowerBI API...', 'info');
        
        try {
            const response = await this.apiClient.request('/fabric/debug-powerbi', 'GET');
            
            
            if (response.success) {
                this.addLog('✅ Debug executado com sucesso', 'success');
                this.addLog(`🔑 Token obtido: ${response.debug.hasToken ? 'SIM' : 'NÃO'}`, 'info');
                this.addLog(`🏢 Tenant ID: ${response.debug.tenantId}`, 'info');
                this.addLog(`📱 Client ID: ${response.debug.clientId}`, 'info');
                this.addLog(`📊 Status Workspaces: ${response.debug.workspacesStatus}`, 'info');
                this.addLog(`📈 Status Capacities: ${response.debug.capacitiesStatus}`, 'info');
                
                // Parse das respostas JSON se possível
                try {
                    const workspacesData = JSON.parse(response.debug.workspacesResponse);
                    if (workspacesData.value) {
                        this.addLog(`📂 Workspaces encontrados: ${workspacesData.value.length}`, 'success');
                        workspacesData.value.forEach((ws, index) => {
                            this.addLog(`   ${index + 1}. ${ws.name} (ID: ${ws.id})`, 'info');
                        });
                    }
                } catch (e) {
                    this.addLog(`⚠️ Resposta workspaces não é JSON válido: ${response.debug.workspacesResponse}`, 'warning');
                }
                
            } else {
                this.addLog('❌ Erro no debug: ' + response.error, 'error');
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao executar debug: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro no debug:', error);
        }
    }

    /**
     * Carregar incorporadoras disponíveis
     */
    async loadIncorporadoras() {
        try {
            this.addLog('🔄 Carregando incorporadoras...', 'info');
            
            const response = await this.apiClient.request('/users');
            
            if (response && response.users) {
                const companies = [...new Set(response.users.map(user => user.company).filter(Boolean))];
                
                const select = document.getElementById('incorporadoraSelect');
                if (select) {
                    select.innerHTML = '<option value="">Selecione uma incorporadora</option>';
                    companies.forEach(company => {
                        const option = document.createElement('option');
                        option.value = company;
                        option.textContent = company;
                        select.appendChild(option);
                    });
                }
                
                this.addLog(`✅ ${companies.length} incorporadoras carregadas`, 'success');
                
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao carregar incorporadoras: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro ao carregar incorporadoras:', error);
        }
    }

    /**
     * Carregar usuários por empresa
     */
    async loadUsersByCompany() {
        if (!this.selectedIncorporadora) {
            this.addLog('⚠️ Selecione uma incorporadora primeiro', 'warning');
            return;
        }

        try {
            this.addLog(`🔄 Carregando usuários da ${this.selectedIncorporadora}...`, 'info');
            
            const response = await this.apiClient.request('/users');
            
            if (response && response.users) {
                this.users = response.users.filter(user => user.company === this.selectedIncorporadora);
                this.addLog(`✅ ${this.users.length} usuários carregados da ${this.selectedIncorporadora}`, 'success');
                
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao carregar usuários: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro ao carregar usuários:', error);
        }
    }

    /**
     * Carregar workspaces do Fabric
     */
    async loadWorkspaces() {
        if (this.fabricStatus !== 'connected') {
            this.addLog('⚠️ Conecte-se ao Fabric primeiro', 'warning');
            return;
        }

        try {
            this.addLog('🔄 Carregando workspaces do Microsoft Fabric...', 'info');
            
            const response = await this.apiClient.request('/fabric/workspaces');
            
            if (response.success && response.data) {
                const select = document.getElementById('workspaceSelect');
                if (select) {
                    select.innerHTML = '<option value="">Selecione um workspace</option>';
                    
                    if (response.data.workspaces && response.data.workspaces.length > 0) {
                        response.data.workspaces.forEach(workspace => {
                            const option = document.createElement('option');
                            option.value = workspace.id;
                            option.textContent = workspace.name;
                            select.appendChild(option);
                        });
                        this.addLog(`✅ ${response.data.workspaces.length} workspaces carregados`, 'success');
                        
                        // Destacar o workspace ModelAI se existir
                        const modelAIWorkspace = response.data.workspaces.find(ws => 
                            ws.name.includes('ModelAI') || ws.name.includes('[ModelAI]')
                        );
                        if (modelAIWorkspace) {
                            this.addLog(`💡 Workspace recomendado encontrado: ${modelAIWorkspace.name}`, 'info');
                        }
                    } else {
                        this.addLog('⚠️ Nenhum workspace encontrado', 'warning');
                        this.addLog('💡 Certifique-se de que tem acesso aos workspaces no Power BI', 'info');
                    }
                }
            } else {
                // Verificar se é erro de permissão
                if (response.message && (response.message.includes('401') || response.message.includes('PERMISSÃO NEGADA') || response.message.includes('Unauthorized'))) {
                    this.addLog('❌ Erro de permissão: Service Principal não autorizado', 'error');
                    this.addLog('🔐 Configuração necessária no Power BI Admin Portal', 'warning');
                    this.showPermissionGuide();
                } else {
                    this.addLog('❌ Erro ao carregar workspaces: ' + (response.message || 'Erro desconhecido'), 'error');
                }
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao carregar workspaces: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro ao carregar workspaces:', error);
            
            // Se for erro de permissão, mostrar guia
            if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
                this.showPermissionGuide();
            }
        }
    }

    /**
     * Mostrar guia de configuração de permissões
     */
    showPermissionGuide() {
        const select = document.getElementById('workspaceSelect');
        if (select) {
            select.innerHTML = `
                <option value="">❌ Erro de Permissão - Configuração Necessária</option>
            `;
        }
        
        // Adicionar botão para o guia no log
        this.addLog('📖 Clique no botão abaixo para ver o guia de configuração:', 'info');
        
        // Criar um elemento especial no log
        const logElement = document.getElementById('syncLog');
        if (logElement) {
            const guideButton = document.createElement('div');
            guideButton.style.cssText = 'margin: 10px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; text-align: center;';
            guideButton.innerHTML = `
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">🔐 Configuração de Permissões Necessária</p>
                <p style="margin: 0 0 15px 0; color: #856404;">O Service Principal precisa de permissões no Power BI Admin Portal</p>
                <a href="/fabric-setup-guide.html" target="_blank" style="background: #007acc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    📖 Ver Guia de Configuração
                </a>
            `;
            logElement.appendChild(guideButton);
        }
    }

    /**
     * Carregar datasets do workspace selecionado
     */
    async loadDatasets() {
        if (!this.selectedWorkspace) {
            this.addLog('⚠️ Selecione um workspace primeiro', 'warning');
            return;
        }

        if (!this.selectedIncorporadora) {
            this.addLog('⚠️ Selecione uma incorporadora primeiro', 'warning');
            return;
        }

        try {
            this.addLog('🔄 Carregando datasets/modelos semânticos...', 'info');
            
            const response = await this.apiClient.request(`/fabric/datasets/${this.selectedWorkspace}`);
            
            if (response.success && response.data) {
                const select = document.getElementById('datasetSelect');
                if (select) {
                    select.innerHTML = '<option value="">Selecione um modelo semântico</option>';
                    
                    if (response.data.datasets && response.data.datasets.length > 0) {
                        response.data.datasets.forEach(dataset => {
                            const option = document.createElement('option');
                            option.value = dataset.id;
                            option.textContent = dataset.name;
                            select.appendChild(option);
                        });
                        this.addLog(`✅ ${response.data.datasets.length} modelos semânticos carregados`, 'success');
                    } else {
                        this.addLog('⚠️ Nenhum modelo semântico encontrado neste workspace', 'warning');
                        this.addLog('💡 Publique datasets no Power BI para este workspace', 'info');
                    }
                }
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao carregar modelos semânticos: ' + error.message, 'error');
            this.addLog('💡 Solução: Aguardar grant do admin Azure', 'info');
            console.error('❌ [FABRIC-ADMIN] Erro ao carregar datasets:', error);
        }
    }

    /**
     * Sincronizar usuário atual
     */
    async syncCurrentUser() {
        if (!this.validateSyncRequirements()) return;

        try {
            this.addLog('🔄 Iniciando sincronização do usuário atual...', 'info');
            
            const modules = this.getSelectedModules();
            const response = await this.apiClient.request('/fabric/sync', 'POST', {
                userId: this.currentUser._id,
                workspaceId: this.selectedWorkspace,
                datasetId: this.selectedDataset,
                modules: modules
            });

            if (response.success) {
                this.addLog('✅ Sincronização do usuário concluída com sucesso', 'success');
                this.displaySyncResults(response.data);
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            this.addLog('❌ Erro na sincronização: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro na sincronização:', error);
        }
    }

    /**
     * Sincronizar todos os usuários
     */
    async syncAllUsers() {
        if (!this.validateSyncRequirements()) return;
        
        if (!this.users.length) {
            this.addLog('⚠️ Carregue os usuários primeiro', 'warning');
            return;
        }

        // Confirmação
        if (!confirm(`Deseja sincronizar todos os ${this.users.length} usuários da ${this.selectedIncorporadora}? Esta operação pode demorar.`)) {
            return;
        }

        try {
            this.addLog(`🔄 Iniciando sincronização de ${this.users.length} usuários...`, 'info');
            
            const response = await this.apiClient.request('/fabric/sync-all', 'POST', {
                workspaceId: this.selectedWorkspace,
                datasetId: this.selectedDataset
            });

            if (response.success) {
                this.addLog('✅ Sincronização geral concluída com sucesso', 'success');
                this.displaySyncResults(response.data);
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            this.addLog('❌ Erro na sincronização geral: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro na sincronização geral:', error);
        }
    }

    /**
     * Validar requisitos para sincronização
     */
    validateSyncRequirements() {
        if (this.fabricStatus !== 'connected') {
            this.addLog('⚠️ Conecte-se ao Fabric primeiro', 'warning');
            return false;
        }

        if (!this.selectedWorkspace) {
            this.addLog('⚠️ Selecione um workspace', 'warning');
            return false;
        }

        const datasetSelect = document.getElementById('datasetSelect');
        this.selectedDataset = datasetSelect?.value;
        
        if (!this.selectedDataset) {
            this.addLog('⚠️ Selecione um dataset', 'warning');
            return false;
        }

        return true;
    }

    /**
     * Obter módulos selecionados para sincronização
     */
    getSelectedModules() {
        const checkboxes = document.querySelectorAll('.sync-module:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Exibir resultados da sincronização
     */
    displaySyncResults(data) {
        if (data.results) {
            Object.keys(data.results).forEach(module => {
                const result = data.results[module];
                if (result.success) {
                    this.addLog(`  ✅ ${module}: ${result.records || 0} registros sincronizados`, 'success');
                } else {
                    this.addLog(`  ❌ ${module}: ${result.error}`, 'error');
                }
            });
        }
    }

    /**
     * Atualizar status da conexão na interface
     */
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        switch (status) {
            case 'connected':
                statusElement.textContent = 'Conectado';
                statusElement.className = 'px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm';
                break;
            case 'connecting':
                statusElement.textContent = 'Conectando...';
                statusElement.className = 'px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm';
                break;
            case 'disconnected':
            default:
                statusElement.textContent = 'Desconectado';
                statusElement.className = 'px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm';
                break;
        }
    }

    /**
     * Adicionar entrada no log
     */
    addLog(message, type = 'info') {
        const logElement = document.getElementById('syncLog');
        if (!logElement) {
            
            return;
        }

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        
        let className = 'mb-1';
        switch (type) {
            case 'success':
                className += ' text-green-600';
                break;
            case 'error':
                className += ' text-red-600';
                break;
            case 'warning':
                className += ' text-yellow-600';
                break;
            default:
                className += ' text-gray-600';
        }
        
        logEntry.className = className;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
    }

    /**
     * Limpar log
     */
    clearLog() {
        const logElement = document.getElementById('syncLog');
        if (logElement) {
            logElement.innerHTML = '<p class="text-gray-500">Log limpo...</p>';
        }
    }

    /**
     * Carregar configuração existente da incorporadora
     */
    async loadExistingConfiguration() {
        if (!this.selectedIncorporadora) return;

        try {
            this.addLog(`🔍 Verificando configuração existente para ${this.selectedIncorporadora}...`, 'info');
            
            const response = await this.apiClient.request(`/fabric/configuration/${this.selectedIncorporadora}`);
            
            if (response.success && response.data) {
                const config = response.data;
                this.addLog(`✅ Configuração encontrada para ${this.selectedIncorporadora}`, 'success');
                this.addLog(`   Workspace: ${config.workspaceName}`, 'info');
                this.addLog(`   Modelo: ${config.semanticModelName}`, 'info');
                this.addLog(`   Última sync: ${config.lastSyncStatus.status}`, 'info');
                
                // Pré-selecionar workspace e dataset se existir
                this.selectedWorkspace = config.workspaceId;
                this.selectedDataset = config.semanticModelId;
                
                // Atualizar interface
                const workspaceSelect = document.getElementById('workspaceSelect');
                const datasetSelect = document.getElementById('datasetSelect');
                
                if (workspaceSelect && this.selectedWorkspace) {
                    workspaceSelect.value = this.selectedWorkspace;
                }
                if (datasetSelect && this.selectedDataset) {
                    datasetSelect.value = this.selectedDataset;
                }
            } else {
                this.addLog(`ℹ️ Nenhuma configuração encontrada para ${this.selectedIncorporadora}`, 'info');
                this.addLog(`   Configure workspace e modelo semântico abaixo`, 'info');
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao verificar configuração: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro ao verificar configuração:', error);
        }
    }

    /**
     * Salvar configuração Incorporadora → Semantic Model
     */
    async saveConfiguration() {
        if (!this.selectedIncorporadora) {
            this.addLog('⚠️ Selecione uma incorporadora primeiro', 'warning');
            return;
        }

        if (!this.selectedWorkspace) {
            this.addLog('⚠️ Selecione um workspace primeiro', 'warning');
            return;
        }

        const datasetSelect = document.getElementById('datasetSelect');
        this.selectedDataset = datasetSelect?.value;
        
        if (!this.selectedDataset) {
            this.addLog('⚠️ Selecione um modelo semântico primeiro', 'warning');
            return;
        }

        try {
            this.addLog('💾 Salvando configuração...', 'info');
            
            // Obter nomes dos elementos selecionados
            const workspaceSelect = document.getElementById('workspaceSelect');
            const workspaceName = workspaceSelect?.options[workspaceSelect.selectedIndex]?.text || 'Workspace Selecionado';
            const semanticModelName = datasetSelect?.options[datasetSelect.selectedIndex]?.text || 'Modelo Selecionado';
            
            const configData = {
                incorporadora: this.selectedIncorporadora,  // Mudado de 'company' para 'incorporadora'
                workspaceId: this.selectedWorkspace,
                workspaceName: workspaceName.replace(' (DEMO)', ''),
                datasetId: this.selectedDataset,           // Mudado de 'semanticModelId' para 'datasetId'
                datasetName: semanticModelName.replace(' (DEMO)', ''),  // Mudado de 'semanticModelName' para 'datasetName'
                modules: this.getSelectedModules()
            };
            
            const response = await this.apiClient.request('/fabric/save-configuration', 'POST', configData);
            
            if (response.success) {
                this.addLog('✅ Configuração salva com sucesso!', 'success');
                this.addLog(`🎯 ${response.data.company} → ${response.data.semanticModelName}`, 'success');
                this.addLog(`📋 ID: ${response.data._id}`, 'info');
                this.addLog('� Agora você pode sincronizar os dados', 'info');
                
                // Habilitar botão de sincronização
                const syncCompanyBtn = document.getElementById('syncCompany');
                if (syncCompanyBtn) {
                    syncCompanyBtn.disabled = false;
                    syncCompanyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            } else {
                throw new Error(response.message || 'Erro desconhecido');
            }
            
        } catch (error) {
            this.addLog('❌ Erro ao salvar configuração: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro ao salvar configuração:', error);
        }
    }

    /**
     * Sincronizar todos os dados de uma incorporadora
     */
    async syncCompanyData() {
        if (!this.selectedIncorporadora) {
            this.addLog('⚠️ Selecione e configure uma incorporadora primeiro', 'warning');
            return;
        }

        // Confirmar operação
        if (!confirm(`Deseja sincronizar TODOS os dados da ${this.selectedIncorporadora} com o Microsoft Fabric?\n\nEsta operação pode demorar alguns minutos.`)) {
            return;
        }

        try {
            this.addLog('🚀 Iniciando sincronização completa...', 'info');
            this.addLog(`📊 Processando dados da ${this.selectedIncorporadora}...`, 'info');
            
            const response = await this.apiClient.request('/fabric/sync-company', 'POST', {
                company: this.selectedIncorporadora
            });

            if (response.success) {
                const data = response.data;
                this.addLog('🎉 Sincronização concluída com sucesso!', 'success');
                this.addLog(`📈 Estatísticas:`, 'info');
                this.addLog(`   👥 Usuários: ${data.totalUsers}`, 'info');
                this.addLog(`   📋 Cenários: ${data.totalScenarios}`, 'info');
                this.addLog(`   📊 Registros sincronizados: ${data.totalRecords}`, 'info');
                this.addLog(`   ⏱️ Tempo: ${data.duration}`, 'info');
                
                // Mostrar detalhes por módulo
                Object.entries(data.modules).forEach(([module, result]) => {
                    if (result.success) {
                        this.addLog(`   ✅ ${module}: ${result.recordsCount} registros`, 'success');
                    } else {
                        this.addLog(`   ❌ ${module}: ${result.error}`, 'error');
                    }
                });
                
                this.addLog('🏆 Dados agora disponíveis no Power BI/Fabric!', 'success');
                
            } else {
                throw new Error(response.message || 'Erro na sincronização');
            }
            
        } catch (error) {
            this.addLog('❌ Erro na sincronização: ' + error.message, 'error');
            console.error('❌ [FABRIC-ADMIN] Erro na sincronização:', error);
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    
    window.fabricAdmin = new FabricAdmin();
});
