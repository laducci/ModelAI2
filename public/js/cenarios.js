// Gerenciamento de Cenários com Autenticação - ModelAI
class ScenarioManager {
    constructor() {
        this.api = new ApiClient();
        this.currentUser = null;
        this.scenarios = [];
    }

    async init() {
        try {
            console.log('🎬 Inicializando ScenarioManager...');
            
            // LIMPAR CENÁRIOS ANTIGOS DO LOCALSTORAGE (temporário para debug)
            console.log('🧹 Limpando cenários antigos do localStorage...');
            localStorage.removeItem('scenarios');
            
            // Verificar autenticação
            if (!this.api.isAuthenticated()) {
                console.log('❌ Usuário não autenticado, redirecionando...');
                window.location.href = '/login.html';
                return;
            }

            this.currentUser = this.api.getCurrentUser();
            console.log('👤 Usuário atual:', this.currentUser);
            
            if (!this.currentUser) {
                showError('Erro ao obter dados do usuário. Redirecionando...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }

            await this.loadScenarios();
            this.setupEventListeners();
            
            console.log('✅ ScenarioManager inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar cenários:', error);
            showError('Erro ao carregar cenários. Redirecionando...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        }
    }

    async loadScenarios() {
        try {
            console.log('📂 Carregando cenários do usuário via API...');
            
            const response = await fetch('/api/scenarios', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.scenarios = data.scenarios || [];
                console.log('📊 Cenários carregados da API:', this.scenarios.length);
            } else {
                console.warn('⚠️ Erro ao carregar da API, usando localStorage como fallback');
                // Fallback para localStorage se API falhar
                const allScenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
                this.scenarios = allScenarios.filter(scenario => 
                    scenario.userId === this.currentUser._id
                );
            }
            
            this.renderScenarios();
            
        } catch (error) {
            console.error('❌ Erro ao carregar cenários:', error);
            // Fallback para localStorage em caso de erro
            const allScenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
            this.scenarios = allScenarios.filter(scenario => 
                scenario.userId === this.currentUser._id
            );
            this.renderScenarios();
        }
    }

    renderScenarios() {
        console.log('🎨 === RENDERIZANDO CENÁRIOS ===');
        console.log('📊 Cenários para renderizar:', this.scenarios.length);
        console.log('📝 Lista de cenários:', this.scenarios);
        
        const grid = document.getElementById('scenariosGrid');
        const emptyState = document.getElementById('emptyState');
        
        console.log('🔍 Grid encontrado:', !!grid);
        console.log('🔍 EmptyState encontrado:', !!emptyState);
        
        if (!grid) {
            console.warn('⚠️ Grid de cenários não encontrado');
            return;
        }
        
        if (this.scenarios.length === 0) {
            console.log('📭 Nenhum cenário encontrado - exibindo estado vazio');
            if (grid) grid.style.display = 'none';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        console.log('🎨 Renderizando', this.scenarios.length, 'cenários');
        
        grid.style.display = 'grid';
        if (emptyState) emptyState.classList.add('hidden');
        
        grid.innerHTML = this.scenarios.map(scenario => {
            return `
            <div class="glassmorphism rounded-xl p-6 card-hover" data-scenario-id="${scenario.id}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-folder text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${scenario.name}</h3>
                            <p class="text-sm text-gray-500">Criado em ${new Date(scenario.createdAt).toLocaleDateString('pt-BR')}</p>
                            <p class="text-xs text-gray-400">Por: ${scenario.userName || 'Usuário'}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="scenarioManager.editScenario('${scenario.id}')" 
                                class="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" 
                                title="Editar cenário">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="scenarioManager.deleteScenario('${scenario.id}')" 
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir cenário">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${scenario.description ? `
                <div class="mb-3">
                    <p class="text-sm text-gray-600">${scenario.description}</p>
                </div>
                ` : ''}
                
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Valor Inicial:</span>
                        <span class="font-medium text-gray-800">R$ ${scenario.data?.valorInicial?.toLocaleString('pt-BR') || '0'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Taxa:</span>
                        <span class="font-medium text-gray-800">${scenario.data?.taxa || '0'}%</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Período:</span>
                        <span class="font-medium text-gray-800">${scenario.data?.periodo || '0'} anos</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="scenarioManager.loadScenario('${scenario.id}')" 
                            class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <i class="fas fa-play mr-2"></i>Executar
                    </button>
                    <button onclick="scenarioManager.viewResults('${scenario.id}')" 
                            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        <i class="fas fa-chart-line mr-2"></i>Resultados
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Event listeners para formulários e botões
        const saveBtn = document.querySelector('[onclick="confirmSaveScenario()"]');
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                this.saveScenario();
            };
        }

        // Listener para o modal de salvar cenário
        const modal = document.getElementById('saveScenarioModal');
        if (modal) {
            // Fechar modal ao clicar fora
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Listener para botão de fechar modal
        const closeBtn = modal?.querySelector('[onclick*="closeModal"]');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal();
        }
    }

    async saveScenario() {
        try {
            console.log('💾 Iniciando salvamento de cenário...');
            
            const scenarioName = document.getElementById('scenarioName')?.value;
            const scenarioDescription = document.getElementById('scenarioDescription')?.value;
            
            if (!scenarioName?.trim()) {
                showWarning('Por favor, digite um nome para o cenário.');
                return;
            }

            // Obter dados dos inputs da sessão atual
            const inputData = JSON.parse(localStorage.getItem('currentInputs') || '{}');
            
            if (!inputData || Object.keys(inputData).length === 0) {
                showWarning('Nenhum dado de entrada encontrado. Vá para a página de Inputs primeiro.');
                return;
            }
            
            const scenarioData = {
                name: scenarioName.trim(),
                description: scenarioDescription?.trim() || '',
                data: inputData
            };

            console.log('📝 Salvando cenário via API:', scenarioData);

            // Salvar via API
            const response = await fetch('/api/scenarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(scenarioData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Cenário salvo via API:', result);

                // Também salvar no localStorage para compatibilidade com filtros
                const localScenario = {
                    id: result.scenario.id,
                    name: scenarioData.name,
                    description: scenarioData.description,
                    userId: this.currentUser._id,
                    userName: this.currentUser.name,
                    data: inputData,
                    createdAt: result.scenario.createdAt,
                    updatedAt: result.scenario.createdAt
                };

                const allScenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
                allScenarios.push(localScenario);
                localStorage.setItem('scenarios', JSON.stringify(allScenarios));

                // Recarregar lista
                await this.loadScenarios();
                
                // Fechar modal
                this.closeModal();

                showSuccess(`Cenário "${scenarioData.name}" salvo com sucesso!`);
            } else {
                const error = await response.json();
                console.error('❌ Erro da API:', error);
                showError(`Erro ao salvar: ${error.message}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar cenário:', error);
            showError('Erro ao salvar cenário. Tente novamente.');
        }
    }

    async deleteScenario(scenarioId) {
        try {
            const scenario = this.scenarios.find(s => s.id === scenarioId);
            if (!scenario) {
                showError('Cenário não encontrado.');
                return;
            }

            console.log('🗑️ Solicitando exclusão do cenário:', scenario.name);

            const confirmed = await confirmAction(
                `Tem certeza que deseja excluir o cenário "${scenario.name}"?`,
                'Confirmar Exclusão'
            );

            if (confirmed) {
                console.log('✅ Exclusão confirmada, removendo cenário...');
                
                // Remover do localStorage
                const allScenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
                const filteredScenarios = allScenarios.filter(s => s.id !== scenarioId);
                localStorage.setItem('scenarios', JSON.stringify(filteredScenarios));

                // Atualizar lista
                await this.loadScenarios();
                
                showSuccess(`Cenário "${scenario.name}" excluído com sucesso!`);
            } else {
                console.log('❌ Exclusão cancelada pelo usuário');
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir cenário:', error);
            showError('Erro ao excluir cenário. Tente novamente.');
        }
    }

    loadScenario(scenarioId) {
        try {
            const scenario = this.scenarios.find(s => s.id === scenarioId);
            if (!scenario) {
                showError('Cenário não encontrado.');
                return;
            }

            console.log('📂 Carregando cenário:', scenario.name);

            // Salvar dados do cenário na sessão
            localStorage.setItem('currentInputs', JSON.stringify(scenario.data));
            
            showInfo(`Cenário "${scenario.name}" carregado! Redirecionando para a página de inputs...`);
            
            // Redirecionar para inputs
            setTimeout(() => {
                window.location.href = 'inputs.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro ao carregar cenário:', error);
            showError('Erro ao carregar cenário.');
        }
    }

    viewResults(scenarioId) {
        try {
            const scenario = this.scenarios.find(s => s.id === scenarioId);
            if (!scenario) {
                showError('Cenário não encontrado.');
                return;
            }

            console.log('📊 Visualizando resultados do cenário:', scenario.name);

            // Salvar dados do cenário na sessão
            localStorage.setItem('currentInputs', JSON.stringify(scenario.data));
            
            showInfo(`Visualizando resultados de "${scenario.name}"...`);
            
            // Redirecionar para resultados
            setTimeout(() => {
                window.location.href = 'resultados.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro ao visualizar resultados:', error);
            showError('Erro ao visualizar resultados.');
        }
    }

    editScenario(scenarioId) {
        // Por enquanto, apenas carregar o cenário para edição
        console.log('✏️ Editando cenário:', scenarioId);
        this.loadScenario(scenarioId);
    }

    closeModal() {
        const modal = document.getElementById('saveScenarioModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Limpar formulário
        const nameField = document.getElementById('scenarioName');
        const descField = document.getElementById('scenarioDescription');
        
        if (nameField) nameField.value = '';
        if (descField) descField.value = '';
    }

    openSaveModal() {
        const modal = document.getElementById('saveScenarioModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Focar no campo de nome
            const nameField = document.getElementById('scenarioName');
            if (nameField) {
                setTimeout(() => nameField.focus(), 100);
            }
        }
    }
}

// Instância global
const scenarioManager = new ScenarioManager();

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, inicializando ScenarioManager...');
    scenarioManager.init();
});

// Funções globais para compatibilidade com HTML existente
function confirmSaveScenario() {
    scenarioManager.saveScenario();
}

function loadScenarios() {
    if (scenarioManager.scenarios) {
        scenarioManager.renderScenarios();
    }
}

function deleteScenario(id) {
    scenarioManager.deleteScenario(id);
}

function loadScenario(id) {
    scenarioManager.loadScenario(id);
}

function viewResults(id) {
    scenarioManager.viewResults(id);
}

function closeModal() {
    scenarioManager.closeModal();
}

function openSaveModal() {
    scenarioManager.openSaveModal();
}

// ==================== FUNÇÕES GLOBAIS ====================

function createNewScenario() {
    console.log('🆕 Criando novo cenário...');
    if (scenarioManager) {
        scenarioManager.openSaveModal();
    } else {
        console.error('❌ ScenarioManager não inicializado');
        alert('Erro: Sistema não inicializado. Recarregue a página.');
    }
}