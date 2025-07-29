// Administração de Usuários - ModelAI

// Verificar se usuário é admin
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Verificar autenticação
        if (!api.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        // Verificar se é admin
        const userProfile = await api.getProfile();
        if (userProfile.user.role !== 'admin') {
            showNotification('Acesso negado. Apenas administradores podem acessar esta página.', 'error');
            window.location.href = '/index.html';
            return;
        }

        // Atualizar info do usuário no sidebar
        document.getElementById('userName').textContent = userProfile.user.name;
        document.getElementById('userEmail').textContent = userProfile.user.email;

        // Carregar dados
        await carregarDashboard();
        await carregarUsuarios();

        // Setup dos filtros
        setupFiltros();
        
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        showNotification('Erro ao carregar página de administração', 'error');
    }
});

// Carregar estatísticas do dashboard
async function carregarDashboard() {
    try {
        const stats = await api.get('/users/stats/dashboard');
        
        document.getElementById('totalUsuarios').textContent = stats.stats.totalUsers || 0;
        document.getElementById('usuariosAtivos').textContent = stats.stats.activeUsers || 0;
        document.getElementById('novosUsuarios').textContent = stats.stats.newUsers || 0;
        document.getElementById('totalCenarios').textContent = stats.stats.totalScenarios || 0;
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        // Mostrar valores zerados se der erro
        document.getElementById('totalUsuarios').textContent = '0';
        document.getElementById('usuariosAtivos').textContent = '0';
        document.getElementById('novosUsuarios').textContent = '0';
        document.getElementById('totalCenarios').textContent = '0';
    }
}

// Carregar lista de usuários
async function carregarUsuarios() {
    try {
        const response = await api.get('/users');
        const usuarios = response.users || [];
        
        const tbody = document.getElementById('tabelaUsuarios');
        const emptyState = document.getElementById('emptyState');
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        tbody.innerHTML = usuarios.map(usuario => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                            <i class="fas ${usuario.role === 'admin' ? 'fa-crown text-yellow-300' : 'fa-user text-white'}"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${usuario.name}</div>
                            <div class="text-sm text-gray-500">ID: ${usuario._id.substring(0, 8)}...</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${usuario.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${usuario.company || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                    }">
                        ${usuario.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${usuario.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${usuario.lastLogin ? new Date(usuario.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="editarUsuario('${usuario._id}')" 
                                class="text-teal-600 hover:text-teal-900 transition-colors" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="alternarStatusUsuario('${usuario._id}', ${!usuario.isActive})" 
                                class="text-${usuario.isActive ? 'red' : 'green'}-600 hover:text-${usuario.isActive ? 'red' : 'green'}-900 transition-colors" 
                                title="${usuario.isActive ? 'Desativar' : 'Ativar'}">
                            <i class="fas fa-${usuario.isActive ? 'ban' : 'check'}"></i>
                        </button>
                        ${usuario.role !== 'admin' ? `
                            <button onclick="excluirUsuario('${usuario._id}')" 
                                    class="text-red-600 hover:text-red-900 transition-colors" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar lista de usuários', 'error');
    }
}

// Setup dos filtros
function setupFiltros() {
    const searchInput = document.getElementById('searchUsers');
    const statusFilter = document.getElementById('filterStatus');
    
    let timeoutId;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            filtrarUsuarios();
        }, 300);
    });
    
    statusFilter.addEventListener('change', filtrarUsuarios);
}

// Filtrar usuários
async function filtrarUsuarios() {
    const search = document.getElementById('searchUsers').value;
    const status = document.getElementById('filterStatus').value;
    
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        
        const response = await api.get(`/users?${params.toString()}`);
        const usuarios = response.users || [];
        
        // Atualizar tabela com resultados filtrados
        const tbody = document.getElementById('tabelaUsuarios');
        // ... (mesmo código da função carregarUsuarios para renderizar)
        
    } catch (error) {
        console.error('Erro ao filtrar usuários:', error);
        showNotification('Erro ao filtrar usuários', 'error');
    }
}

// Modal de novo usuário
function abrirModalNovoUsuario() {
    document.getElementById('modalNovoUsuario').classList.remove('hidden');
    document.getElementById('formNovoUsuario').reset();
}

function fecharModalNovoUsuario() {
    document.getElementById('modalNovoUsuario').classList.add('hidden');
}

// Criar novo usuário
document.getElementById('formNovoUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('novoNome').value,
        email: document.getElementById('novoEmail').value,
        password: document.getElementById('novaSenha').value,
        company: document.getElementById('novaEmpresa').value,
        role: document.getElementById('novoRole').value
    };
    
    try {
        await api.post('/auth/register', userData);
        showNotification('Usuário criado com sucesso!', 'success');
        fecharModalNovoUsuario();
        await carregarUsuarios();
        await carregarDashboard();
        
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        showNotification(error.message || 'Erro ao criar usuário', 'error');
    }
});

// Alterar status do usuário
async function alternarStatusUsuario(userId, novoStatus) {
    try {
        await api.put(`/users/${userId}/status`, { isActive: novoStatus });
        showNotification(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`, 'success');
        await carregarUsuarios();
        await carregarDashboard();
        
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        showNotification('Erro ao alterar status do usuário', 'error');
    }
}

// Editar usuário (placeholder)
function editarUsuario(userId) {
    showNotification('Funcionalidade de edição em desenvolvimento', 'info');
}

// Excluir usuário
async function excluirUsuario(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        await api.delete(`/users/${userId}`);
        showNotification('Usuário excluído com sucesso!', 'success');
        await carregarUsuarios();
        await carregarDashboard();
        
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showNotification('Erro ao excluir usuário', 'error');
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        api.logout();
        window.location.href = '/login.html';
    }
}
