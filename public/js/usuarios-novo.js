// USUARIOS.JS - VERSÃO SIMPLIFICADA E FUNCIONAL



// Variáveis globais
let usuarios = [];
let inicializacaoRealizada = false;
let carregandoUsuarios = false;

// Função para carregar usuários
window.carregarUsuarios = async function() {
    
    
    if (carregandoUsuarios) {
        
        return;
    }
    
    carregandoUsuarios = true;
    
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            usuarios = data.users || [];
            
            
            renderizarUsuarios();
            atualizarEstatisticas();
        } else {
            const erro = await response.text();
            console.error('Erro da API:', erro);
            showError('Erro ao carregar usuários');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão');
    } finally {
        carregandoUsuarios = false;
    }
};

// Função para renderizar usuários
function renderizarUsuarios() {
    
    
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) {
        console.error('Tabela não encontrada!');
        return;
    }
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray-500 p-8">
                    <div class="flex flex-col items-center gap-3">
                        <i class="fas fa-users text-4xl mb-4"></i>
                        <p>Nenhum usuário encontrado</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Inicializar com todos os usuários e aplicar filtros
    usuariosFiltrados = usuarios;
    filtrarUsuarios();
    
    
}

// Função para atualizar estatísticas
function atualizarEstatisticas() {
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.active !== false).length;
    const admins = usuarios.filter(u => u.role === 'admin').length;
    
    document.getElementById('totalUsuarios').textContent = total;
    document.getElementById('usuariosAtivos').textContent = ativos;
    document.getElementById('novosUsuarios').textContent = admins;
}

// Função para editar usuário
window.editarUsuario = function(userId) {
    
    
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        showError('Usuário não encontrado.');
        return;
    }
    
    // Preencher modal
    document.getElementById('editarUsuarioId').value = usuario._id;
    document.getElementById('editarNome').value = usuario.name;
    document.getElementById('editarEmail').value = usuario.email;
    document.getElementById('editarEmpresa').value = usuario.company || '';
    document.getElementById('editarRole').value = usuario.role;
    document.getElementById('editarStatus').value = usuario.active !== false ? 'true' : 'false';
    
    // Abrir modal
    document.getElementById('modalEditarUsuario').classList.remove('hidden');
    showInfo(`Editando usuário: ${usuario.name}`);
};

// Função para fechar modal editar
window.fecharModalEditarUsuario = function() {
    document.getElementById('modalEditarUsuario').classList.add('hidden');
};

// Função para salvar edição
window.salvarEdicaoUsuario = async function(event) {
    
    if (event) event.preventDefault();
    
    
    const userId = document.getElementById('editarUsuarioId').value;
    
    
    if (!userId) {
        showError('ID do usuário não encontrado.');
        return;
    }
    
    const dadosAtualizacao = {
        name: document.getElementById('editarNome').value,
        email: document.getElementById('editarEmail').value,
        company: document.getElementById('editarEmpresa').value,
        role: document.getElementById('editarRole').value,
        active: document.getElementById('editarStatus').value === 'true'
    };
    
    
    
    // Validação básica
    if (!dadosAtualizacao.name || !dadosAtualizacao.email) {
        showError('Nome e email são obrigatórios.');
        return;
    }
    
    const novaSenha = document.getElementById('editarSenha').value;
    if (novaSenha && novaSenha.trim()) {
        dadosAtualizacao.password = novaSenha.trim();
        
    }
    
    try {
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dadosAtualizacao)
        });
        
        
        
        if (response.ok) {
            const resultado = await response.json();
            
            showSuccess(`Usuário "${dadosAtualizacao.name}" atualizado com sucesso!`);
            window.fecharModalEditarUsuario();
            await window.carregarUsuarios();
        } else {
            const erro = await response.json();
            console.error('Erro da API:', erro);
            showError(`Erro ao atualizar: ${erro.message}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        showError('Erro de conexão ao atualizar usuário.');
    }
};

// Função para toggle usuário
window.toggleUsuario = async function(userId) {
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        showError('Usuário não encontrado.');
        return;
    }
    
    const novoStatus = !usuario.active;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ active: novoStatus })
        });
        
        if (response.ok) {
            showSuccess(`Usuário "${usuario.name}" ${acao}do com sucesso!`);
            await window.carregarUsuarios();
        } else {
            const erro = await response.text();
            try {
                const erroJson = JSON.parse(erro);
                showError(`Erro ao ${acao} usuário: ${erroJson.message}`);
            } catch {
                showError(`Erro ao ${acao} usuário: ${response.status} - ${erro}`);
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        showError(`Erro de conexão ao ${acao} usuário.`);
    }
};

// Função para deletar usuário
window.deletarUsuario = async function(userId) {
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        showError('Usuário não encontrado.');
        return;
    }
    
    try {
        const confirmar = await confirmDelete(
            `Tem certeza que deseja excluir este usuário? Todos os dados associados serão permanentemente removidos.`,
            'Excluir Usuário',
            `${usuario.name} (${usuario.email})`
        );
        
        if (!confirmar) {
            showInfo('Exclusão cancelada.');
            return;
        }
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showSuccess('Usuário excluído com sucesso!');
            await window.carregarUsuarios();
        } else {
            const erro = await response.json();
            showError(`Erro ao excluir: ${erro.message}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão ao excluir usuário.');
    }
};

// Função de logout
window.logout = async function() {
    try {
        const confirmar = await confirmAction(
            'Deseja realmente sair do sistema? Você precisará fazer login novamente para acessar o sistema.',
            'Confirmar Logout'
        );
        
        if (confirmar) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('currentInputs');
            localStorage.removeItem('scenarios');
            
            showInfo('Logout realizado com sucesso. Redirecionando...');
            setTimeout(() => window.location.href = '/login.html', 1000);
        } else {
            showInfo('Logout cancelado.');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao exibir confirmação.');
    }
};

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async function() {
    
    
    if (inicializacaoRealizada) {
        
        return;
    }
    inicializacaoRealizada = true;
    
    try {
        // Verificar token
        const token = localStorage.getItem('token');
        if (!token) {
            showError('Você precisa fazer login primeiro!');
            setTimeout(() => window.location.href = '/login.html', 2000);
            return;
        }
        
        
        
        // Carregar usuários
        await window.carregarUsuarios();
        
        // Event listeners para o modal
        setupModalEventListeners();
        
        // Inicializar filtros
        inicializarFiltros();
        
        
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Erro ao inicializar: ' + error.message);
    }
});

// Configurar event listeners do modal
function setupModalEventListeners() {
    
    
    // Botão Novo Usuário
    const btnNovoUsuario = document.getElementById('btnNovoUsuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener('click', abrirModalNovoUsuario);
        
    }
    
    // Form de novo usuário
    const formNovoUsuario = document.getElementById('formNovoUsuario');
    if (formNovoUsuario) {
        formNovoUsuario.addEventListener('submit', criarNovoUsuario);
        
    }
    
    // Modal - fechar clicando fora
    const modalNovoUsuario = document.getElementById('modalNovoUsuario');
    if (modalNovoUsuario) {
        modalNovoUsuario.addEventListener('click', function(e) {
            if (e.target === modalNovoUsuario) {
                fecharModalNovoUsuario();
            }
        });
        
    }
}

// Abrir modal de novo usuário
function abrirModalNovoUsuario() {
    
    const modal = document.getElementById('modalNovoUsuario');
    if (modal) {
        modal.classList.remove('hidden');
        // Limpar form
        document.getElementById('formNovoUsuario').reset();
    }
}

// Fechar modal de novo usuário
window.fecharModalNovoUsuario = function() {
    
    const modal = document.getElementById('modalNovoUsuario');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Criar novo usuário
async function criarNovoUsuario(event) {
    event.preventDefault();
    
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        company: formData.get('company') || '',
        role: formData.get('role') || 'user'
    };
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess('Usuário criado com sucesso!');
            fecharModalNovoUsuario();
            // Recarregar lista de usuários
            await carregarUsuarios();
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao criar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão');
    }
}

// Fechar modal de editar usuário
window.fecharModalEditarUsuario = function() {
    
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Salvar edição de usuário
window.salvarEdicaoUsuario = async function(event) {
    event.preventDefault();
    
    
    const userId = document.getElementById('editarUsuarioId').value;
    const userData = {
        name: document.getElementById('editarNome').value,
        email: document.getElementById('editarEmail').value,
        company: document.getElementById('editarEmpresa').value,
        role: document.getElementById('editarRole').value,
        active: document.getElementById('editarStatus').value === 'true'
    };
    
    // Só incluir senha se foi preenchida
    const senha = document.getElementById('editarSenha').value;
    if (senha) {
        userData.password = senha;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showSuccess('Usuário atualizado com sucesso!');
            fecharModalEditarUsuario();
            // Recarregar lista de usuários
            await carregarUsuarios();
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao atualizar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão');
    }
};

// Variáveis para filtros
let usuariosFiltrados = [];

// Função para filtrar usuários
function filtrarUsuarios() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const roleFilter = document.getElementById('filterRole').value;
    
    usuariosFiltrados = usuarios.filter(usuario => {
        // Filtro de busca por nome ou email
        const matchesSearch = !searchTerm || 
            usuario.name.toLowerCase().includes(searchTerm) ||
            usuario.email.toLowerCase().includes(searchTerm) ||
            (usuario.company && usuario.company.toLowerCase().includes(searchTerm));
        
        // Filtro de status
        const matchesStatus = !statusFilter || 
            (statusFilter === 'active' && usuario.active !== false) ||
            (statusFilter === 'inactive' && usuario.active === false);
        
        // Filtro de role
        const matchesRole = !roleFilter || usuario.role === roleFilter;
        
        return matchesSearch && matchesStatus && matchesRole;
    });
    
    renderizarUsuariosFiltrados();
}

// Função para renderizar usuários filtrados
function renderizarUsuariosFiltrados() {
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) {
        console.error('Tabela não encontrada!');
        return;
    }
    
    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray-500 p-8">
                    <div class="flex flex-col items-center gap-3">
                        <i class="fas fa-search text-2xl text-gray-400"></i>
                        <span>Nenhum usuário encontrado com os filtros aplicados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = usuariosFiltrados.map(usuario => {
        const status = usuario.active !== false ? 
            '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>' : 
            '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inativo</span>';
            
        const role = usuario.role === 'admin' ? 
            '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Admin</span>' :
            '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Usuário</span>';
            
        const ultimoLogin = usuario.lastLogin ? 
            new Date(usuario.lastLogin).toLocaleDateString('pt-BR') : 
            'Nunca';
            
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-teal-600 font-semibold">
                                ${usuario.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${usuario.name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${usuario.email}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${usuario.company || '-'}</td>
                <td class="px-6 py-4">${role}</td>
                <td class="px-6 py-4">${status}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${ultimoLogin}</td>
                <td class="px-6 py-4 text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="editarUsuario('${usuario._id}')" class="text-blue-600 hover:text-blue-900 px-2 py-1 rounded">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="toggleUsuario('${usuario._id}')" class="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded">
                            <i class="fas fa-toggle-${usuario.active !== false ? 'on' : 'off'}"></i> ${usuario.active !== false ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onclick="deletarUsuario('${usuario._id}')" class="text-red-600 hover:text-red-900 px-2 py-1 rounded">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Inicializar event listeners para filtros
function inicializarFiltros() {
    const searchInput = document.getElementById('searchUsers');
    const statusFilter = document.getElementById('filterStatus');
    const roleFilter = document.getElementById('filterRole');
    
    if (searchInput) {
        searchInput.addEventListener('input', filtrarUsuarios);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filtrarUsuarios);
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', filtrarUsuarios);
    }
}


