// Auth Guard - SISTEMA DE PRODUÇÃO FINAL
console.log('🔐 AUTH GUARD PRODUÇÃO - INICIANDO...');

// Estado global
let currentUser = null;
let isInitialized = false;

// Configurações da plataforma
const CONFIG = {
    PROTECTED_PAGES: ['usuarios.html', 'inputs.html', 'cenarios.html', 'resultados.html'],
    ADMIN_PAGES: ['usuarios.html', 'cenarios.html', 'inputs.html', 'resultados.html'],
    USER_PAGES: ['inputs.html', 'cenarios.html', 'resultados.html']
};

// Função para buscar dados do usuário do localStorage
function getUserData() {
    try {
        // Buscar dados salvos no login
        let userData = null;
        let token = null;

        // Tentar diferentes chaves onde os dados podem estar
        const userKeys = ['user', 'modelai_user'];
        const tokenKeys = ['token', 'modelai_token'];

        for (let key of userKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    userData = JSON.parse(data);
                    console.log('✅ Dados do usuário encontrados em:', key);
                    break;
                } catch (e) {
                    console.log('❌ Erro ao parsear dados em:', key);
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
            console.log('❌ Dados de autenticação não encontrados');
            return null;
        }

        return { user: userData, token: token };
    } catch (error) {
        console.error('❌ Erro ao buscar dados de autenticação:', error);
        return null;
    }
}

// Função para atualizar a interface baseada no usuário
function updateUserInterface() {
    if (!currentUser) {
        console.log('❌ Nenhum usuário para atualizar interface');
        return;
    }

    console.log('🎨 ATUALIZANDO INTERFACE - Usuário:', currentUser.name, 'Role:', currentUser.role);

    // 1. ATUALIZAR NOME DO USUÁRIO
    setTimeout(() => {
        const nameElements = document.querySelectorAll('#user-name, #userName, .user-name');
        nameElements.forEach(element => {
            if (element) {
                element.textContent = currentUser.name;
                console.log('✅ Nome atualizado:', currentUser.name);
            }
        });
    }, 100);

    // 2. ATUALIZAR ÍCONE DO PERFIL
    setTimeout(() => {
        const iconElements = document.querySelectorAll('#user-icon, .user-icon');
        iconElements.forEach(icon => {
            if (icon) {
                // Limpar todas as classes de ícone
                icon.className = 'fas text-white';
                
                // Definir ícone baseado no role
                if (currentUser.role === 'admin') {
                    icon.classList.add('fa-crown');
                    console.log('👑 Ícone ADMIN (coroa) definido');
                } else {
                    icon.classList.add('fa-user');
                    console.log('👤 Ícone USER (pessoa) definido');
                }
            }
        });
    }, 150);

    // 3. CONTROLAR MENU DE USUÁRIOS - SUPER CRÍTICO!
    setTimeout(() => {
        const menuUsuarios = document.querySelector('a[href="usuarios.html"]');
        console.log('🔍 Procurando menu de usuários...', menuUsuarios ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
        
        if (menuUsuarios) {
            const menuItem = menuUsuarios.closest('.sidebar-item, .nav-item');
            console.log('🔍 Item do menu encontrado:', menuItem ? 'SIM' : 'NÃO');
            
            if (menuItem) {
                if (currentUser.role === 'admin') {
                    // ADMIN: FORÇA mostrar menu de usuários
                    menuItem.style.display = 'flex';
                    menuItem.style.visibility = 'visible';
                    menuItem.style.opacity = '1';
                    menuItem.style.pointerEvents = 'auto';
                    menuItem.classList.remove('hidden');
                    console.log('👑 Menu USUÁRIOS FORÇADO VISÍVEL para admin');
                } else {
                    // USER: FORÇA esconder menu de usuários
                    menuItem.style.display = 'none';
                    menuItem.style.visibility = 'hidden';
                    menuItem.style.opacity = '0';
                    menuItem.style.pointerEvents = 'none';
                    menuItem.classList.add('hidden');
                    console.log('👤 Menu USUÁRIOS FORÇADO OCULTO para usuário');
                }
            }
        }
        
        // FORÇA ADICIONAL: Buscar em todos os elementos possíveis
        const allUsuariosLinks = document.querySelectorAll('[href="usuarios.html"], [data-page="usuarios"], .usuarios-menu');
        allUsuariosLinks.forEach(link => {
            const item = link.closest('.sidebar-item, .nav-item, .menu-item');
            if (item) {
                if (currentUser.role === 'admin') {
                    item.style.display = 'flex';
                    item.style.visibility = 'visible';
                    item.classList.remove('hidden');
                } else {
                    item.style.display = 'none';
                    item.style.visibility = 'hidden';
                    item.classList.add('hidden');
                }
            }
        });
        
    }, 200);

    // 4. ATUALIZAR EMAIL
    setTimeout(() => {
        const emailElements = document.querySelectorAll('#userEmail, .user-email');
        emailElements.forEach(element => {
            if (element && currentUser.email) {
                element.textContent = currentUser.email;
            }
        });
    }, 250);
}

// Função para verificar se usuário tem acesso à página atual
function checkPageAccess() {
    if (!currentUser) return false;

    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Verificando acesso - Página:', currentPage, 'Role:', currentUser.role);

    // Admin tem acesso a todas as páginas admin
    if (currentUser.role === 'admin') {
        const hasAccess = CONFIG.ADMIN_PAGES.includes(currentPage);
        console.log('👑 Admin - Acesso à', currentPage, ':', hasAccess ? 'PERMITIDO' : 'NEGADO');
        return hasAccess;
    } else {
        // Usuário comum só acessa páginas permitidas
        const hasAccess = CONFIG.USER_PAGES.includes(currentPage);
        console.log('👤 User - Acesso à', currentPage, ':', hasAccess ? 'PERMITIDO' : 'NEGADO');
        return hasAccess;
    }
}

// Função para redirecionar para página apropriada
function redirectToCorrectPage() {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
        console.log('👑 Redirecionando admin para página de usuários');
        window.location.replace('usuarios.html');
    } else {
        console.log('👤 Redirecionando usuário para página de inputs');
        window.location.replace('inputs.html');
    }
}

// Função de logout
function logout() {
    console.log('🚪 Realizando logout...');
    
    // Limpar todos os dados
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset variáveis
    currentUser = null;
    isInitialized = false;
    
    // Redirecionar para login
    window.location.replace('login.html');
}

// Configurar botões/links de logout
function setupLogoutHandlers() {
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
    
    console.log('🔗 Handlers de logout configurados');
}

// INICIALIZAÇÃO PRINCIPAL
async function initializeAuth() {
    if (isInitialized) {
        console.log('⚠️ Auth já inicializado, forçando atualização da UI...');
        if (currentUser) {
            updateUserInterface();
        }
        return;
    }

    console.log('🚀 INICIALIZANDO SISTEMA DE AUTENTICAÇÃO...');

    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Página atual:', currentPage);

    // Se for página de login, não verificar auth
    if (currentPage === 'login.html' || currentPage === '' || currentPage === 'index.html') {
        console.log('📝 Página de login - pular verificação');
        isInitialized = true;
        return;
    }

    // Buscar dados de autenticação
    const authData = getUserData();
    
    if (!authData) {
        console.log('❌ Usuário não autenticado - redirecionando para login');
        localStorage.setItem('login_message', 'Você precisa fazer login para acessar esta página.');
        window.location.replace('login.html');
        return;
    }

    // Definir usuário atual
    currentUser = authData.user;
    console.log('✅ USUÁRIO AUTENTICADO:', currentUser.name, '| Role:', currentUser.role);

    // Verificar se tem acesso à página atual
    if (!checkPageAccess()) {
        console.log('🚫 Acesso negado à página atual - redirecionando');
        redirectToCorrectPage();
        return;
    }

    console.log('✅ Acesso autorizado à página:', currentPage);

    // Atualizar interface do usuário
    updateUserInterface();
    
    // Configurar logout
    setupLogoutHandlers();
    
    // Marcar como inicializado
    isInitialized = true;
    
    console.log('🎉 AUTENTICAÇÃO INICIALIZADA COM SUCESSO!');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM carregado - inicializando autenticação...');
    setTimeout(() => {
        initializeAuth();
    }, 100);
});

// Forçar atualização da UI quando a página carregar completamente
window.addEventListener('load', function() {
    console.log('🌐 Página carregada - garantindo UI atualizada...');
    setTimeout(() => {
        if (currentUser) {
            updateUserInterface();
        }
    }, 200);
});

// Garantir atualização da UI ao navegar entre páginas
window.addEventListener('focus', function() {
    if (currentUser && isInitialized) {
        console.log('👁️ Página focada - atualizando UI...');
        updateUserInterface();
    }
});

// FUNÇÃO EXTRA: Monitorar constantemente o menu de usuários para admin
function monitorAdminMenu() {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    const menuUsuarios = document.querySelector('a[href="usuarios.html"]');
    if (menuUsuarios) {
        const menuItem = menuUsuarios.closest('.sidebar-item, .nav-item');
        if (menuItem) {
            // Se o menu estiver oculto para admin, FORÇAR mostrar
            const isHidden = menuItem.style.display === 'none' || 
                           menuItem.style.visibility === 'hidden' || 
                           menuItem.classList.contains('hidden');
            
            if (isHidden) {
                console.log('🚨 DETECTADO: Menu de usuários oculto para admin - CORRIGINDO!');
                menuItem.style.display = 'flex';
                menuItem.style.visibility = 'visible';
                menuItem.style.opacity = '1';
                menuItem.classList.remove('hidden');
            }
        }
    }
}

// Executar monitoramento a cada 2 segundos
setInterval(() => {
    if (currentUser && currentUser.role === 'admin') {
        monitorAdminMenu();
    }
}, 2000);

// Exportar funções para uso global
window.authGuard = {
    getCurrentUser: () => currentUser,
    logout: logout,
    updateUI: updateUserInterface,
    forceUpdate: () => {
        if (currentUser) {
            updateUserInterface();
        }
    },
    reinitialize: () => {
        isInitialized = false;
        initializeAuth();
    }
};

// Função global de logout
window.logout = logout;

console.log('🔐 AUTH GUARD PRODUÇÃO - CONFIGURADO E PRONTO!');
