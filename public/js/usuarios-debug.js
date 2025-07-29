// ==============================================
// DEBUG - CARREGAMENTO DE USUÁRIOS SIMPLES
// ==============================================

console.log('🔧 DEBUG: Carregando sistema simplificado de usuários...');

// Verificar se estamos na página certa
if (!window.location.pathname.includes('usuarios.html')) {
    console.log('❌ Não estamos na página de usuários, saindo...');
    // return;
}

// Funções de alerta fallback
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

// Variável global para usuários
let usuarios = [];

// Função principal de carregamento
async function carregarUsuarios() {
    console.log('📋 [DEBUG] Iniciando carregamento de usuários...');
    
    try {
        // 1. Verificar token
        const token = localStorage.getItem('token');
        console.log('🔑 [DEBUG] Token:', token ? 'ENCONTRADO (' + token.substring(0, 20) + '...)' : 'NÃO ENCONTRADO');
        
        if (!token) {
            console.error('❌ [DEBUG] Token não encontrado');
            showError('Token não encontrado - faça login primeiro');
            return;
        }

        // 2. Fazer requisição
        console.log('🌐 [DEBUG] Fazendo requisição para /api/users...');
        
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 [DEBUG] Status da resposta:', response.status);
        console.log('📋 [DEBUG] Headers:', Object.fromEntries(response.headers));

        // 3. Verificar resposta
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [DEBUG] Erro na resposta:', response.status, errorText);
            showError(`Erro ${response.status}: ${errorText}`);
            return;
        }

        // 4. Processar dados
        const data = await response.json();
        console.log('📊 [DEBUG] Dados recebidos:', data);

        if (data.success && data.users) {
            usuarios = data.users;
            console.log('✅ [DEBUG] Usuários processados:', usuarios.length);
            
            // 5. Renderizar
            renderizarUsuarios();
            showSuccess(`${usuarios.length} usuários carregados com sucesso!`);
            
        } else {
            console.error('❌ [DEBUG] Dados inválidos:', data);
            showError('Dados inválidos recebidos da API');
        }

    } catch (error) {
        console.error('💥 [DEBUG] Erro no carregamento:', error);
        showError('Erro de conexão: ' + error.message);
    }
}

// Função para renderizar usuários
function renderizarUsuarios() {
    console.log('🎨 [DEBUG] Renderizando usuários...');
    
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) {
        console.error('❌ [DEBUG] Tabela tabelaUsuarios não encontrada!');
        return;
    }

    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray-500 p-8">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>Nenhum usuário encontrado</p>
                    <button onclick="carregarUsuarios()" class="mt-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
                        🔄 Recarregar
                    </button>
                </td>
            </tr>
        `;
        console.log('📝 [DEBUG] Renderizada mensagem de "nenhum usuário"');
        return;
    }

    const html = usuarios.map(usuario => {
        const status = usuario.active ? 
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
                            <i class="fas fa-toggle-${usuario.active ? 'on' : 'off'}"></i> ${usuario.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onclick="deletarUsuario('${usuario._id}')" class="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-200 hover:bg-red-50">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
    console.log(`✅ [DEBUG] ${usuarios.length} usuários renderizados na tabela`);
}

// Configurar botão "Novo Usuário" (se existir)
function configurarBotaoNovo() {
    const btn = document.getElementById('btnNovoUsuario');
    if (btn) {
        btn.addEventListener('click', function() {
            console.log('➕ [DEBUG] Botão Novo Usuário clicado');
            alert('Função de criar usuário ainda não implementada nesta versão debug');
        });
        console.log('✅ [DEBUG] Botão Novo Usuário configurado');
    } else {
        console.log('⚠️ [DEBUG] Botão btnNovoUsuario não encontrado');
    }
}

// Configurar formulário de edição
function configurarFormularioEdicao() {
    const formEditar = document.getElementById('formEditarUsuario');
    if (formEditar) {
        formEditar.addEventListener('submit', window.salvarEdicaoUsuario);
        console.log('✅ [DEBUG] Formulário de edição configurado');
    } else {
        console.log('⚠️ [DEBUG] Formulário formEditarUsuario não encontrado');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 [DEBUG] DOM carregado - iniciando...');
    
    try {
        // Verificar se temos token
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('⚠️ [DEBUG] Sem token - redirecionando para login');
            showError('Você precisa fazer login primeiro!');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }

        // Configurar botões
        configurarBotaoNovo();
        configurarFormularioEdicao();
        
        // Carregar usuários
        await carregarUsuarios();
        
        console.log('🎉 [DEBUG] Inicialização completa!');
        
    } catch (error) {
        console.error('💥 [DEBUG] Erro na inicialização:', error);
        showError('Erro na inicialização: ' + error.message);
    }
});

// Expor função globalmente para botões
window.carregarUsuarios = carregarUsuarios;

//===============================
// FUNÇÕES DOS BOTÕES
//===============================

// Função para editar usuário
window.editarUsuario = function(id) {
    console.log('✏️ [DEBUG] Editando usuário:', id);
    
    const usuario = usuarios.find(u => u._id === id);
    if (!usuario) {
        showError('Usuário não encontrado');
        return;
    }
    
    console.log('👤 [DEBUG] Dados do usuário para edição:', usuario);
    
    // Preencher formulário do modal
    document.getElementById('editName').value = usuario.name || '';
    document.getElementById('editEmail').value = usuario.email || '';
    document.getElementById('editCompany').value = usuario.company || '';
    document.getElementById('editRole').value = usuario.role || 'user';
    document.getElementById('editActive').checked = usuario.active !== false;
    
    // Armazenar ID do usuário sendo editado
    window.usuarioEditandoId = id;
    
    // Abrir modal
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log('✅ [DEBUG] Modal de edição aberto');
    } else {
        console.error('❌ [DEBUG] Modal modalEditarUsuario não encontrado');
        showError('Modal de edição não encontrado');
    }
};

// Função para toggle (ativar/desativar)
window.toggleUsuario = async function(id) {
    console.log('🔄 [DEBUG] Toggle usuário:', id);
    
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
        console.log(`📡 [DEBUG] ${acao} usuário na API...`);
        
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ active: novoStatus })
        });
        
        console.log('📈 [DEBUG] Resposta da API:', response.status);
        
        if (response.ok) {
            console.log(`✅ [DEBUG] Usuário ${acao} com sucesso`);
            showSuccess(`Usuário ${acao} com sucesso!`);
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ [DEBUG] Erro da API:', erro);
            showError(`Erro ao ${acao} usuário: ` + erro);
        }
        
    } catch (error) {
        console.error(`💥 [DEBUG] Erro ao ${acao} usuário:`, error);
        showError(`Erro de conexão ao ${acao} usuário`);
    }
};

// Função para deletar usuário
window.deletarUsuario = async function(id) {
    console.log('🗑️ [DEBUG] Deletando usuário:', id);
    
    const usuario = usuarios.find(u => u._id === id);
    if (!usuario) {
        showError('Usuário não encontrado');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente o usuário ${usuario.name}?\n\nEsta ação NÃO pode ser desfeita!`)) {
        return;
    }
    
    try {
        console.log('📡 [DEBUG] Deletando usuário na API...');
        
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        console.log('📈 [DEBUG] Resposta da API:', response.status);
        
        if (response.ok) {
            console.log('✅ [DEBUG] Usuário deletado com sucesso');
            showSuccess('Usuário excluído com sucesso!');
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ [DEBUG] Erro da API:', erro);
            showError('Erro ao excluir usuário: ' + erro);
        }
        
    } catch (error) {
        console.error('💥 [DEBUG] Erro ao deletar usuário:', error);
        showError('Erro de conexão ao excluir usuário');
    }
};

// Função para salvar edição do usuário
window.salvarEdicaoUsuario = async function(event) {
    console.log('💾 [DEBUG] Salvando edição do usuário...');
    event.preventDefault();
    
    if (!window.usuarioEditandoId) {
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
    
    console.log('📊 [DEBUG] Dados atualizados:', dadosAtualizados);
    
    try {
        console.log('📡 [DEBUG] Enviando atualização para API...');
        
        const response = await fetch(`/api/users/${window.usuarioEditandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dadosAtualizados)
        });
        
        console.log('📈 [DEBUG] Resposta da API:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ [DEBUG] Usuário atualizado:', data);
            
            showSuccess('Usuário atualizado com sucesso!');
            fecharModalEditarUsuario();
            
            // Recarregar lista de usuários
            await carregarUsuarios();
            
        } else {
            const erro = await response.text();
            console.error('❌ [DEBUG] Erro da API:', erro);
            showError('Erro ao atualizar usuário: ' + erro);
        }
        
    } catch (error) {
        console.error('💥 [DEBUG] Erro ao atualizar usuário:', error);
        showError('Erro de conexão ao atualizar usuário');
    }
};

// Função para fechar modal de edição
window.fecharModalEditarUsuario = function() {
    console.log('❌ [DEBUG] Fechando modal de edição...');
    
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        window.usuarioEditandoId = null;
        console.log('✅ [DEBUG] Modal de edição fechado');
    }
};

console.log('✅ [DEBUG] Script de usuários carregado');
