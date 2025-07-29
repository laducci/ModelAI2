// Auth Guard - VERSÃO FINAL ULTRA ROBUSTA
console.log('🔐 AUTH GUARD V3 - INICIANDO...');

// Estado global
let currentUser = null;
let isInitialized = false;

// Configurações
const CONFIG = {
    PROTECTED_PAGES: ['usuarios.html', 'inputs.html', 'cenarios.html', 'resultados.html'],
    ADMIN_PAGES: ['usuarios.html', 'cenarios.html', 'resultados.html'],
    USER_PAGES: ['inputs.html', 'cenarios.html', 'resultados.html']
};

// Função ROBUSTA para buscar dados do usuário
function getUserData() {
    try {
        // Buscar em todas as possíveis chaves do localStorage
        let userData = null;
        let token = null;

        // Tentar diferentes chaves
        const userKeys = ['user', 'modelai_user'];
        const tokenKeys = ['token', 'modelai_token'];

        for (let key of userKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    userData = JSON.parse(data);
                    console.log('✅ Dados encontrados em:', key, userData);
                    break;
                } catch (e) {
                    console.log('❌ Erro ao parsear:', key);
                }
            }
        }

        for (let key of tokenKeys) {
            const t = localStorage.getItem(key);
            if (t) {
                token = t;
                console.log('✅ Token encontrado em:', key);
                break;
            }
        }

        if (!userData || !token) {
            console.log('❌ Dados ou token não encontrados');
            return null;
        }

        return { user: userData, token: token };
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        return null;
    }
}

// Função SUPER ROBUSTA para atualizar UI
function updateUserInterface() {
    if (!currentUser) {
        console.log('❌ Usuário não definido para atualizar UI');
        return;
    }

    console.log('🎨 ATUALIZANDO UI - Usuário:', currentUser.name, 'Role:', currentUser.role);

    // FORÇAR atualização do nome
    setTimeout(() => {
        const nameSelectors = ['#user-name', '#userName', '.user-name', '[data-user-name]'];
        nameSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = currentUser.name;
                console.log('✅ Nome atualizado via:', selector);
            }
        });
    }, 100);

    // FORÇAR atualização do ícone
    setTimeout(() => {
        const iconSelectors = ['#user-icon', '.user-icon', '[data-user-icon]'];
        iconSelectors.forEach(selector => {
            const icon = document.querySelector(selector);
            if (icon) {
                // LIMPAR todas as classes
                icon.className = '';
                
                // ADICIONAR classes base
                icon.classList.add('fas', 'text-white');
                
                // ADICIONAR ícone correto baseado no role
                if (currentUser.role === 'admin') {
                    icon.classList.add('fa-crown');
                    console.log('👑 ÍCONE ADMIN definido via:', selector);
                } else {
                    icon.classList.add('fa-user');
                    console.log('👤 ÍCONE USER definido via:', selector);
                }
            }
        });
    }, 150);

    // FORÇAR controle do menu de usuários
    setTimeout(() => {
        const menuUsuarios = document.querySelector('a[href="usuarios.html"]');
        if (menuUsuarios) {
            const menuItem = menuUsuarios.closest('.sidebar-item, .nav-item, .menu-item');
            if (menuItem) {
                if (currentUser.role === 'admin') {
                    menuItem.style.display = 'block';
                    menuItem.style.visibility = 'visible';
                    console.log('👑 Menu USUÁRIOS MOSTRADO para admin');
                } else {
                    menuItem.style.display = 'none';
                    menuItem.style.visibility = 'hidden';
                    console.log('👤 Menu USUÁRIOS OCULTO para user');
                }
            }
        }
    }, 200);

    // FORÇAR atualização do email
    setTimeout(() => {
        const emailElement = document.querySelector('#userEmail, .user-email');
        if (emailElement && currentUser.email) {
            emailElement.textContent = currentUser.email;
        }
    }, 250);
}

// Função para verificar acesso à página
function checkPageAccess() {
    if (!currentUser) return false;

    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Verificando acesso - Página:', currentPage, 'Role:', currentUser.role);

    if (currentUser.role === 'admin') {
        return CONFIG.ADMIN_PAGES.includes(currentPage);
    } else {
        return CONFIG.USER_PAGES.includes(currentPage);
    }
}

// Função para redirecionar usuário para página correta
function redirectToCorrectPage() {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
        console.log('👑 Redirecionando admin para usuarios.html');
        window.location.replace('usuarios.html');
    } else {
        console.log('👤 Redirecionando user para inputs.html');
        window.location.replace('inputs.html');
    }
}

// Função de logout
function logout() {
    console.log('🚪 Fazendo logout...');
    
    // Limpar TUDO
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset estado
    currentUser = null;
    isInitialized = false;
    
    // Redirecionar
    window.location.replace('login.html');
}

// Configurar links de logout
function setupLogoutLinks() {
    const logoutSelectors = [
        'a[href="login.html"]',
        '[data-action="logout"]',
        '.logout-btn',
        'button[onclick*="logout"]'
    ];

    logoutSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        });
    });
}

// INICIALIZAÇÃO PRINCIPAL - SUPER ROBUSTA
async function initializeAuth() {
    if (isInitialized) return;

    console.log('🚀 INICIALIZANDO AUTENTICAÇÃO...');

    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Página atual:', currentPage);

    // Se for página de login, não verificar auth
    if (currentPage === 'login.html' || currentPage === '' || currentPage === 'index.html') {
        console.log('📝 Página de login - sem verificação');
        return;
    }

    // Buscar dados do usuário
    const authData = getUserData();
    
    if (!authData) {
        console.log('❌ Não autenticado - redirecionando para login');
        localStorage.setItem('login_message', 'Sessão expirada. Faça login novamente.');
        window.location.replace('login.html');
        return;
    }

    // Definir usuário atual
    currentUser = authData.user;
    console.log('✅ USUÁRIO CARREGADO:', currentUser.name, 'Role:', currentUser.role);

    // Verificar se tem acesso à página atual
    if (!checkPageAccess()) {
        console.log('🚫 SEM ACESSO à página atual - redirecionando');
        redirectToCorrectPage();
        return;
    }

    console.log('✅ ACESSO PERMITIDO à página:', currentPage);

    // Atualizar interface
    updateUserInterface();
    
    // Configurar logout
    setupLogoutLinks();
    
    // Marcar como inicializado
    isInitialized = true;
    
    console.log('🎉 AUTENTICAÇÃO INICIALIZADA COM SUCESSO!');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM carregado - inicializando auth...');
    initializeAuth();
});

// Garantir que a UI seja atualizada mesmo que algo dê errado
window.addEventListener('load', function() {
    console.log('🌐 Window load - forçando atualização da UI...');
    if (currentUser) {
        updateUserInterface();
    }
});

// Exportar funções globais
window.authGuard = {
    getCurrentUser: () => currentUser,
    logout: logout,
    updateUI: updateUserInterface,
    reinitialize: () => {
        isInitialized = false;
        initializeAuth();
    }
};

console.log('🔐 AUTH GUARD V3 - CONFIGURADO!');
