// CONFIGURACOES.JS - GESTÃO COMPLETA DE CONFIGURAÇÕES DE USUÁRIO
console.log('🚀 CONFIGURACOES.JS CARREGADO! 🚀');

// Verificação básica de autenticação
function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log('Usuário não autenticado, redirecionando...');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Variáveis globais
let usuarioAtual = null;
let inicializacaoRealizada = false;

// Função para mostrar seções
window.showSection = function(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.config-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remover classe active de todos os nav items
    document.querySelectorAll('.config-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(`section-${sectionName}`).classList.remove('hidden');
    
    // Adicionar classe active ao nav item clicado
    event.target.closest('.config-nav-item').classList.add('active');
};

// Função para carregar dados do usuário
async function carregarDadosUsuario() {
    console.log('Carregando dados do usuário...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token não encontrado');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            usuarioAtual = data.user;
            console.log('Dados do usuário carregados:', usuarioAtual);
            
            preencherFormularios();
            carregarEstatisticas();
        } else {
            console.error('Erro na resposta:', response.status, response.statusText);
            if (response.status === 401) {
                console.log('Token inválido, redirecionando para login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            const erro = await response.text();
            console.error('Erro da API:', erro);
            showError('Erro ao carregar dados do usuário: ' + response.status);
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão: ' + error.message);
    }
}

// Função para preencher formulários com dados do usuário
function preencherFormularios() {
    // Seção Perfil
    if (usuarioAtual) {
        document.getElementById('perfilNome').value = usuarioAtual.name || '';
        document.getElementById('perfilEmail').value = usuarioAtual.email || '';
        document.getElementById('perfilEmpresa').value = usuarioAtual.company || '';
        
        // Atualizar sidebar também
        const userNameElement = document.getElementById('user-name');
        const userEmailElement = document.getElementById('userEmail');
        
        if (userNameElement) {
            userNameElement.textContent = usuarioAtual.name || 'Usuário';
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = usuarioAtual.email || '';
        }
        
        // Atualizar ícone baseado no role
        const userIcon = document.getElementById('user-icon');
        if (userIcon && usuarioAtual.role === 'admin') {
            userIcon.className = 'fas fa-crown text-white';
        } else if (userIcon) {
            userIcon.className = 'fas fa-user text-white';
        }
    }
}

// Função para carregar estatísticas da conta
async function carregarEstatisticas() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('/api/users/stats', {
            headers: {
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Estatísticas carregadas:', data);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Função para salvar perfil
async function salvarPerfil(event) {
    event.preventDefault();
    console.log('Salvando perfil...');
    
    const nome = document.getElementById('perfilNome').value.trim();
    const empresa = document.getElementById('perfilEmpresa').value.trim();
    
    if (!nome) {
        showError('Nome é obrigatório');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            },
            body: JSON.stringify({
                name: nome,
                company: empresa
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            usuarioAtual = data.user;
            showSuccess('Perfil atualizado com sucesso!');
            
            // Atualizar localStorage com os novos dados
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Atualizar nome na sidebar
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = nome;
            }
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao atualizar perfil');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão');
    }
}

// Função para alterar senha
async function alterarSenha(event) {
    event.preventDefault();
    console.log('Alterando senha...');
    
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        showError('Todos os campos são obrigatórios');
        return;
    }
    
    if (novaSenha !== confirmarSenha) {
        showError('As senhas não coincidem');
        return;
    }
    
    if (novaSenha.length < 6) {
        showError('A nova senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: senhaAtual,
                newPassword: novaSenha
            })
        });
        
        if (response.ok) {
            showSuccess('Senha alterada com sucesso!');
            // Limpar formulário
            document.getElementById('formSenha').reset();
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao alterar senha');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de conexão');
    }
}

// Configurar event listeners
function configurarEventListeners() {
    // Form de perfil
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', salvarPerfil);
    }
    
    // Form de senha
    const formSenha = document.getElementById('formSenha');
    if (formSenha) {
        formSenha.addEventListener('submit', alterarSenha);
    }
    
    // Botões de logout
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Função de logout
function logout() {
    // Usar a função de alerta bonita se estiver disponível
    if (typeof confirmAction === 'function' || typeof window.confirmAction === 'function') {
        const confirmFunc = confirmAction || window.confirmAction;
        confirmFunc('Deseja realmente sair do sistema? Você precisará fazer login novamente para acessar o sistema.', 'Confirmar Logout')
            .then((confirmed) => {
                if (confirmed) {
                    // Confirmou o logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    if (typeof showSuccess === 'function' || typeof window.showSuccess === 'function') {
                        const successFunc = showSuccess || window.showSuccess;
                        successFunc('Logout realizado com sucesso! Redirecionando...');
                    }
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            });
    } else {
        // Fallback para confirm padrão
        if (confirm('Deseja realmente sair do sistema?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (typeof showSuccess === 'function') {
                showSuccess('Logout realizado com sucesso!');
            }
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// Adicionar estilos CSS para navegação ativa
function adicionarEstilos() {
    const style = document.createElement('style');
    style.textContent = `
        .config-nav-item.active {
            background-color: #f0fdfa;
            color: #0d9488;
            font-weight: 600;
        }
        .config-nav-item.active i {
            color: #0d9488;
        }
    `;
    document.head.appendChild(style);
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando página de configurações...');
    
    if (inicializacaoRealizada) {
        console.log('Já inicializado, ignorando...');
        return;
    }
    inicializacaoRealizada = true;
    
    // Verificar autenticação primeiro
    if (!verificarAutenticacao()) {
        return;
    }
    
    try {
        // Adicionar estilos
        adicionarEstilos();
        
        // Configurar event listeners
        configurarEventListeners();
        
        // Carregar dados do usuário
        await carregarDadosUsuario();
        
        console.log('Inicialização completa!');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Erro ao inicializar: ' + error.message);
    }
});

console.log('configuracoes.js carregado!');
