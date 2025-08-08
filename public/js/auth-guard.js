// AUTH GUARD ULTRA SIMPLES - SISTEMA DEFINITIVO
let currentUser = null;
let menuMonitor = null;

// Função para buscar dados do usuário
function getUserData() {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        return { user, token };
    } catch (error) {
        console.error('❌ Erro ao parsear dados:', error);
        localStorage.clear();
        return null;
    }
}

// ATUALIZAR DADOS IMEDIATAMENTE
function loadUserDataImmediately() {
    
    const userData = getUserData();
    
    
    if (userData) {
        currentUser = userData.user;
        
        
        updateUserInterface();
    } else {
        
    }
}

// Executar IMEDIATAMENTE
loadUserDataImmediately();

// FORÇA MENU USUÁRIOS SEMPRE VISÍVEL PARA ADMIN
function forceAdminMenu() {
    // DESABILITADO - Menu já está fixo no HTML das páginas
    return;
    
    if (!currentUser || currentUser.role !== 'admin') return;
    
    // Não adicionar menu duplicado na própria página de usuários
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'usuarios.html') return;
    
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
}

// Atualizar interface do usuário
function updateUserInterface() {

    
    if (!currentUser) {
        return;
    }
    
    
    
    // Nome do usuário - IMEDIATAMENTE
    const nameElements = document.querySelectorAll('#user-name, #userName, .user-name');
    nameElements.forEach(el => {
        if (el) {
            el.textContent = currentUser.name;
        }
    });
    
    // Email do usuário - IMEDIATAMENTE  
    const emailElements = document.querySelectorAll('#userEmail, .user-email');
    emailElements.forEach(el => {
        if (el) {
            el.textContent = currentUser.email;
        }
    });
        }
    
    // Ícone do usuário - IMEDIATAMENTE
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
    
    // FORÇA MENU ADMIN
    setTimeout(forceAdminMenu, 300);

// Verificar acesso à página
function checkPageAccess() {
    if (!currentUser) return false;
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que requerem privilégios de admin
    const adminOnlyPages = ['usuarios.html', 'fabric-admin.html'];
    
    if (adminOnlyPages.includes(currentPage)) {
        if (currentUser.role !== 'admin') {
            return false;
        }
    }
    
    // Demais páginas são acessíveis para usuários logados
    return true;
}

// Logout
function logout() {
    try {
        // Adicionar delay extra para garantir que alerts.js esteja carregado
        setTimeout(() => {
            // Usar a função de alerta bonita se estiver disponível
            if (typeof confirmAction === 'function' || typeof window.confirmAction === 'function') {
                const confirmFunc = confirmAction || window.confirmAction;
                confirmFunc('Deseja realmente sair do sistema? Você precisará fazer login novamente para acessar o sistema.', 'Confirmar Logout')
                    .then((confirmed) => {
                        if (confirmed) {
                            // Confirmou o logout
                            if (menuMonitor) clearInterval(menuMonitor);
                            localStorage.clear();
                            sessionStorage.clear();
                            currentUser = null;
                            if (typeof showSuccess === 'function' || typeof window.showSuccess === 'function') {
                                const successFunc = showSuccess || window.showSuccess;
                                successFunc('Logout realizado com sucesso! Redirecionando...');
                                setTimeout(() => window.location.replace('login.html'), 1500);
                            } else {
                                window.location.replace('login.html');
                            }
                        } else {
                            // Cancelou o logout
                            if (typeof showInfo === 'function' || typeof window.showInfo === 'function') {
                                const infoFunc = showInfo || window.showInfo;
                                infoFunc('Logout cancelado.');
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('❌ Erro no modal de confirmação:', error);
                        // Fallback simples
                        if (confirm('Deseja realmente sair do sistema?')) {
                            if (menuMonitor) clearInterval(menuMonitor);
                            localStorage.clear();
                            sessionStorage.clear();
                            currentUser = null;
                            window.location.replace('login.html');
                        }
                    });
            } else {
                // Fallback para quando não há função de alerta
                if (confirm('Deseja realmente sair do sistema?')) {
                    if (menuMonitor) clearInterval(menuMonitor);
                    localStorage.clear();
                    sessionStorage.clear();
                    currentUser = null;
                    window.location.replace('login.html');
                }
            }
        }, 100); // Delay de 100ms para garantir que tudo esteja carregado
    } catch (error) {
        console.error('❌ Erro no logout:', error);
        // Fallback simples
        if (menuMonitor) clearInterval(menuMonitor);
        localStorage.clear();
        sessionStorage.clear();
        currentUser = null;
        window.location.replace('login.html');
    }
}

// INICIALIZAÇÃO PRINCIPAL
function initializeAuth() {
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // Se for login, não verificar
    if (currentPage === 'login.html' || currentPage === '' || currentPage === 'index.html') {
        return;
    }
    
    const authData = getUserData();
    
    if (!authData) {
        window.location.replace('login.html');
        return;
    }
    
    currentUser = authData.user;
    
    if (!checkPageAccess()) {
        // Usar alerta bonito se disponível
        setTimeout(() => {
            if (typeof showError === 'function' || typeof window.showError === 'function') {
                const errorFunc = showError || window.showError;
                errorFunc('Acesso Negado! Você não tem permissão para acessar esta página.');
            } else {
                alert('Acesso negado! Você não tem permissão para acessar esta página.');
            }
            
            // Redirecionar após o alerta
            setTimeout(() => {
                if (currentUser.role === 'admin') {
                    window.location.replace('usuarios.html');
                } else {
                    window.location.replace('inputs.html');
                }
            }, 2000);
        }, 100);
        return;
    }
    
    updateUserInterface();
    
    // MONITOR CONTÍNUO DO MENU ADMIN
    if (currentUser.role === 'admin') {
        menuMonitor = setInterval(() => {
            forceAdminMenu();
        }, 1000); // A cada 1 segundo
    }
    
    // Configurar logout
    setTimeout(() => {
        const logoutElements = document.querySelectorAll('a[href="login.html"], [data-action="logout"], .logout-btn, [onclick*="logout()"], button[title="Sair"]');
        logoutElements.forEach(el => {
            // Remover onclick inline se existir
            if (el.hasAttribute('onclick')) {
                el.removeAttribute('onclick');
            }
            
            // Remover listeners anteriores para evitar duplicação
            el.removeEventListener('click', handleLogoutClick);
            
            el.addEventListener('click', handleLogoutClick);
        });
    }, 500);
}

// Função separada para o click do logout
function handleLogoutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    logout();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    updateUserInterface(); // Força atualização
});

window.addEventListener('load', function() {
    if (currentUser) updateUserInterface();
});

// Garantir atualização em navegação
window.addEventListener('focus', function() {
    if (currentUser) {
        updateUserInterface();
        if (currentUser.role === 'admin') {
            forceAdminMenu();
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
