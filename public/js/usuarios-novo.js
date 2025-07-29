// USUARIOS.JS - VERSÃO SIMPLIFICADA E FUNCIONAL
console.log('Carregando usuarios.js...');

// Variáveis globais
let usuarios = [];
let inicializacaoRealizada = false;
let carregandoUsuarios = false;

// Função para carregar usuários
window.carregarUsuarios = async function() {
    console.log('Carregando usuários...');
    
    if (carregandoUsuarios) {
        console.log('Já carregando, ignorando...');
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
            console.log('Usuários carregados:', usuarios.length);
            
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
    console.log('Renderizando usuários...');
    
    const tbody = document.getElementById('tabelaUsuarios');
    if (!tbody) {
        console.error('Tabela não encontrada!');
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
    
    console.log('Usuários renderizados!');
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
    console.log('Editando usuário:', userId);
    
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
    event.preventDefault();
    
    const userId = document.getElementById('editarUsuarioId').value;
    const dadosAtualizacao = {
        name: document.getElementById('editarNome').value,
        email: document.getElementById('editarEmail').value,
        company: document.getElementById('editarEmpresa').value,
        role: document.getElementById('editarRole').value,
        active: document.getElementById('editarStatus').value === 'true'
    };
    
    const novaSenha = document.getElementById('editarSenha').value;
    if (novaSenha.trim()) {
        dadosAtualizacao.password = novaSenha;
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
            showSuccess(`Usuário "${dadosAtualizacao.name}" atualizado com sucesso!`);
            window.fecharModalEditarUsuario();
            await window.carregarUsuarios();
        } else {
            const erro = await response.json();
            showError(`Erro ao atualizar: ${erro.message}`);
        }
    } catch (error) {
        console.error('Erro:', error);
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
    console.log('Inicializando página...');
    
    if (inicializacaoRealizada) {
        console.log('Já inicializado, ignorando...');
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
        console.log('Inicialização completa!');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Erro ao inicializar: ' + error.message);
    }
});

console.log('usuarios.js carregado!');
