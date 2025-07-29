// ==============================================
// SISTEMA DE GERENCIAMENTO DE USUÁRIOS - VERSÃO FINAL
// ==============================================

console.log('🚀 Carregando sistema de usuários...');

// Variáveis globais
let usuarios = [];
let usuarioEditando = null;

// Funções de alerta fallback se não estiverem carregadas
if (typeof showSuccess === 'undefined') {
    window.showSuccess = (msg) => {
        console.log('✅ SUCCESS:', msg);
        alert('✅ ' + msg);
    };
}

if (typeof showError === 'undefined') {
    window.showError = (msg) => {
        console.error('❌ ERROR:', msg);
        alert('❌ ' + msg);
    };
}

if (typeof showInfo === 'undefined') {
    window.showInfo = (msg) => {
        console.log('ℹ️ INFO:', msg);
        alert('ℹ️ ' + msg);
    };
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌟 DOM carregado - Inicializando sistema de usuários...');
    
    try {
        // Verificar autenticação
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token não encontrado');
            showError('Você precisa fazer login primeiro!');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
        
        // Configurar eventos
        await configurarEventos();
        
        // Carregar usuários
        await carregarUsuarios();
        
        console.log('🎉 Sistema inicializado com sucesso!');
        
    } catch (error) {
        console.error('💥 Erro na inicialização:', error);
        showError('Erro ao inicializar o sistema: ' + error.message);
    }
});

// ==============================================
// CONFIGURAÇÃO DE EVENTOS
// ==============================================

async function configurarEventos() {
    console.log('⚙️ Configurando eventos...');
    
    // Botão Novo Usuário
    const btnNovoUsuario = document.getElementById('btnNovoUsuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener('click', abrirModalNovoUsuario);
        console.log('✅ Evento botão novo usuário configurado');
    } else {
        console.error('❌ Botão btnNovoUsuario não encontrado');
    }
    
    // Form Novo Usuário
    const formNovoUsuario = document.getElementById('formNovoUsuario');
    if (formNovoUsuario) {
        formNovoUsuario.addEventListener('submit', criarUsuario);
        console.log('✅ Evento form novo usuário configurado');
    } else {
        console.error('❌ Form formNovoUsuario não encontrado');
    }
    
    // Form Editar Usuário
    const formEditarUsuario = document.getElementById('formEditarUsuario');
    if (formEditarUsuario) {
        formEditarUsuario.addEventListener('submit', salvarEdicaoUsuario);
        console.log('✅ Evento form editar usuário configurado');
    } else {
        console.error('❌ Form formEditarUsuario não encontrado');
    }
    
    // Fechar modais ao clicar fora
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            fecharModais();
        }
    });
    
    console.log('✅ Todos os eventos configurados');
}

// ==============================================
// CARREGAR USUÁRIOS
// ==============================================

async function carregarUsuarios() {
    console.log('📋 Carregando usuários da API...');
    
    try {
        const token = localStorage.getItem('token');
        
        console.log('🌐 Fazendo requisição para /api/users...');
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📋 Dados recebidos:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar usuários');
        }
        
        usuarios = data.users || [];
        console.log(`👥 ${usuarios.length} usuários encontrados`);
        
        // Renderizar usuários
        renderizarUsuarios();
        atualizarEstatisticas();
        
        showSuccess(`${usuarios.length} usuários carregados com sucesso!`);
        
    } catch (error) {
        console.error('💥 Erro ao carregar usuários:', error);
        showError('Erro ao carregar usuários: ' + error.message);
        
        // Renderizar tabela vazia
        usuarios = [];
        renderizarUsuarios();
        atualizarEstatisticas();
    }
}

// ==============================================
// RENDERIZAR USUÁRIOS
// ==============================================

function renderizarUsuarios() {
    console.log('🎨 Renderizando usuários na tabela...');
    
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) {
        console.error('❌ Tabela de usuários não encontrada!');
        return;
    }
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray-500 p-8">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>Nenhum usuário encontrado</p>
                    <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
                        🔄 Recarregar
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = usuarios.map(usuario => {
        const status = usuario.active !== false ? 
            '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ Ativo</span>' : 
            '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">❌ Inativo</span>';
            
        const role = usuario.role === 'admin' ? 
            '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">👑 Admin</span>' :
            '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">👤 Usuário</span>';
            
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
                        <button onclick="editarUsuario('${usuario._id}')" class="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="toggleUsuario('${usuario._id}')" class="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded border border-yellow-200 hover:bg-yellow-50">
                            <i class="fas fa-toggle-${usuario.active !== false ? 'on' : 'off'}"></i> ${usuario.active !== false ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onclick="deletarUsuario('${usuario._id}')" class="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-200 hover:bg-red-50">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ ${usuarios.length} usuários renderizados na tabela`);
}

// ==============================================
// ATUALIZAR ESTATÍSTICAS
// ==============================================

function atualizarEstatisticas() {
    const totalElement = document.getElementById('totalUsuarios');
    const ativosElement = document.getElementById('usuariosAtivos');
    const adminsElement = document.getElementById('usuariosAdmins');
    
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.active !== false).length;
    const admins = usuarios.filter(u => u.role === 'admin').length;
    
    if (totalElement) totalElement.textContent = total;
    if (ativosElement) ativosElement.textContent = ativos;
    if (adminsElement) adminsElement.textContent = admins;
    
    console.log(`📊 Estatísticas: ${total} total, ${ativos} ativos, ${admins} admins`);
}

// ==============================================
// MODAL NOVO USUÁRIO
// ==============================================

function abrirModalNovoUsuario() {
    console.log('➕ Abrindo modal novo usuário...');
    
    const modal = document.getElementById('modalNovoUsuario');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Limpar formulário
        const form = document.getElementById('formNovoUsuario');
        if (form) {
            form.reset();
        }
        
        console.log('✅ Modal novo usuário aberto');
    } else {
        console.error('❌ Modal novo usuário não encontrado');
        showError('Erro: Modal não encontrado');
    }
}

function fecharModalNovoUsuario() {
    console.log('❌ Fechando modal novo usuário...');
    
    const modal = document.getElementById('modalNovoUsuario');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        console.log('✅ Modal novo usuário fechado');
    }
}

// ==============================================
// CRIAR USUÁRIO
// ==============================================

async function criarUsuario(event) {
    console.log('📝 Criando novo usuário...');
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const dadosUsuario = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        company: formData.get('company') || '',
        role: formData.get('role') || 'user'
    };
    
    console.log('📊 Dados do usuário:', dadosUsuario);
    
    // Validação
    if (!dadosUsuario.name || !dadosUsuario.email || !dadosUsuario.password) {
        showError('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        console.log('📡 Enviando para API...');
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dadosUsuario)
        });
        
        console.log('📈 Resposta da API:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Usuário criado:', data);
            
            showSuccess('Usuário criado com sucesso!');
            fecharModalNovoUsuario();
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ Erro da API:', erro);
            showError('Erro ao criar usuário: ' + erro);
        }
        
    } catch (error) {
        console.error('💥 Erro ao criar usuário:', error);
        showError('Erro de conexão ao criar usuário');
    }
}

// ==============================================
// EDITAR USUÁRIO
// ==============================================

function editarUsuario(id) {
    console.log('📝 Editando usuário:', id);
    
    const usuario = usuarios.find(u => u._id === id);
    if (!usuario) {
        showError('Usuário não encontrado');
        return;
    }
    
    console.log('👤 Dados do usuário para edição:', usuario);
    
    // Armazenar usuário sendo editado
    usuarioEditando = usuario;
    
    // Preencher formulário
    document.getElementById('editName').value = usuario.name || '';
    document.getElementById('editEmail').value = usuario.email || '';
    document.getElementById('editCompany').value = usuario.company || '';
    document.getElementById('editRole').value = usuario.role || 'user';
    document.getElementById('editActive').checked = usuario.active !== false;
    
    // Abrir modal
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log('✅ Modal editar usuário aberto');
    } else {
        console.error('❌ Modal editar usuário não encontrado');
        showError('Erro: Modal de edição não encontrado');
    }
}

function fecharModalEditarUsuario() {
    console.log('❌ Fechando modal editar usuário...');
    
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        usuarioEditando = null;
        console.log('✅ Modal editar usuário fechado');
    }
}

async function salvarEdicaoUsuario(event) {
    console.log('💾 Salvando edição do usuário...');
    event.preventDefault();
    
    if (!usuarioEditando) {
        showError('Nenhum usuário sendo editado');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    const dadosAtualizados = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company') || '',
        role: formData.get('role') || 'user',
        active: formData.get('active') === 'on'
    };
    
    // Incluir senha se fornecida
    const novaSenha = formData.get('password');
    if (novaSenha && novaSenha.trim()) {
        dadosAtualizados.password = novaSenha;
    }
    
    console.log('📊 Dados atualizados:', dadosAtualizados);
    
    try {
        console.log('📡 Enviando atualização para API...');
        
        const response = await fetch(`/api/users/${usuarioEditando._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dadosAtualizados)
        });
        
        console.log('📈 Resposta da API:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Usuário atualizado:', data);
            
            showSuccess('Usuário atualizado com sucesso!');
            fecharModalEditarUsuario();
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ Erro da API:', erro);
            showError('Erro ao atualizar usuário: ' + erro);
        }
        
    } catch (error) {
        console.error('💥 Erro ao atualizar usuário:', error);
        showError('Erro de conexão ao atualizar usuário');
    }
}

// ==============================================
// TOGGLE USUÁRIO (ATIVAR/DESATIVAR)
// ==============================================

async function toggleUsuario(id) {
    console.log('🔄 Alternando status do usuário:', id);
    
    const usuario = usuarios.find(u => u._id === id);
    if (!usuario) {
        showError('Usuário não encontrado');
        return;
    }
    
    const novoStatus = !usuario.active;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    if (!confirm(`Tem certeza que deseja ${acao} o usuário ${usuario.name}?`)) {
        return;
    }
    
    try {
        console.log(`📡 ${acao} usuário na API...`);
        
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ active: novoStatus })
        });
        
        console.log('📈 Resposta da API:', response.status);
        
        if (response.ok) {
            console.log(`✅ Usuário ${acao} com sucesso`);
            showSuccess(`Usuário ${acao} com sucesso!`);
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ Erro da API:', erro);
            showError(`Erro ao ${acao} usuário: ` + erro);
        }
        
    } catch (error) {
        console.error(`💥 Erro ao ${acao} usuário:`, error);
        showError(`Erro de conexão ao ${acao} usuário`);
    }
}

// ==============================================
// DELETAR USUÁRIO
// ==============================================

async function deletarUsuario(id) {
    console.log('🗑️ Deletando usuário:', id);
    
    const usuario = usuarios.find(u => u._id === id);
    if (!usuario) {
        showError('Usuário não encontrado');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente o usuário ${usuario.name}?\n\nEsta ação NÃO pode ser desfeita!`)) {
        return;
    }
    
    try {
        console.log('📡 Deletando usuário na API...');
        
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        console.log('📈 Resposta da API:', response.status);
        
        if (response.ok) {
            console.log('✅ Usuário deletado com sucesso');
            showSuccess('Usuário excluído com sucesso!');
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ Erro da API:', erro);
            showError('Erro ao excluir usuário: ' + erro);
        }
        
    } catch (error) {
        console.error('💥 Erro ao deletar usuário:', error);
        showError('Erro de conexão ao excluir usuário');
    }
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function fecharModais() {
    fecharModalNovoUsuario();
    fecharModalEditarUsuario();
}

// Expor funções globalmente para os botões inline
window.abrirModalNovoUsuario = abrirModalNovoUsuario;
window.fecharModalNovoUsuario = fecharModalNovoUsuario;
window.criarUsuario = criarUsuario;
window.editarUsuario = editarUsuario;
window.fecharModalEditarUsuario = fecharModalEditarUsuario;
window.salvarEdicaoUsuario = salvarEdicaoUsuario;
window.toggleUsuario = toggleUsuario;
window.deletarUsuario = deletarUsuario;
window.carregarUsuarios = carregarUsuarios;

console.log('✅ Sistema de usuários carregado completamente!');
