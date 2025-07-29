// Sistema de Autenticação de Páginas - ModelAI

class AuthGuard {
    constructor() {
        this.api = new ApiClient();
        this.currentUser = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Verificar se estamos na página de login
            if (window.location.pathname.includes('login.html')) {
                // Se já está logado, redirecionar
                if (this.api.isAuthenticated()) {
                    const user = this.api.getCurrentUser();
                    this.redirectAfterLogin(user);
                }
                this.isInitialized = true;
                return;
            }

            // Verificar autenticação
            if (!this.api.isAuthenticated()) {
                this.redirectToLogin('Você precisa estar logado para acessar esta página.');
                return;
            }

            // Verificar token com o servidor
            this.currentUser = await this.api.verifyAuth();
            
            // Configurar página baseado no usuário
            await this.setupPage();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Erro na autenticação:', error);
            this.redirectToLogin('Sua sessão expirou. Faça login novamente.');
        }
    }

    async setupPage() {
        if (!this.currentUser) return;

        // Atualizar informações do usuário na sidebar
        this.updateUserInfo();
        
        // Configurar navegação baseada no role
        this.setupNavigation();
        
        // Verificar permissões da página atual
        this.checkPagePermissions();
        
        // Evitar piscar da tela
        this.showPageContent();
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userIconEl = document.querySelector('.sidebar .w-8.h-8, .modern-sidebar .w-8.h-8');

        if (userNameEl) userNameEl.textContent = this.currentUser.name || 'Usuário';
        if (userEmailEl) userEmailEl.textContent = this.currentUser.email || '';

        // Configurar ícone baseado no role
        if (userIconEl) {
            if (this.currentUser.role === 'admin') {
                userIconEl.innerHTML = '<i class="fas fa-crown text-yellow-300"></i>';
                userIconEl.className = 'w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center';
            } else {
                userIconEl.innerHTML = '<i class="fas fa-user text-white"></i>';
                userIconEl.className = 'w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center';
            }
        }
    }

    setupNavigation() {
        // Remover aba de usuários se existir
        const existingUsersLink = document.querySelector('a[href="usuarios.html"], .nav-item[href="usuarios.html"]');
        if (existingUsersLink) {
            existingUsersLink.remove();
        }

        // Adicionar aba de usuários apenas para admins
        if (this.currentUser.role === 'admin') {
            this.addAdminNavigation();
        }
    }

    addAdminNavigation() {
        const nav = document.querySelector('nav, .navigation');
        if (!nav) return;

        // Verificar se já existe
        if (document.querySelector('a[href="usuarios.html"]')) return;

        const usuariosLink = document.createElement('a');
        usuariosLink.href = 'usuarios.html';
        
        // Verificar se estamos na página de usuários para marcar como ativa
        const isUsersPage = window.location.pathname.includes('usuarios.html');
        
        if (nav.querySelector('.nav-item')) {
            // Estilo moderno (usuarios.html)
            usuariosLink.className = `nav-item flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isUsersPage 
                    ? 'bg-teal-700 text-white' 
                    : 'text-teal-100 hover:bg-teal-700/50'
            }`;
            usuariosLink.innerHTML = `
                <i class="fas fa-users w-5"></i>
                <span>👑 Usuários (Admin)</span>
            `;
        } else {
            // Estilo clássico (outras páginas)
            usuariosLink.className = `sidebar-item flex items-center p-3 ${
                isUsersPage 
                    ? 'text-white active' 
                    : 'text-teal-200 hover:text-white'
            }`;
            usuariosLink.innerHTML = `
                <i class="fas fa-users sidebar-icon mr-3 text-lg"></i>
                <span class="font-medium sidebar-text">👑 Usuários (Admin)</span>
            `;
        }

        nav.appendChild(usuariosLink);
    }

    checkPagePermissions() {
        const currentPage = window.location.pathname;
        
        // Página de usuários só para admins
        if (currentPage.includes('usuarios.html') && this.currentUser.role !== 'admin') {
            showError('Acesso negado. Você não tem permissão para acessar esta página.');
            setTimeout(() => {
                window.location.href = 'inputs.html';
            }, 2000);
        }
    }

    showPageContent() {
        // Remover classe de carregamento se existir
        document.body.classList.remove('loading');
        
        // Mostrar conteúdo principal
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');
        
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
        
        if (sidebar) {
            sidebar.style.visibility = 'visible';
            sidebar.style.opacity = '1';
        }
    }

    redirectToLogin(message = '') {
        if (message) {
            localStorage.setItem('login_message', message);
        }
        window.location.href = '/login.html';
    }

    redirectAfterLogin(user) {
        if (user.role === 'admin') {
            window.location.href = '/usuarios.html';
        } else {
            window.location.href = '/inputs.html';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }
}

// Sistema de logout melhorado
async function logout() {
    const confirmed = await confirmAction(
        'Tem certeza que deseja sair da sua conta?',
        'Confirmar Logout'
    );

    if (confirmed) {
        try {
            // Limpar dados locais
            const api = new ApiClient();
            api.logout();
            
            // Mostrar mensagem de sucesso
            showSuccess('Logout realizado com sucesso!');
            
            // Redirecionar após um delay
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
            
        } catch (error) {
            console.error('Erro no logout:', error);
            showError('Erro ao fazer logout. Redirecionando...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        }
    }
}

// Instância global
const authGuard = new AuthGuard();

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Esconder conteúdo inicialmente para evitar piscar
    const mainContent = document.getElementById('mainContent');
    const sidebar = document.getElementById('sidebar');
    
    if (mainContent && !window.location.pathname.includes('login.html')) {
        mainContent.style.visibility = 'hidden';
        mainContent.style.opacity = '0';
        mainContent.style.transition = 'opacity 0.3s ease-in-out';
    }
    
    if (sidebar && !window.location.pathname.includes('login.html')) {
        sidebar.style.visibility = 'hidden';
        sidebar.style.opacity = '0';
        sidebar.style.transition = 'opacity 0.3s ease-in-out';
    }

    // Inicializar autenticação
    authGuard.init().catch(console.error);
});

// Exportar para uso global
window.authGuard = authGuard;
window.logout = logout;
