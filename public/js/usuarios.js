// USUARIOS.JS - SISTEMA REAL DE PRODUÇÃO
console.log('👑 USUARIOS - Sistema Real Iniciando...');

let allUsers = [];
let currentUser = null;

// DEFINIR FUNÇÕES GLOBAIS IMEDIATAMENTE
window.abrirModalNovoUsuario = function() {
    console.log('🔄 Tentando abrir modal...');
    
    const modal = document.getElementById('modalNovoUsuario');
    const form = document.getElementById('formNovoUsuario');
    
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        alert('Erro: Modal não encontrado no DOM');
        return;
    }
    
    if (!form) {
        console.error('❌ Form não encontrado!');
        alert('Erro: Formulário não encontrado no DOM');
        return;
    }
    
    console.log('✅ Modal e form encontrados, abrindo...');
    modal.classList.remove('hidden');
    form.reset();
    console.log('✅ Modal aberto com sucesso!');
};

window.fecharModalNovoUsuario = function() {
    const modal = document.getElementById('modalNovoUsuario');
    const form = document.getElementById('formNovoUsuario');
    
    if (modal) modal.classList.add('hidden');
    if (form) {
        form.reset();
        form.removeAttribute('data-editing');
        const title = document.querySelector('#modalNovoUsuario h3');
        if (title) title.textContent = 'Criar Novo Usuário';
        const senhaField = document.getElementById('novaSenha');
        if (senhaField) senhaField.setAttribute('required', '');
    }
    console.log('✅ Modal fechado');
};

// Função de logout global
window.logout = function() {
    console.log('🚪 Logout...');
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('login.html');
};

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📋 DOM carregado - iniciando usuarios...');
    
    try {
        // Verificar autenticação
        const userData = localStorage.getItem('user') || localStorage.getItem('modelai_user');
        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        
        console.log('🔍 Verificando autenticação...');
        console.log('👤 userData:', userData ? 'Existe' : 'Não existe');
        console.log('🔑 token:', token ? 'Existe' : 'Não existe');
        
        if (!userData || !token) {
            console.log('❌ Não autenticado');
            window.location.replace('login.html');
            return;
        }

        currentUser = JSON.parse(userData);
        console.log('👤 Usuário atual:', currentUser.name, 'Role:', currentUser.role);

        if (currentUser.role !== 'admin') {
            console.log('🚫 Não é admin');
            showError('Acesso negado. Apenas administradores.');
            setTimeout(() => window.location.replace('inputs.html'), 2000);
            return;
        }

        console.log('✅ Admin verificado - carregando...');
        
        console.log('📊 Carregando usuários...');
        await window.carregarUsuarios();
        
        console.log('📈 Carregando dashboard...');
        await carregarDashboard();
        
        console.log('🎛️ Configurando event listeners...');
        setupEventListeners();
        
        console.log('🎉 Inicialização completa!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showError('Erro ao inicializar a página: ' + error.message);
    }
});

// API Real para Usuários
class UserAPI {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' ? 
            'http://localhost:3000/api' : 
            '/api'; // URL relativa para Vercel
        this.token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        console.log('🔗 UserAPI Base URL:', this.baseURL);
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    ...options.headers
                },
                ...options
            };

            console.log(`🔗 ${options.method || 'GET'}: ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erro ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Erro na API:', error);
            throw error;
        }
    }

    async getUsers() {
        return this.request('/users');
    }

    async createUser(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async updateUserStatus(userId, isActive) {
        return this.request(`/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }
}

const userAPI = new UserAPI();

// Carregar usuários
window.carregarUsuarios = async function() {
    console.log('📊 Carregando usuários...');
    console.log('🔗 userAPI disponível:', !!userAPI);
    
    showLoading(true);
    
    try {
        console.log('🔄 Fazendo chamada para userAPI.getUsers()...');
        const response = await userAPI.getUsers();
        console.log('📥 Resposta recebida:', response);
        
        allUsers = response.users || [];
        
        console.log('✅ Usuários carregados:', allUsers.length);
        console.log('👥 Lista de usuários:', allUsers);
        
        console.log('🎨 Renderizando usuários...');
        renderUsuarios(allUsers);
        
        console.log('📊 Atualizando estatísticas...');
        updateStats();
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        console.error('❌ Stack trace:', error.stack);
        showError('Erro ao carregar usuários: ' + error.message);
    } finally {
        console.log('🏁 Finalizando carregamento...');
        showLoading(false);
    }
}

// Renderizar usuários na tabela
function renderUsuarios(usuarios) {
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) return;

    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usuarios.map(user => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <i class="fas ${user.role === 'admin' ? 'fa-crown text-yellow-600' : 'fa-user text-teal-600'}"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${user.name}</div>
                        <div class="text-sm text-gray-500">${user.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">${user.company || 'Não informado'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                }">
                    ${user.role === 'admin' ? 'Administrador' : 'Usuário'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }">
                    ${user.isActive !== false ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editUser('${user._id}')" 
                            class="text-blue-600 hover:text-blue-900 transition-colors" 
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleUserStatus('${user._id}', ${user.isActive !== false})" 
                            class="text-${user.isActive !== false ? 'red' : 'green'}-600 hover:text-${user.isActive !== false ? 'red' : 'green'}-900 transition-colors" 
                            title="${user.isActive !== false ? 'Desativar' : 'Ativar'}">
                        <i class="fas fa-${user.isActive !== false ? 'user-slash' : 'user-check'}"></i>
                    </button>
                    ${user.role !== 'admin' || user.email !== 'administrador@modelai.com' ? `
                        <button onclick="deleteUser('${user._id}', '${user.name}')" 
                                class="text-red-600 hover:text-red-900 transition-colors" 
                                title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Carregar dashboard
async function carregarDashboard() {
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive !== false).length;
    const adminUsers = allUsers.filter(u => u.role === 'admin').length;
    const recentUsers = allUsers.filter(u => {
        const created = new Date(u.createdAt);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return created > oneWeekAgo;
    }).length;

    // Atualizar cards
    const elements = {
        totalUsuarios: document.getElementById('totalUsuarios'),
        usuariosAtivos: document.getElementById('usuariosAtivos'),
        administradores: document.getElementById('administradores'),
        novosUsuarios: document.getElementById('novosUsuarios')
    };

    if (elements.totalUsuarios) elements.totalUsuarios.textContent = totalUsers;
    if (elements.usuariosAtivos) elements.usuariosAtivos.textContent = activeUsers;
    if (elements.administradores) elements.administradores.textContent = adminUsers;
    if (elements.novosUsuarios) elements.novosUsuarios.textContent = recentUsers;

    console.log('📊 Dashboard atualizado:', {totalUsers, activeUsers, adminUsers, recentUsers});
}

// Event listeners
function setupEventListeners() {
    console.log('🎛️ Configurando event listeners...');
    
    // Modal novo usuário
    const btnNovoUsuario = document.getElementById('btnNovoUsuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔵 Botão Novo Usuário clicado!');
            window.abrirModalNovoUsuario();
        });
        console.log('✅ Event listener do botão configurado!');
    } else {
        console.error('❌ Botão btnNovoUsuario não encontrado!');
    }

    // Fechar modal
    const btnFecharModal = document.getElementById('fecharModal');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', window.fecharModalNovoUsuario);
    }

    // Form novo usuário
    const formNovoUsuario = document.getElementById('formNovoUsuario');
    if (formNovoUsuario) {
        formNovoUsuario.addEventListener('submit', window.criarUsuario);
        console.log('✅ Event listener do form configurado!');
    } else {
        console.error('❌ Form não encontrado!');
    }

    // Pesquisa
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(filtrarUsuarios, 300);
        });
    }

    // Filtro status
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', filtrarUsuarios);
    }
}

// Modal functions
function abrirModalNovoUsuario() {
    console.log('🔄 Tentando abrir modal...');
    
    const modal = document.getElementById('modalNovoUsuario');
    const form = document.getElementById('formNovoUsuario');
    
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        alert('Erro: Modal não encontrado no DOM');
        return;
    }
    
    if (!form) {
        console.error('❌ Form não encontrado!');
        alert('Erro: Formulário não encontrado no DOM');
        return;
    }
    
    console.log('✅ Modal e form encontrados, abrindo...');
    modal.classList.remove('hidden');
    form.reset();
    console.log('✅ Modal aberto com sucesso!');
}

function fecharModalNovoUsuario() {
    const modal = document.getElementById('modalNovoUsuario');
    const form = document.getElementById('formNovoUsuario');
    
    modal.classList.add('hidden');
    form.reset();
    
    // Resetar estado de edição
    form.removeAttribute('data-editing');
    document.querySelector('#modalNovoUsuario h3').textContent = 'Criar Novo Usuário';
    document.getElementById('novaSenha').setAttribute('required', '');
}

// Criar ou editar usuário
window.criarUsuario = async function(e) {
    console.log('🚀 Função criarUsuario chamada!');
    e.preventDefault();
    
    const form = e.target;
    console.log('📝 Form:', form);
    
    const editingId = form.getAttribute('data-editing');
    const isEditing = !!editingId;

    console.log('📋 Coletando dados do formulário...');
    const formData = new FormData(form);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        role: formData.get('role') || 'user'
    };

    console.log('📊 Dados coletados:', userData);

    // Só incluir senha se não estiver editando ou se foi preenchida
    const password = formData.get('password');
    if (!isEditing && !password) {
        console.error('❌ Senha obrigatória para novos usuários');
        showError('Senha é obrigatória para novos usuários');
        return;
    }
    if (password) {
        userData.password = password;
        console.log('🔑 Senha adicionada aos dados');
    }

    console.log(isEditing ? '✏️ Editando usuário:' : '👤 Criando usuário:', userData.email);

    try {
        console.log('⏳ Mostrando loading...');
        showLoading(true);
        
        if (isEditing) {
            console.log('📝 Chamando updateUser...');
            await userAPI.updateUser(editingId, userData);
            showSuccess('Usuário atualizado com sucesso!');
        } else {
            console.log('➕ Chamando createUser...');
            console.log('🔗 userAPI:', userAPI);
            await userAPI.createUser(userData);
            showSuccess('Usuário criado com sucesso!');
        }
        
        console.log('✅ Operação bem-sucedida, fechando modal...');
        fecharModalNovoUsuario();
        
        console.log('🔄 Recarregando lista de usuários...');
        await carregarUsuarios();
        
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error);
        showError('Erro ao salvar usuário: ' + error.message);
    } finally {
        console.log('🏁 Escondendo loading...');
        showLoading(false);
    }
}

// Editar usuário
async function editUser(userId) {
    try {
        const user = allUsers.find(u => u._id === userId);
        if (!user) {
            showError('Usuário não encontrado');
            return;
        }

        // Preencher modal com dados existentes
        document.getElementById('novoNome').value = user.name;
        document.getElementById('novoEmail').value = user.email;
        document.getElementById('novaEmpresa').value = user.company || '';
        document.getElementById('novoRole').value = user.role;
        document.getElementById('novaSenha').value = '';
        document.getElementById('novaSenha').removeAttribute('required');

        // Mudar título do modal
        document.querySelector('#modalNovoUsuario h3').textContent = 'Editar Usuário';
        
        // Alterar comportamento do form
        const form = document.getElementById('formNovoUsuario');
        form.setAttribute('data-editing', userId);
        
        abrirModalNovoUsuario();

    } catch (error) {
        console.error('❌ Erro ao editar usuário:', error);
        showError('Erro ao carregar dados do usuário');
    }
}

// Toggle status do usuário
async function toggleUserStatus(userId, currentStatus) {
    const newStatus = !currentStatus;
    const action = newStatus ? 'ativar' : 'desativar';
    
    const confirmed = await confirmDialog(
        `Tem certeza que deseja ${action} este usuário?`,
        `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`
    );
    
    if (!confirmed) return;

    try {
        showLoading(true);
        await userAPI.updateUserStatus(userId, newStatus);
        
        showSuccess(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
        await carregarUsuarios();
        
    } catch (error) {
        console.error('❌ Erro ao alterar status:', error);
        showError('Erro ao alterar status: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Excluir usuário
async function deleteUser(userId, userName) {
    const confirmed = await confirmDialog(
        `Tem certeza que deseja excluir o usuário "${userName}"?\n\nEsta ação não pode ser desfeita.`,
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;

    try {
        showLoading(true);
        await userAPI.deleteUser(userId);
        
        showSuccess('Usuário excluído com sucesso!');
        await carregarUsuarios();
        
    } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        showError('Erro ao excluir usuário: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Filtrar usuários
function filtrarUsuarios() {
    const search = document.getElementById('searchUsers').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    
    let filtered = allUsers;
    
    if (search) {
        filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            (user.company && user.company.toLowerCase().includes(search))
        );
    }
    
    if (status) {
        filtered = filtered.filter(user => {
            if (status === 'active') return user.isActive !== false;
            if (status === 'inactive') return user.isActive === false;
            if (status === 'admin') return user.role === 'admin';
            if (status === 'user') return user.role === 'user';
            return true;
        });
    }
    
    renderUsuarios(filtered);
    console.log('🔍 Filtro aplicado:', filtered.length, 'usuários');
}

// Atualizar estatísticas
function updateStats() {
    const total = allUsers.length;
    const active = allUsers.filter(u => u.isActive !== false).length;
    
    document.getElementById('userCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
}

// UTILITÁRIOS DE UI
function showSuccess(message) {
    console.log('✅', message);
    alert('✅ ' + message);
}

function showError(message) {
    console.error('❌', message);
    alert('❌ ' + message);
}

function showLoading(show) {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function confirmDialog(message, title = 'Confirmar') {
    return new Promise(resolve => {
        const confirmed = confirm(`${title}\n\n${message}`);
        resolve(confirmed);
    });
}

// Exportar para uso global
window.carregarUsuarios = carregarUsuarios;
window.criarUsuario = criarUsuario;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.abrirModalNovoUsuario = abrirModalNovoUsuario;
window.fecharModalNovoUsuario = fecharModalNovoUsuario;

console.log('👑 USUARIOS.JS - Sistema Real Configurado!');
