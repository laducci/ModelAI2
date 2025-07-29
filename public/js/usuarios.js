// USUARIOS.JS - VERSÃO COMPLETA E FUNCIONAL
console.log('🚀 USUARIOS.JS - Iniciando versão completa...');

// Variáveis globais
let usuarios = [];
let usuarioAtual = null;

//===============================
// FUNÇÕES DE MODAL
//===============================

// Função para abrir modal novo usuário
window.abrirModalNovoUsuario = function() {
    console.log('🔵 abrirModalNovoUsuario chamada!');
    
    const modal = document.getElementById('modalNovoUsuario');
    if (!modal) {
        console.error('❌ Modal modalNovoUsuario não encontrado!');
        showError('Erro: Modal não encontrado');
        return;
    }
    
    console.log('✅ Modal encontrado, abrindo...');
    modal.classList.remove('hidden');
    
    // Limpar formulário
    const form = document.getElementById('formNovoUsuario');
    if (form) {
        form.reset();
    }
    
    console.log('✅ Modal aberto com sucesso!');
};

// Função para fechar modal novo usuário
window.fecharModalNovoUsuario = function() {
    console.log('🔄 fecharModalNovoUsuario chamada!');
    
    const modal = document.getElementById('modalNovoUsuario');
    if (modal) {
        modal.classList.add('hidden');
        console.log('✅ Modal fechado!');
    }
};

// Função para abrir modal editar usuário
window.editarUsuario = function(userId) {
    console.log('✏️ === EDITANDO USUÁRIO ===');
    console.log('🆔 User ID:', userId);
    
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        showError('Usuário não encontrado.');
        return;
    }
    
    console.log('👤 Usuário encontrado:', usuario);
    
    // Preencher o modal com os dados
    document.getElementById('editarUsuarioId').value = usuario._id;
    document.getElementById('editarNome').value = usuario.name;
    document.getElementById('editarEmail').value = usuario.email;
    document.getElementById('editarEmpresa').value = usuario.company || '';
    document.getElementById('editarRole').value = usuario.role;
    document.getElementById('editarStatus').value = usuario.active !== false ? 'true' : 'false';
    
    // Abrir modal
    const modal = document.getElementById('modalEditarUsuario');
    modal.classList.remove('hidden');
    
    showInfo(`Editando usuário: ${usuario.name}`);
};

// Função para fechar modal editar usuário
window.fecharModalEditarUsuario = function() {
    const modal = document.getElementById('modalEditarUsuario');
    modal.classList.add('hidden');
};

//===============================
// FUNÇÕES DE CRUD
//===============================

// Função para criar usuário
window.criarUsuario = async function(event) {
    console.log('📝 criarUsuario chamada!');
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
    
    // Validação simples
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
            const resultado = await response.json();
            console.log('✅ Usuário criado:', resultado);
            
            showSuccess('Usuário criado com sucesso!');
            window.fecharModalNovoUsuario();
            
            // Recarregar lista
            await window.carregarUsuarios();
            
        } else {
            const erro = await response.json();
            console.error('❌ Erro da API:', erro);
            showError(`Erro: ${erro.message || 'Erro ao criar usuário'}`);
        }
        
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        showError('Erro de conexão. Verifique sua internet.');
    }
};

// Função para salvar edição do usuário
window.salvarEdicaoUsuario = async function(event) {
    event.preventDefault();
    
    const userId = document.getElementById('editarUsuarioId').value;
    const dadosAtualizacao = {
        name: document.getElementById('editarNome').value,
        email: document.getElementById('editarEmail').value,
        company: document.getElementById('editarEmpresa').value,
        role: document.getElementById('editarRole').value,
        active: document.getElementById('editarStatus').value === 'true'
    };
    
    // Só incluir senha se foi preenchida
    const novaSenha = document.getElementById('editarSenha').value;
    if (novaSenha.trim()) {
        dadosAtualizacao.password = novaSenha;
    }
    
    console.log('💾 Salvando usuário:', userId, dadosAtualizacao);
    
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
            console.log('✅ Usuário atualizado:', resultado);
            
            showSuccess(`Usuário "${dadosAtualizacao.name}" atualizado com sucesso!`);
            window.fecharModalEditarUsuario();
            await window.carregarUsuarios();
            
        } else {
            const erro = await response.json();
            console.error('❌ Erro ao atualizar:', erro);
            showError(`Erro ao atualizar: ${erro.message}`);
        }
        
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        showError('Erro de conexão ao atualizar usuário.');
    }
};

// Função para deletar usuário
window.deletarUsuario = function(userId) {
    console.log('🗑️ === DELETANDO USUÁRIO ===');
    console.log('🆔 User ID:', userId);
    
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        showError('Usuário não encontrado.');
        return;
    }
    
    // Confirmação personalizada usando alertas do sistema
    const confirmar = confirm(`⚠️ ATENÇÃO!\n\nDeseja realmente EXCLUIR o usuário "${usuario.name}"?\n\n📧 Email: ${usuario.email}\n👤 Role: ${usuario.role}\n\n⚠️ Esta ação NÃO pode ser desfeita!\n\nClique OK para confirmar a exclusão.`);
    
    if (!confirmar) {
        showInfo('Exclusão cancelada pelo usuário.');
        return;
    }
    
    // Prosseguir com a exclusão
    window.confirmarDelecaoUsuario(userId);
};

// Função para confirmar deleção
window.confirmarDelecaoUsuario = async function(userId) {
    try {
        console.log('🔥 Executando deleção do usuário:', userId);
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('✅ Usuário deletado:', resultado);
            
            showSuccess('Usuário excluído com sucesso!');
            await window.carregarUsuarios();
            
        } else {
            const erro = await response.json();
            console.error('❌ Erro ao deletar:', erro);
            showError(`Erro ao excluir: ${erro.message}`);
        }
        
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        showError('Erro de conexão ao excluir usuário.');
    }
};

// Função para toggle status do usuário
window.toggleUsuario = async function(userId) {
    console.log('🔄 === TOGGLE USUÁRIO ===');
    console.log('🆔 User ID:', userId);
    
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        showError('Usuário não encontrado.');
        return;
    }
    
    const novoStatus = !usuario.active;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    console.log(`🔄 ${acao} usuário:`, usuario.name);
    console.log('📊 Status atual:', usuario.active);
    console.log('📊 Novo status:', novoStatus);
    console.log('📦 Enviando body:', { active: novoStatus });
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ active: novoStatus })
        });
        
        console.log('📈 Status da resposta:', response.status);
        
        if (response.ok) {
            const resultado = await response.json();
            console.log(`✅ Usuário ${acao}do com sucesso:`, resultado);
            showSuccess(`Usuário "${usuario.name}" ${acao}do com sucesso!`);
            await window.carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error(`❌ Erro ao ${acao} (text):`, erro);
            
            try {
                const erroJson = JSON.parse(erro);
                showError(`Erro ao ${acao} usuário: ${erroJson.message}`);
            } catch {
                showError(`Erro ao ${acao} usuário: ${response.status} - ${erro}`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Erro de rede ao ${acao}:`, error);
        showError(`Erro de conexão ao ${acao} usuário.`);
    }
};

//===============================
// LOGOUT COM ALERTAS PADRONIZADOS
//===============================

// Função de logout padronizada
window.logout = function() {
    console.log('🚪 === LOGOUT SOLICITADO ===');
    
    // Usar o sistema de alertas padronizado em vez de confirm()
    const confirmar = confirm('🚪 Deseja realmente sair do sistema?\n\nVocê precisará fazer login novamente para acessar o sistema.');
    
    if (confirmar) {
        console.log('✅ Logout confirmado');
        
        // Limpar dados de autenticação
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentInputs');
        localStorage.removeItem('scenarios');
        
        showInfo('Logout realizado com sucesso. Redirecionando...');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
        
    } else {
        console.log('❌ Logout cancelado');
        showInfo('Logout cancelado.');
    }
};

//===============================
// FUNÇÕES DE CARREGAMENTO
//===============================

// Função para carregar usuários
window.carregarUsuarios = async function() {
    console.log('📋 carregarUsuarios chamada!');
    
    try {
        console.log('📡 Buscando usuários da API...');
        
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        console.log('📈 Resposta da API:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            usuarios = data.users || [];
            console.log('✅ Usuários carregados:', usuarios.length);
            
            window.renderizarUsuarios();
            window.atualizarEstatisticas();
            
        } else {
            const erro = await response.text();
            console.error('❌ Erro da API:', erro);
            showError('Erro ao carregar usuários');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        showError('Erro de conexão ao carregar usuários');
    }
};

// Função para renderizar usuários na tabela
window.renderizarUsuarios = function() {
    console.log('🎨 Renderizando usuários...');
    
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
    
    console.log('✅ Usuários renderizados!');
};

// Função para atualizar estatísticas
window.atualizarEstatisticas = function() {
    console.log('📊 Atualizando estatísticas...');
    
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.active !== false).length;
    const admins = usuarios.filter(u => u.role === 'admin').length;
    
    document.getElementById('totalUsuarios').textContent = total;
    document.getElementById('usuariosAtivos').textContent = ativos;
    document.getElementById('novosUsuarios').textContent = admins;
    
    console.log('✅ Estatísticas atualizadas:', { total, ativos, admins });
};

//===============================
// INICIALIZAÇÃO
//===============================

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM carregado, inicializando usuários...');
    console.log('🔍 Verificando dependências...');
    
    // Verificar se as funções de alerta estão disponíveis
    if (typeof showSuccess === 'undefined') {
        console.error('❌ showSuccess não definida - alerts.js não carregado!');
        window.showSuccess = (msg) => alert('✅ ' + msg);
        window.showError = (msg) => alert('❌ ' + msg);
        window.showInfo = (msg) => alert('ℹ️ ' + msg);
    } else {
        console.log('✅ Sistema de alertas carregado');
    }
    
    try {
        // Configurar botão novo usuário
        const btnNovoUsuario = document.getElementById('btnNovoUsuario');
        if (btnNovoUsuario) {
            // Remover event listeners antigos
            btnNovoUsuario.removeEventListener('click', window.abrirModalNovoUsuario);
            btnNovoUsuario.addEventListener('click', window.abrirModalNovoUsuario);
            console.log('✅ Botão novo usuário configurado!');
        } else {
            console.error('❌ Botão btnNovoUsuario não encontrado!');
        }
        
        // Configurar form novo usuário
        const form = document.getElementById('formNovoUsuario');
        if (form) {
            form.removeEventListener('submit', window.criarUsuario);
            form.addEventListener('submit', window.criarUsuario);
            console.log('✅ Form novo usuário configurado!');
        } else {
            console.error('❌ Form formNovoUsuario não encontrado!');
        }
        
        // Configurar form editar usuário
        const formEditar = document.getElementById('formEditarUsuario');
        if (formEditar) {
            formEditar.removeEventListener('submit', window.salvarEdicaoUsuario);
            formEditar.addEventListener('submit', window.salvarEdicaoUsuario);
            console.log('✅ Form editar usuário configurado!');
        } else {
            console.error('❌ Form formEditarUsuario não encontrado!');
        }
        
        // Verificar token de autenticação
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token não encontrado - redirecionando para login');
            showError('Você precisa fazer login primeiro!');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
        
        // Carregar usuários
        console.log('📋 Carregando usuários...');
        await window.carregarUsuarios();
        
        console.log('🎉 Inicialização completa!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showError('Erro ao inicializar a página: ' + error.message);
    }
});

console.log('✅ usuarios.js carregado - Funções definidas globalmente!');
