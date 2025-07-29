// Auth Guard - Sistema de Autenticação 100% FUNCIONAL
console.log('🔐 Auth Guard carregado');

// Estado global
let currentUser = null;
let isAuthChecked = false;

// Páginas que requerem autenticação (todas exceto login)
const PROTECTED_PAGES = ['usuarios.html', 'inputs.html', 'cenarios.html', 'resultados.html'];

// Páginas por role
const ADMIN_PAGES = ['usuarios.html', 'cenarios.html', 'resultados.html'];
const USER_PAGES = ['inputs.html', 'cenarios.html', 'resultados.html'];

// Função para verificar se a página atual é protegida
function isCurrentPageProtected() {
    const currentPage = window.location.pathname.split('/').pop();
    return PROTECTED_PAGES.includes(currentPage);
}

// Função para verificar se usuário tem acesso à página
function hasPageAccess(userRole, currentPage) {
    if (userRole === 'admin') {
        return ADMIN_PAGES.includes(currentPage);
    } else {
        return USER_PAGES.includes(currentPage);
    }
}

// Verificar autenticação
async function checkAuth() {
    if (isAuthChecked) return currentUser;
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        const userData = localStorage.getItem('user') || localStorage.getItem('modelai_user');
        
        if (!token || !userData) {
            console.log('❌ Token ou dados do usuário não encontrados');
            return null;
        }

        // Parse dos dados do usuário
        currentUser = JSON.parse(userData);
        console.log('✅ Usuário autenticado:', currentUser.name, '| Role:', currentUser.role);
        
        isAuthChecked = true;
        return currentUser;
        
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        localStorage.clear();
        return null;
    }
}

// Logout
function logout() {
    console.log('🚪 Realizando logout...');
    localStorage.clear();
    currentUser = null;
    isAuthChecked = false;
    window.location.replace('login.html');
}

// Atualizar informações do usuário na sidebar
function updateUserInfo() {
    if (!currentUser) return;
    
    console.log('👤 Atualizando info do usuário:', currentUser.name, 'Role:', currentUser.role);
    
    // Atualizar nome do usuário - buscar por diferentes IDs
    const userNameElement = document.querySelector('#user-name') || 
                           document.querySelector('#userName') || 
                           document.querySelector('.user-name') || 
                           document.querySelector('[data-user-name]');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
        console.log('✅ Nome atualizado:', currentUser.name);
    } else {
        console.log('⚠️ Elemento de nome do usuário não encontrado');
    }
    
    // Atualizar ícone baseado no role - SEMPRE correto
    const userIcon = document.querySelector('#user-icon') || 
                    document.querySelector('.user-icon') || 
                    document.querySelector('[data-user-icon]');
    
    if (userIcon) {
        // Limpar todas as classes de ícone e adicionar a correta
        userIcon.className = 'fas text-white text-xl';
        
        if (currentUser.role === 'admin') {
            userIcon.classList.add('fa-crown');
            console.log('👑 Ícone definido como CROWN para admin');
        } else {
            userIcon.classList.add('fa-user');
            console.log('� Ícone definido como USER para usuário comum');
        }
    } else {
        console.log('⚠️ Elemento de ícone do usuário não encontrado');
    }
    
    // Atualizar email se existir
    const userEmailElement = document.querySelector('#userEmail');
    if (userEmailElement && currentUser.email) {
        userEmailElement.textContent = currentUser.email;
    }
    
    // Mostrar/ocultar menu de usuários baseado no role
    const usuariosLink = document.querySelector('a[href="usuarios.html"], [data-page="usuarios"]');
    if (usuariosLink) {
        const usuariosItem = usuariosLink.closest('.sidebar-item, .nav-item');
        if (usuariosItem) {
            if (currentUser.role === 'admin') {
                usuariosItem.style.display = 'block';
                console.log('👑 Menu de usuários MOSTRADO para admin');
            } else {
                usuariosItem.style.display = 'none';
                console.log('👤 Menu de usuários OCULTO para usuário comum');
            }
        }
    }
}

// Configurar links de logout
function setupLogoutLinks() {
    const logoutLinks = document.querySelectorAll('a[href="login.html"], [data-action="logout"], .logout-btn');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Inicialização principal
async function init() {
    console.log('🚀 Inicializando Auth Guard...');
    
    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Página atual:', currentPage);
    
    // Se estiver na página de login, não fazer verificação
    if (currentPage === 'login.html' || currentPage === '') {
        console.log('📝 Página de login - sem verificação necessária');
        return;
    }
    
    // Verificar autenticação
    const user = await checkAuth();
    
    if (!user) {
        console.log('❌ Usuário não autenticado - redirecionando para login');
        localStorage.setItem('login_message', 'Sessão expirada. Faça login novamente.');
        window.location.replace('login.html');
        return;
    }
    
    // Verificar se tem acesso à página atual
    if (!hasPageAccess(user.role, currentPage)) {
        console.log('🚫 Acesso negado para:', currentPage, 'Role:', user.role);
        
        // Redirecionar para página apropriada
        if (user.role === 'admin') {
            console.log('👑 Redirecionando admin para usuarios.html');
            window.location.replace('usuarios.html');
        } else {
            console.log('👤 Redirecionando usuário para inputs.html');
            window.location.replace('inputs.html');
        }
        return;
    }
    
    console.log('✅ Acesso permitido para:', currentPage, 'Role:', user.role);
    
    // Atualizar UI
    updateUserInfo();
    setupLogoutLinks();
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);

// Exportar funções para uso global
window.authGuard = {
    checkAuth,
    logout,
    updateUserInfo,
    getCurrentUser: () => currentUser
};

console.log('🔐 Auth Guard configurado com sucesso');
