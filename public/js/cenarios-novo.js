// Gerenciamento de Cenários - ModelAI
class ScenarioManager {
    constructor() {
        this.api = new ApiClient();
        this.currentUser = null;
        this.scenarios = [];
    }

    async init() {
        try {
            console.log('🎬 Inicializando ScenarioManager...');
            
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
            console.log('📂 === CARREGANDO CENÁRIOS ===');
            
            const response = await fetch('/api/scenarios', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('📈 Status da resposta:', response.status);

            if (response.ok) {
                const data = await response.json();
                this.scenarios = data.scenarios || [];
                console.log('✅ Cenários carregados da API:', this.scenarios.length);
                
            } else {
                const errorText = await response.text();
                console.error('❌ Erro da API:', response.status, errorText);
                this.scenarios = [];
            }
            
            this.renderScenarios();
            
        } catch (error) {
            console.error('❌ ERRO FATAL ao carregar cenários:', error);
            this.scenarios = [];
            this.renderScenarios();
        }
    }

    renderScenarios() {
        console.log('🎨 === RENDERIZANDO CENÁRIOS ===');
        console.log('📊 Cenários para renderizar:', this.scenarios.length);
        
        const grid = document.getElementById('scenariosGrid');
        const emptyState = document.getElementById('emptyState');
        
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
            const data = scenario.data || {};
            const dadosGerais = data.dadosGerais || {};
            const tabelaVendas = data.tabelaVendas || {};
            
            return `
            <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100" data-scenario-id="${scenario._id || scenario.id}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-folder text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${scenario.name}</h3>
                            <p class="text-sm text-gray-500">Criado em ${new Date(scenario.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="scenarioManager.editScenario('${scenario._id || scenario.id}')" 
                                class="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" 
                                title="Editar cenário">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="scenarioManager.deleteScenario('${scenario._id || scenario.id}')" 
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
                        <span class="text-gray-600">Cliente:</span>
                        <span class="font-medium text-gray-800">${dadosGerais.cliente || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Unidade:</span>
                        <span class="font-medium text-gray-800">${dadosGerais.unidade || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Empreendimento:</span>
                        <span class="font-medium text-gray-800">${dadosGerais.empreendimento || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="scenarioManager.loadScenario('${scenario._id || scenario.id}')" 
                            class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <i class="fas fa-edit mr-2"></i>Editar
                    </button>
                    <button onclick="scenarioManager.viewResults('${scenario._id || scenario.id}')" 
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
        // Os event listeners serão configurados via onclick no HTML
    }

    async deleteScenario(scenarioId) {
        try {
            const scenario = this.scenarios.find(s => (s._id || s.id) === scenarioId);
            if (!scenario) {
                showError('Cenário não encontrado.');
                return;
            }

            const confirmed = await confirmDelete(
                `Tem certeza que deseja excluir o cenário "${scenario.name}"?`,
                'Confirmar Exclusão',
                scenario.name
            );

            if (!confirmed) return;

            console.log('🗑️ Deletando cenário:', scenarioId);

            const response = await fetch(`/api/scenarios/${scenarioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                showSuccess(`Cenário "${scenario.name}" excluído com sucesso!`);
                await this.loadScenarios();
            } else {
                const error = await response.json();
                showError(error.message || 'Erro ao excluir cenário');
            }

        } catch (error) {
            console.error('❌ Erro ao deletar cenário:', error);
            showError('Erro ao excluir cenário.');
        }
    }

    async loadScenario(scenarioId) {
        try {
            console.log('📂 Carregando cenário do banco:', scenarioId);

            if (!scenarioId) {
                throw new Error('ID do cenário é obrigatório');
            }

            const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }

            // Buscar cenário diretamente da API
            const response = await fetch(`/api/scenarios/${scenarioId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}: Cenário não encontrado`);
            }

            const result = await response.json();
            const scenario = result.scenario;

            if (!scenario) {
                throw new Error('Dados do cenário não encontrados na resposta');
            }

            console.log('📂 Cenário carregado do banco:', scenario.name);

            // Limpar dados antigos
            sessionStorage.removeItem('editingScenario');
            
            // Salvar dados do cenário para a página de inputs
            sessionStorage.setItem('editingScenario', JSON.stringify({
                id: scenario._id || scenario.id,
                name: scenario.name,
                data: scenario.data
            }));
            
            showInfo(`Carregando cenário "${scenario.name}" para edição...`);
            
            // Redirecionar para inputs
            setTimeout(() => {
                window.location.href = 'inputs.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro ao carregar cenário:', error);
            showError(`Erro ao carregar cenário: ${error.message}`);
        }
    }

    async viewResults(scenarioId) {
        try {
            console.log('📊 Carregando cenário para resultados:', scenarioId);

            // Buscar cenário diretamente da API
            const response = await fetch(`/api/scenarios/${scenarioId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Cenário não encontrado');
            }

            const result = await response.json();
            const scenario = result.scenario;

            console.log('📊 Visualizando resultados do cenário:', scenario.name);

            // Salvar dados do cenário na sessão para resultados
            sessionStorage.setItem('currentInputData', JSON.stringify(scenario.data));
            sessionStorage.setItem('currentScenarioName', scenario.name);
            sessionStorage.setItem('currentScenarioId', scenario._id || scenario.id);
            
            showInfo(`Visualizando resultados de "${scenario.name}"...`);
            
            // Redirecionar para resultados com parâmetro do ID
            setTimeout(() => {
                window.location.href = `resultados.html?scenario=${scenario._id || scenario.id}`;
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro ao visualizar resultados:', error);
            showError('Erro ao visualizar resultados.');
        }
    }

    editScenario(scenarioId) {
        try {
            console.log('✏️ Editando cenário:', scenarioId);
            
            if (!scenarioId) {
                showError('ID do cenário não encontrado');
                return;
            }
            
            // Carregar o cenário para edição
            this.loadScenario(scenarioId);
            
        } catch (error) {
            console.error('❌ Erro ao iniciar edição:', error);
            showError('Erro ao carregar cenário para edição');
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

// ==================== FUNÇÕES GLOBAIS ====================

function createNewScenario() {
    console.log('🆕 Criando novo cenário...');
    window.location.href = '/inputs.html';
}

function openScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Limpar o input
        const input = document.getElementById('scenarioNameInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function closeScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function confirmSaveScenario() {
    const nameInput = document.getElementById('scenarioNameInput');
    const name = nameInput?.value?.trim();
    
    if (!name) {
        showError('Digite um nome para o cenário');
        return;
    }
    
    try {
        // Coletar dados dos inputs da página atual
        const data = collectCurrentInputData();
        
        if (!data || Object.keys(data).length === 0) {
            showError('Nenhum dado encontrado para salvar. Preencha os inputs primeiro.');
            return;
        }
        
        const response = await fetch('/api/scenarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: name,
                description: `Cenário criado em ${new Date().toLocaleDateString('pt-BR')}`,
                data: data
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess('Cenário salvo com sucesso!');
            closeScenarioModal();
            
            // Recarregar cenários se estamos na página de cenários
            if (window.scenarioManager) {
                await window.scenarioManager.loadScenarios();
            }
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao salvar cenário');
        }
        
    } catch (error) {
        console.error('Erro ao salvar cenário:', error);
        showError('Erro ao salvar cenário. Tente novamente.');
    }
}

function collectCurrentInputData() {
    // Esta função será implementada na página de inputs
    // Por enquanto, retornará um objeto vazio
    if (typeof window.collectAllInputData === 'function') {
        return window.collectAllInputData();
    }
    return {};
}

// Tornar a instância global disponível
window.scenarioManager = scenarioManager;
