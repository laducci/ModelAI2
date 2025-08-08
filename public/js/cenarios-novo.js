// Gerenciamento de Cenários - ModelAI
class ScenarioManager {
    constructor() {
        this.api = new ApiClient();
        this.currentUser = null;
        this.scenarios = [];
    }

    async init() {
        try {
            
            // Verificar autenticação
            if (!this.api.isAuthenticated()) {
                window.location.href = '/login.html';
                return;
            }

            this.currentUser = this.api.getCurrentUser();
            
            
            if (!this.currentUser) {
                showError('Erro ao obter dados do usuário. Redirecionando...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }

            await this.loadScenarios();
            this.setupEventListeners();


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
            
            const response = await fetch('/api/scenarios', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.scenarios = data.scenarios || [];
                

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
        const grid = document.getElementById('scenariosGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) {
            console.warn('⚠️ Grid de cenários não encontrado');
            return;
        }
        
        if (this.scenarios.length === 0) {
            
            if (grid) grid.style.display = 'none';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        
        
        grid.style.display = 'grid';
        if (emptyState) emptyState.classList.add('hidden');
        
        grid.innerHTML = this.scenarios.map(scenario => {
            const data = scenario.data || {};
            const dadosGerais = data.dadosGerais || {};
            const tabelaVendas = data.tabelaVendas || {};
            
            return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 group" data-scenario-id="${scenario._id || scenario.id}">
                <!-- Header do Card -->
                <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-folder text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-1">${scenario.name}</h3>
                            <p class="text-sm text-gray-500">
                                <i class="fas fa-calendar text-xs mr-1"></i>
                                ${new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="scenarioManager.editScenario('${scenario._id || scenario.id}')" 
                                class="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" 
                                title="Editar cenário">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="scenarioManager.deleteScenario('${scenario._id || scenario.id}')" 
                                class="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir cenário">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                
                ${scenario.description ? `
                <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-700">${scenario.description}</p>
                </div>
                ` : ''}
                
                <!-- Informações do Cenário -->
                <div class="space-y-4 mb-6">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <i class="fas fa-user text-gray-400 text-xs"></i>
                            Cliente:
                        </span>
                        <span class="font-medium text-gray-900 text-sm">${dadosGerais.cliente || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <i class="fas fa-home text-gray-400 text-xs"></i>
                            Unidade:
                        </span>
                        <span class="font-medium text-gray-900 text-sm">${dadosGerais.unidade || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <i class="fas fa-building text-gray-400 text-xs"></i>
                            Empreendimento:
                        </span>
                        <span class="font-medium text-gray-900 text-sm">${dadosGerais.empreendimento || 'N/A'}</span>
                    </div>
                </div>
                
                <!-- Separador -->
                <div class="border-t border-gray-100 mb-6"></div>
                
                <!-- Botões de Ação -->
                <div class="flex gap-3">
                    <button onclick="scenarioManager.loadScenario('${scenario._id || scenario.id}')" 
                            class="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <i class="fas fa-edit text-sm"></i>
                        Editar
                    </button>
                    <button onclick="scenarioManager.viewResults('${scenario._id || scenario.id}')" 
                            class="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <i class="fas fa-chart-line text-sm"></i>
                        Resultados
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Busca em tempo real
        const searchInput = document.getElementById('searchScenarios');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterScenarios();
            });
        }

        // Filtro por cliente
        const clientFilter = document.getElementById('filterClient');
        if (clientFilter) {
            clientFilter.addEventListener('change', (e) => {
                this.filterScenarios();
            });
        }

        // Ordenação
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.filterScenarios();
            });
        }

        // Popular filtro de clientes
        this.populateClientFilter();
    }

    populateClientFilter() {
        const clientFilter = document.getElementById('filterClient');
        if (!clientFilter || !this.scenarios) return;

        // Extrair clientes únicos
        const clients = [...new Set(this.scenarios.map(scenario => {
            const data = scenario.data || {};
            const dadosGerais = data.dadosGerais || {};
            return dadosGerais.cliente;
        }).filter(client => client && client !== 'N/A'))];

        // Limpar e adicionar opções
        clientFilter.innerHTML = '<option value="">Todos os Clientes</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client;
            option.textContent = client;
            clientFilter.appendChild(option);
        });
    }

    filterScenarios() {
        const searchTerm = document.getElementById('searchScenarios')?.value.toLowerCase() || '';
        const selectedClient = document.getElementById('filterClient')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'date';

        let filteredScenarios = [...this.scenarios];

        // Filtrar por busca
        if (searchTerm) {
            filteredScenarios = filteredScenarios.filter(scenario => {
                const data = scenario.data || {};
                const dadosGerais = data.dadosGerais || {};
                
                return (
                    scenario.name.toLowerCase().includes(searchTerm) ||
                    (dadosGerais.cliente && dadosGerais.cliente.toLowerCase().includes(searchTerm)) ||
                    (dadosGerais.empreendimento && dadosGerais.empreendimento.toLowerCase().includes(searchTerm)) ||
                    (dadosGerais.unidade && dadosGerais.unidade.toLowerCase().includes(searchTerm))
                );
            });
        }

        // Filtrar por cliente
        if (selectedClient) {
            filteredScenarios = filteredScenarios.filter(scenario => {
                const data = scenario.data || {};
                const dadosGerais = data.dadosGerais || {};
                return dadosGerais.cliente === selectedClient;
            });
        }

        // Ordenar
        filteredScenarios.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'client':
                    const clientA = (a.data?.dadosGerais?.cliente || '').toLowerCase();
                    const clientB = (b.data?.dadosGerais?.cliente || '').toLowerCase();
                    return clientA.localeCompare(clientB);
                case 'date':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Renderizar cenários filtrados
        this.renderFilteredScenarios(filteredScenarios);
    }

    renderFilteredScenarios(scenarios) {
        const grid = document.getElementById('scenariosGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) return;
        
        if (scenarios.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        grid.style.display = 'grid';
        if (emptyState) emptyState.classList.add('hidden');
        
        grid.innerHTML = scenarios.map(scenario => {
            const data = scenario.data || {};
            const dadosGerais = data.dadosGerais || {};
            
            return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 group" data-scenario-id="${scenario._id || scenario.id}">
                <!-- Header do Card -->
                <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-folder text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-1">${scenario.name}</h3>
                            <p class="text-sm text-gray-500">
                                <i class="fas fa-calendar text-xs mr-1"></i>
                                ${new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="scenarioManager.editScenario('${scenario._id || scenario.id}')" 
                                class="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" 
                                title="Editar cenário">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="scenarioManager.deleteScenario('${scenario._id || scenario.id}')" 
                                class="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir cenário">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                
                ${scenario.description ? `
                <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-700">${scenario.description}</p>
                </div>
                ` : ''}
                
                <!-- Informações do Cenário -->
                <div class="space-y-4 mb-6">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <i class="fas fa-user text-gray-400 text-xs"></i>
                            Cliente:
                        </span>
                        <span class="font-medium text-gray-900 text-sm">${dadosGerais.cliente || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <i class="fas fa-home text-gray-400 text-xs"></i>
                            Unidade:
                        </span>
                        <span class="font-medium text-gray-900 text-sm">${dadosGerais.unidade || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <i class="fas fa-building text-gray-400 text-xs"></i>
                            Empreendimento:
                        </span>
                        <span class="font-medium text-gray-900 text-sm">${dadosGerais.empreendimento || 'N/A'}</span>
                    </div>
                </div>
                
                <!-- Separador -->
                <div class="border-t border-gray-100 mb-6"></div>
                
                <!-- Botões de Ação -->
                <div class="flex gap-3">
                    <button onclick="scenarioManager.loadScenario('${scenario._id || scenario.id}')" 
                            class="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <i class="fas fa-edit text-sm"></i>
                        Editar
                    </button>
                    <button onclick="scenarioManager.viewResults('${scenario._id || scenario.id}')" 
                            class="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <i class="fas fa-chart-line text-sm"></i>
                        Resultados
                    </button>
                </div>
            </div>
            `;
        }).join('');
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


            // Limpar dados antigos
            sessionStorage.removeItem('editingScenario');
            
            // Salvar dados do cenário para a página de inputs
            sessionStorage.setItem('editingScenario', JSON.stringify({
                _id: scenario._id || scenario.id, // Usar _id como chave principal
                id: scenario._id || scenario.id,  // Manter id para compatibilidade
                name: scenario.name,
                description: scenario.description,
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
    
    scenarioManager.init();
});

// ==================== FUNÇÕES GLOBAIS ====================

function createNewScenario() {
    
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

// Função para atualizar estatísticas na página de cenários
function updateScenarioStats(scenarios) {
    if (!scenarios || !Array.isArray(scenarios)) return;
    
    // Total de cenários
    const totalElement = document.getElementById('totalScenarios');
    if (totalElement) {
        totalElement.textContent = scenarios.length;
    }
    
    // Cenários criados hoje
    const today = new Date().toDateString();
    const todayScenarios = scenarios.filter(scenario => {
        const scenarioDate = new Date(scenario.createdAt).toDateString();
        return scenarioDate === today;
    }).length;
    
    const todayElement = document.getElementById('todayScenarios');
    if (todayElement) {
        todayElement.textContent = todayScenarios;
    }
    
    // Favoritos (implementar quando houver funcionalidade)
    const favoriteElement = document.getElementById('favoriteScenarios');
    if (favoriteElement) {
        favoriteElement.textContent = '0'; // Placeholder
    }
    
    // Analisados (cenários que têm resultados)
    const analyzedScenarios = scenarios.filter(scenario => 
        scenario.data && Object.keys(scenario.data).length > 0
    ).length;
    
    const analyzedElement = document.getElementById('analyzedScenarios');
    if (analyzedElement) {
        analyzedElement.textContent = analyzedScenarios;
    }
}

// Tornar a instância global disponível
window.scenarioManager = scenarioManager;
