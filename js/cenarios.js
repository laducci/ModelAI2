// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const toggleBtn = document.getElementById('toggleSidebar');

if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

// Responsive handling
function handleResize() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    }
}

// Gerenciamento de Cenários
function loadScenarios() {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const grid = document.getElementById('scenariosGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (scenarios.length === 0) {
        grid.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.classList.add('hidden');
    
    grid.innerHTML = scenarios.map(scenario => `
        <div class="glassmorphism rounded-xl p-6 card-hover">
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
                    <button onclick="editScenario('${scenario.id}')" class="p-2 text-gray-500 hover:text-teal-600 transition-colors" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteScenario('${scenario.id}')" class="p-2 text-gray-500 hover:text-red-600 transition-colors" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="space-y-2 mb-4 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Cliente:</span>
                    <span class="font-medium">${scenario.data.dadosGerais?.cliente || '-'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Empreendimento:</span>
                    <span class="font-medium">${scenario.data.dadosGerais?.empreendimento || '-'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Valor Total:</span>
                    <span class="font-medium">${formatCurrency(calculateTotalValue(scenario.data.tabelaVendas))}</span>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="loadScenario('${scenario.id}')" class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                    <i class="fas fa-play mr-1"></i>Carregar
                </button>
                <button onclick="viewResults('${scenario.id}')" class="flex-1 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm">
                    <i class="fas fa-chart-line mr-1"></i>Resultados
                </button>
            </div>
        </div>
    `).join('');
}

function calculateTotalValue(tabelaVendas) {
    if (!tabelaVendas) return 0;
    const entrada = parseCurrency(tabelaVendas.entrada) || 0;
    const parcelas = parseCurrency(tabelaVendas.parcelas) || 0;
    const reforcos = parseCurrency(tabelaVendas.reforcos) || 0;
    const nasChaves = parseCurrency(tabelaVendas.nasChaves) || 0;
    return entrada + parcelas + reforcos + nasChaves;
}

function parseCurrency(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

function formatCurrency(value) {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function createNewScenario() {
    window.location.href = 'inputs.html';
}

function editScenario(scenarioId) {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (scenario) {
        // Carregar dados no localStorage para edição
        localStorage.setItem('dadosGerais', JSON.stringify(scenario.data.dadosGerais || {}));
        localStorage.setItem('tabelaVendas', JSON.stringify(scenario.data.tabelaVendas || {}));
        localStorage.setItem('propostaCliente', JSON.stringify(scenario.data.propostaCliente || {}));
        localStorage.setItem('editingScenarioId', scenarioId);
        
        // Redirecionar para inputs
        window.location.href = 'inputs.html';
    }
}

function deleteScenario(scenarioId) {
    if (confirm('Tem certeza que deseja excluir este cenário?')) {
        const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
        const updatedScenarios = scenarios.filter(s => s.id !== scenarioId);
        localStorage.setItem('scenarios', JSON.stringify(updatedScenarios));
        loadScenarios();
    }
}

function loadScenario(scenarioId) {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (scenario) {
        // Carregar dados no localStorage
        localStorage.setItem('dadosGerais', JSON.stringify(scenario.data.dadosGerais || {}));
        localStorage.setItem('tabelaVendas', JSON.stringify(scenario.data.tabelaVendas || {}));
        localStorage.setItem('propostaCliente', JSON.stringify(scenario.data.propostaCliente || {}));
        localStorage.setItem('currentScenarioId', scenarioId);
        
        // Mostrar mensagem de sucesso
        alert('Cenário carregado com sucesso!');
    }
}

function viewResults(scenarioId) {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (scenario) {
        // Carregar dados no localStorage
        localStorage.setItem('dadosGerais', JSON.stringify(scenario.data.dadosGerais || {}));
        localStorage.setItem('tabelaVendas', JSON.stringify(scenario.data.tabelaVendas || {}));
        localStorage.setItem('propostaCliente', JSON.stringify(scenario.data.propostaCliente || {}));
        localStorage.setItem('currentScenarioId', scenarioId);
        
        // Redirecionar para resultados
        window.location.href = 'resultados.html';
    }
}

// Modal functions
function openScenarioModal() {
    document.getElementById('scenarioModal').classList.remove('hidden');
    document.getElementById('scenarioNameInput').focus();
}

function closeScenarioModal() {
    document.getElementById('scenarioModal').classList.add('hidden');
    document.getElementById('scenarioNameInput').value = '';
}

function confirmSaveScenario() {
    const name = document.getElementById('scenarioNameInput').value.trim();
    if (!name) {
        alert('Por favor, digite um nome para o cenário.');
        return;
    }
    
    // Recuperar dados dos inputs
    const dadosGerais = JSON.parse(localStorage.getItem('dadosGerais') || '{}');
    const tabelaVendas = JSON.parse(localStorage.getItem('tabelaVendas') || '{}');
    const propostaCliente = JSON.parse(localStorage.getItem('propostaCliente') || '{}');
    
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const editingId = localStorage.getItem('editingScenarioId');
    
    if (editingId) {
        // Editando cenário existente
        const index = scenarios.findIndex(s => s.id === editingId);
        if (index !== -1) {
            scenarios[index] = {
                id: editingId,
                name: name,
                data: { dadosGerais, tabelaVendas, propostaCliente },
                createdAt: scenarios[index].createdAt,
                updatedAt: new Date().toISOString()
            };
        }
        localStorage.removeItem('editingScenarioId');
    } else {
        // Novo cenário
        const newScenario = {
            id: 'scenario_' + Date.now(),
            name: name,
            data: { dadosGerais, tabelaVendas, propostaCliente },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        scenarios.push(newScenario);
    }
    
    localStorage.setItem('scenarios', JSON.stringify(scenarios));
    closeScenarioModal();
    loadScenarios();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    handleResize();
    window.addEventListener('resize', handleResize);
    loadScenarios();
    
    // Verificar se veio de um salvamento
    const pendingSave = localStorage.getItem('pendingScenarioSave');
    if (pendingSave) {
        localStorage.removeItem('pendingScenarioSave');
        openScenarioModal();
    }
});

// Permitir salvar com Enter no modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !document.getElementById('scenarioModal').classList.contains('hidden')) {
        confirmSaveScenario();
    }
});
