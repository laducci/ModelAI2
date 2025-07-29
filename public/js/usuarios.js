// USUARIOS.JS - VERSÃO SIMPLIFICADA
console.log('🚀 USUARIOS.JS - Iniciando versão simplificada...');

// Variáveis globais
let usuarios = [];
let usuarioAtual = null;

// 1. FUNÇÃO PARA ABRIR MODAL - GLOBAL
window.abrirModalNovoUsuario = function() {
    console.log('🔵 abrirModalNovoUsuario chamada!');
    
    const modal = document.getElementById('modalNovoUsuario');
    if (!modal) {
        console.error('❌ Modal modalNovoUsuario não encontrado!');
        alert('Erro: Modal não encontrado');
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

// 2. FUNÇÃO PARA FECHAR MODAL - GLOBAL
window.fecharModalNovoUsuario = function() {
    console.log('🔄 fecharModalNovoUsuario chamada!');
    
    const modal = document.getElementById('modalNovoUsuario');
    if (modal) {
        modal.classList.add('hidden');
        console.log('✅ Modal fechado!');
    }
};

// 3. FUNÇÃO PARA CRIAR USUÁRIO - GLOBAL
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
        alert('Por favor, preencha todos os campos obrigatórios');
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
            
            alert('Usuário criado com sucesso!');
            window.fecharModalNovoUsuario();
            
            // Recarregar lista
            await window.carregarUsuarios();
            
        } else {
            const erro = await response.json();
            console.error('❌ Erro da API:', erro);
            alert(`Erro: ${erro.message || 'Erro ao criar usuário'}`);
        }
        
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        alert('Erro de conexão. Verifique sua internet.');
    }
};

// 4. FUNÇÃO PARA CARREGAR USUÁRIOS - GLOBAL
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
            
            console.log(`✅ ${usuarios.length} usuários carregados:`, usuarios);
            
            // Renderizar usuários
            renderizarUsuarios();
            atualizarEstatisticas();
            
        } else {
            const erro = await response.json();
            console.error('❌ Erro da API:', erro);
            
            // Mostrar erro na tabela
            const tabela = document.getElementById('tabelaUsuarios');
            if (tabela) {
                tabela.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-red-500 p-4">
                            ❌ Erro ao carregar usuários: ${erro.message}
                        </td>
                    </tr>
                `;
            }
        }
        
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        
        const tabela = document.getElementById('tabelaUsuarios');
        if (tabela) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-red-500 p-4">
                        ❌ Erro de conexão: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
};

// 5. FUNÇÃO PARA RENDERIZAR USUÁRIOS
function renderizarUsuarios() {
    console.log('🎨 Renderizando usuários...');
    
    const tabela = document.getElementById('tabelaUsuarios');
    if (!tabela) {
        console.error('❌ Tabela tabelaUsuarios não encontrada!');
        return;
    }
    
    if (usuarios.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray-500 p-8">
                    👥 Nenhum usuário encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    const html = usuarios.map(usuario => {
        const status = usuario.isActive ? 
            '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>' :
            '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inativo</span>';
            
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
                        <button onclick="toggleUsuarioStatus('${usuario._id}', ${usuario.isActive})" 
                                class="px-2 py-1 rounded ${usuario.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}">
                            <i class="fas fa-${usuario.isActive ? 'ban' : 'check'}"></i> 
                            ${usuario.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onclick="deletarUsuario('${usuario._id}')" class="text-red-600 hover:text-red-900 px-2 py-1 rounded">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tabela.innerHTML = html;
    console.log('✅ Usuários renderizados na tabela!');
}

// 6. FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS
function atualizarEstatisticas() {
    console.log('📊 Atualizando estatísticas...');
    
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.isActive).length;
    const admins = usuarios.filter(u => u.role === 'admin').length;
    
    // Atualizar elementos
    const elementoTotal = document.getElementById('totalUsuarios');
    const elementoAtivos = document.getElementById('usuariosAtivos');
    const elementoNovos = document.getElementById('novosUsuarios');
    
    if (elementoTotal) elementoTotal.textContent = total;
    if (elementoAtivos) elementoAtivos.textContent = ativos;
    if (elementoNovos) elementoNovos.textContent = admins;
    
    console.log(`📈 Stats: ${total} total, ${ativos} ativos, ${admins} admins`);
}

// 7. FUNÇÃO PARA EDITAR USUÁRIO - GLOBAL
window.editarUsuario = function(userId) {
    console.log('✏️ Editando usuário:', userId);
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        alert('Usuário não encontrado');
        return;
    }
    
    const novoNome = prompt(`Editar nome do usuário:\n\nNome atual: ${usuario.name}`, usuario.name);
    if (novoNome && novoNome.trim() && novoNome.trim() !== usuario.name) {
        updateUsuario(userId, { name: novoNome.trim() });
    }
};

// Função auxiliar para atualizar usuário
async function updateUsuario(userId, updateData) {
    try {
        console.log('📝 Atualizando usuário:', userId, updateData);
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updateData)
        });
        
        console.log('📈 Resposta da API atualizar:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Usuário atualizado:', result);
            alert('Usuário atualizado com sucesso!');
            await window.carregarUsuarios();
        } else {
            const erro = await response.json();
            console.error('❌ Erro da API:', erro);
            alert(`Erro ao atualizar usuário: ${erro.message}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// 8. FUNÇÃO PARA DELETAR USUÁRIO - GLOBAL
window.deletarUsuario = async function(userId) {
    console.log('🗑️ Deletando usuário:', userId);
    
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        alert('Usuário não encontrado');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario.name}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            alert('Usuário deletado com sucesso!');
            await window.carregarUsuarios();
        } else {
            const erro = await response.json();
            alert(`Erro ao deletar usuário: ${erro.message}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        alert('Erro de conexão. Tente novamente.');
    }
};

// 9. FUNÇÃO PARA ATIVAR/DESATIVAR USUÁRIO - GLOBAL
window.toggleUsuarioStatus = async function(userId, currentStatus) {
    console.log('🔄 Toggle status usuário:', userId, 'Status atual:', currentStatus);
    
    const usuario = usuarios.find(u => u._id === userId);
    if (!usuario) {
        alert('Usuário não encontrado');
        return;
    }
    
    const acao = currentStatus ? 'desativar' : 'ativar';
    const novoStatus = !currentStatus;
    
    if (!confirm(`Tem certeza que deseja ${acao} o usuário "${usuario.name}"?`)) {
        return;
    }
    
    await updateUsuario(userId, { isActive: novoStatus });
};

// 10. FUNÇÃO LOGOUT
window.logout = function() {
    console.log('🚪 Logout...');
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('login.html');
};

// 8. INICIALIZAÇÃO QUANDO DOM CARREGA
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM carregado - Inicializando usuarios.js...');
    
    try {
        // Verificar autenticação
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            console.log('❌ Não autenticado, redirecionando...');
            window.location.replace('login.html');
            return;
        }
        
        usuarioAtual = JSON.parse(userData);
        console.log('👤 Usuário atual:', usuarioAtual.name, usuarioAtual.role);
        
        if (usuarioAtual.role !== 'admin') {
            console.log('🚫 Não é admin, redirecionando...');
            alert('Acesso negado. Apenas administradores.');
            window.location.replace('inputs.html');
            return;
        }
        
        // Configurar botão
        const btnNovoUsuario = document.getElementById('btnNovoUsuario');
        if (btnNovoUsuario) {
            btnNovoUsuario.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Botão clicado via addEventListener!');
                window.abrirModalNovoUsuario();
            });
            console.log('✅ Botão configurado!');
        } else {
            console.error('❌ Botão btnNovoUsuario não encontrado!');
        }
        
        // Configurar form
        const form = document.getElementById('formNovoUsuario');
        if (form) {
            form.addEventListener('submit', window.criarUsuario);
            console.log('✅ Form configurado!');
        } else {
            console.error('❌ Form formNovoUsuario não encontrado!');
        }
        
        // Carregar usuários
        console.log('📋 Carregando usuários...');
        await window.carregarUsuarios();
        
        console.log('🎉 Inicialização completa!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        alert('Erro ao inicializar a página: ' + error.message);
    }
});

console.log('✅ usuarios.js carregado - Funções definidas globalmente!');
