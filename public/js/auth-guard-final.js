// Auth Guard - SISTEMA REAL DE PRODUÇÃO FINAL
console.log('🔐 AUTH GUARD REAL - INICIANDO...');

// Estado global
let currentUser = null;
let isInitialized = false;

// Configurações de acesso
const CONFIG = {
    PROTECTED_PAGES: ['usuarios.html', 'inputs.html', 'cenarios.html', 'resultados.html'],
    ADMIN_PAGES: ['usuarios.html', 'cenarios.html', 'inputs.html', 'resultados.html'],
    USER_PAGES: ['inputs.html', 'cenarios.html', 'resultados.html']
};

// Função para buscar dados do localStorage
function getUserData() {
    try {
        const userData = localStorage.getItem('user') || localStorage.getItem('modelai_user');
        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');

        if (!userData || !token) {
            console.log('❌ Dados de autenticação não encontrados');
            return null;
        }

        const user = JSON.parse(userData);
        console.log('✅ Usuário carregado:', user.name, 'Role:', user.role);
        return { user, token };
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        return null;
    }
}

// Função DEFINITIVA para atualizar interface
function updateUserInterface() {
    if (!currentUser) return;

    console.log('🎨 ATUALIZANDO UI - Usuário:', currentUser.name, 'Role:', currentUser.role);

    // 1. ATUALIZAR NOME
    setTimeout(() => {
        const nameElements = document.querySelectorAll('#user-name, #userName, .user-name');
        nameElements.forEach(el => {
            if (el) el.textContent = currentUser.name;
        });
    }, 100);

    // 2. ATUALIZAR ÍCONE - FORÇAR
    setTimeout(() => {
        const iconElements = document.querySelectorAll('#user-icon, .user-icon');
        iconElements.forEach(icon => {
            if (icon) {
                icon.className = 'fas text-white';
                if (currentUser.role === 'admin') {
                    icon.classList.add('fa-crown');
                    console.log('👑 ÍCONE ADMIN (COROA) definido');
                } else {
                    icon.classList.add('fa-user');
                    console.log('👤 ÍCONE USER definido');
                }
            }
        });
    }, 150);

    // 3. MENU USUÁRIOS - FORÇA MÁXIMA
    setTimeout(() => {
        forceUserMenuVisibility();
    }, 200);

    // 4. EMAIL
    setTimeout(() => {
        const emailElements = document.querySelectorAll('#userEmail, .user-email');
        emailElements.forEach(el => {
            if (el && currentUser.email) el.textContent = currentUser.email;
        });
    }, 250);
}

// Função específica para FORÇAR visibilidade do menu usuários
function forceUserMenuVisibility() {
    if (!currentUser) return;

    // Buscar TODOS os elementos relacionados ao menu usuários
    const selectors = [
        'a[href="usuarios.html"]',
        '[data-page="usuarios"]',
        '.usuarios-menu',
        'a[href*="usuarios"]'
    ];

    let menuFound = false;

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(link => {
            const menuItem = link.closest('.sidebar-item, .nav-item, .menu-item, li');
            if (menuItem) {
                menuFound = true;
                if (currentUser.role === 'admin') {
                    // ADMIN: FORÇAR visível
                    menuItem.style.display = 'flex';
                    menuItem.style.visibility = 'visible';
                    menuItem.style.opacity = '1';
                    menuItem.style.pointerEvents = 'auto';
                    menuItem.classList.remove('hidden', 'd-none');
                    console.log('👑 Menu USUÁRIOS FORÇADO para admin via:', selector);
                } else {
                    // USER: FORÇAR oculto
                    menuItem.style.display = 'none';
                    menuItem.style.visibility = 'hidden';
                    menuItem.classList.add('hidden');
                    console.log('👤 Menu USUÁRIOS OCULTO para user via:', selector);
                }
            }
        });
    });

    if (!menuFound) {
        console.log('⚠️ Menu de usuários não encontrado na página');
    }
}

// Verificar acesso à página
function checkPageAccess() {
    if (!currentUser) return false;

    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentUser.role === 'admin') {
        return CONFIG.ADMIN_PAGES.includes(currentPage);
    } else {
        return CONFIG.USER_PAGES.includes(currentPage);
    }
}

// Redirecionar para página correta
function redirectToCorrectPage() {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
        window.location.replace('usuarios.html');
    } else {
        window.location.replace('inputs.html');
    }
}

// Logout
function logout() {
    console.log('🚪 Logout...');
    localStorage.clear();
    sessionStorage.clear();
    currentUser = null;
    isInitialized = false;
    window.location.replace('login.html');
}

// Configurar botões de logout
function setupLogoutHandlers() {
    const selectors = [
        'a[href="login.html"]',
        '[data-action="logout"]',
        '.logout-btn',
        'button[onclick*="logout"]'
    ];

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        });
    });
}

// INICIALIZAÇÃO
async function initializeAuth() {
    if (isInitialized) {
        if (currentUser) updateUserInterface();
        return;
    }

    console.log('🚀 INICIALIZANDO AUTH...');

    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que não precisam de auth
    if (currentPage === 'login.html' || currentPage === '' || currentPage === 'index.html') {
        isInitialized = true;
        return;
    }

    const authData = getUserData();
    
    if (!authData) {
        console.log('❌ Não autenticado - redirecionando');
        window.location.replace('login.html');
        return;
    }

    currentUser = authData.user;
    console.log('✅ USUÁRIO LOGADO:', currentUser.name, 'Role:', currentUser.role);

    if (!checkPageAccess()) {
        console.log('🚫 Sem acesso - redirecionando');
        redirectToCorrectPage();
        return;
    }

    updateUserInterface();
    setupLogoutHandlers();
    isInitialized = true;
    
    console.log('🎉 AUTH INICIALIZADO!');
}

// Monitoramento contínuo do menu (para admin)
function monitorAdminMenu() {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    const menuLink = document.querySelector('a[href="usuarios.html"]');
    if (menuLink) {
        const menuItem = menuLink.closest('.sidebar-item, .nav-item');
        if (menuItem) {
            const isHidden = menuItem.style.display === 'none' || 
                           menuItem.style.visibility === 'hidden' || 
                           menuItem.classList.contains('hidden');
            
            if (isHidden) {
                console.log('🚨 CORRIGINDO: Menu usuários estava oculto para admin!');
                forceUserMenuVisibility();
            }
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM carregado...');
    setTimeout(initializeAuth, 100);
});

window.addEventListener('load', function() {
    setTimeout(() => {
        if (currentUser) updateUserInterface();
    }, 200);
});

// Monitorar menu a cada 2 segundos
setInterval(monitorAdminMenu, 2000);

// Exportar funções globais
window.authGuard = {
    getCurrentUser: () => currentUser,
    logout: logout,
    updateUI: updateUserInterface,
    forceMenuUpdate: forceUserMenuVisibility
};

window.logout = logout;

console.log('🔐 AUTH GUARD REAL - CONFIGURADO!');
