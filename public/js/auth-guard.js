// AUTH GUARD ULTRA SIMPLES - SISTEMA DEFINITIVO
console.log('🔐 AUTH GUARD DEFINITIVO - INICIANDO...');

let currentUser = null;
let menuMonitor = null;

// Função para buscar dados do usuário
function getUserData() {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
        console.log('❌ Sem dados de autenticação');
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('✅ Usuário encontrado:', user.name, 'Role:', user.role);
        return { user, token };
    } catch (error) {
        console.error('❌ Erro ao parsear dados:', error);
        localStorage.clear();
        return null;
    }
}

// FORÇA MENU USUÁRIOS SEMPRE VISÍVEL PARA ADMIN
function forceAdminMenu() {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    // Encontrar TODOS os links de usuários
    const selectors = [
        'a[href="usuarios.html"]',
        'a[href*="usuarios"]',
        '[data-page="usuarios"]'
    ];
    
    selectors.forEach(selector => {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
            const item = link.closest('li, .sidebar-item, .nav-item, .menu-item');
            if (item) {
                // FORÇA VISÍVEL
                item.style.display = 'flex !important';
                item.style.visibility = 'visible !important';
                item.style.opacity = '1 !important';
                item.classList.remove('hidden', 'd-none');
                item.classList.add('visible');
            }
        });
    });
    
    console.log('👑 Menu admin forçado!');
}

// Atualizar interface do usuário
function updateUserInterface() {
    if (!currentUser) return;
    
    console.log('🎨 Atualizando UI para:', currentUser.name, 'Role:', currentUser.role);
    
    // Nome do usuário
    setTimeout(() => {
        const nameElements = document.querySelectorAll('#user-name, #userName, .user-name');
        nameElements.forEach(el => {
            if (el) el.textContent = currentUser.name;
        });
    }, 100);
    
    // Ícone do usuário
    setTimeout(() => {
        const iconElements = document.querySelectorAll('#user-icon, .user-icon');
        iconElements.forEach(icon => {
            if (icon) {
                icon.className = 'fas text-white';
                if (currentUser.role === 'admin') {
                    icon.classList.add('fa-crown');
                } else {
                    icon.classList.add('fa-user');
                }
            }
        });
    }, 200);
    
    // FORÇA MENU ADMIN
    setTimeout(forceAdminMenu, 300);
}

// Verificar acesso à página
function checkPageAccess() {
    if (!currentUser) return false;
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentUser.role === 'admin') {
        return ['usuarios.html', 'inputs.html', 'cenarios.html', 'resultados.html'].includes(currentPage);
    } else {
        return ['inputs.html', 'cenarios.html', 'resultados.html'].includes(currentPage);
    }
}

// Logout
function logout() {
    console.log('🚪 Logout...');
    if (menuMonitor) clearInterval(menuMonitor);
    localStorage.clear();
    sessionStorage.clear();
    currentUser = null;
    window.location.replace('login.html');
}

// INICIALIZAÇÃO PRINCIPAL
function initializeAuth() {
    console.log('🚀 Inicializando auth...');
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // Se for login, não verificar
    if (currentPage === 'login.html' || currentPage === '' || currentPage === 'index.html') {
        return;
    }
    
    const authData = getUserData();
    
    if (!authData) {
        console.log('❌ Redirecionando para login');
        window.location.replace('login.html');
        return;
    }
    
    currentUser = authData.user;
    console.log('✅ Usuário logado:', currentUser.name, 'Role:', currentUser.role);
    
    if (!checkPageAccess()) {
        console.log('🚫 Sem acesso a esta página');
        // Não redirecionar automaticamente - deixar o usuário navegar
        // if (currentUser.role === 'admin') {
        //     window.location.replace('usuarios.html');
        // } else {
        //     window.location.replace('inputs.html');
        // }
        // return;
    }
    
    updateUserInterface();
    
    // MONITOR CONTÍNUO DO MENU ADMIN
    if (currentUser.role === 'admin') {
        menuMonitor = setInterval(() => {
            forceAdminMenu();
        }, 1000); // A cada 1 segundo
        console.log('👑 Monitor de menu admin ativado');
    }
    
    // Configurar logout
    setTimeout(() => {
        const logoutElements = document.querySelectorAll('a[href="login.html"], [data-action="logout"], .logout-btn');
        logoutElements.forEach(el => {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        });
    }, 500);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAuth, 200);
});

window.addEventListener('load', function() {
    setTimeout(() => {
        if (currentUser) updateUserInterface();
    }, 300);
});

// Garantir atualização em navegação
window.addEventListener('focus', function() {
    if (currentUser) {
        updateUserInterface();
        if (currentUser.role === 'admin') {
            setTimeout(forceAdminMenu, 100);
        }
    }
});

// Exportar para uso global
window.authGuard = {
    getCurrentUser: () => currentUser,
    logout: logout,
    forceMenu: forceAdminMenu
};

window.logout = logout;

console.log('🔐 AUTH GUARD DEFINITIVO - CONFIGURADO!');
