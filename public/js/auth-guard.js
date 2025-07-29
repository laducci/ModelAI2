// Sistema de Autenticação de Páginas - ModelAI

class AuthGuard {
    constructor() {
        this.api = new ApiClient();
        this.currentUser = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🔐 AuthGuard na página:', window.location.pathname);
        
        try {
            // Página de login - sem complicação
            if (window.location.pathname.includes('login.html')) {
                if (this.api.isAuthenticated()) {
                    const user = this.api.getCurrentUser();
                    if (user?.role === 'admin') {
                        window.location.href = 'usuarios.html';
                    } else {
                        window.location.href = 'inputs.html';
                    }
                }
                this.isInitialized = true;
                return;
            }

            // Verificar autenticação - simples
            if (!this.api.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            this.currentUser = this.api.getCurrentUser();
            if (!this.currentUser || !this.currentUser._id) {
                window.location.href = 'login.html';
                return;
            }
            
            // Configurar página
            this.updateUserInfo();
            this.setupNavigation();
            this.checkPagePermissions();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Erro:', error);
            window.location.href = 'login.html';
        }
    }

    async setupPage() {
        if (!this.currentUser) return;

        // Simples - só atualizar info e navegação
        this.updateUserInfo();
        this.setupNavigation();
        this.checkPagePermissions();
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userIconEl = document.querySelector('.sidebar .w-8.h-8, .modern-sidebar .w-8.h-8, .w-10.h-10');

        if (userNameEl) userNameEl.textContent = this.currentUser.name || 'Usuário';
        if (userEmailEl) userEmailEl.textContent = this.currentUser.email || '';

        // Configurar ícone baseado no role
        if (userIconEl) {
            if (this.currentUser.role === 'admin') {
                userIconEl.innerHTML = '<i class="fas fa-crown text-white"></i>';
                userIconEl.className = 'w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center';
            } else {
                userIconEl.innerHTML = '<i class="fas fa-user text-white"></i>';
                userIconEl.className = 'w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center';
            }
        }

        console.log('👤 Informações do usuário atualizadas:', {
            name: this.currentUser.name,
            email: this.currentUser.email,
            role: this.currentUser.role
        });
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
        console.log('✨ Exibindo conteúdo da página...');
        // Não precisamos mais de manipulação complexa - deixar o CSS cuidar
    }

    redirectToLogin(message = '') {
        // Evitar loop se já estamos na página de login
        if (window.location.pathname.includes('login.html')) {
            console.log('🔄 Já na página de login, evitando loop');
            return;
        }
        
        console.log('🚪 Redirecionando para login:', message);
        
        // Só salvar mensagem se for importante e não for acesso direto à página
        if (message && !message.includes('Você precisa estar logado para acessar esta página')) {
            localStorage.setItem('login_message', message);
        }
        
        // Fade out antes de redirecionar para evitar piscar
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');
        
        if (mainContent) {
            mainContent.style.opacity = '0';
        }
        if (sidebar) {
            sidebar.style.opacity = '0';
        }
        
        // Delay maior para suavizar transição
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 300);
    }

    redirectAfterLogin(user) {
        // Evitar redirecionamento se já estamos na página correta
        const currentPath = window.location.pathname;
        const targetPath = user.role === 'admin' ? '/usuarios.html' : '/inputs.html';
        
        if (currentPath.includes(targetPath.substring(1))) {
            console.log('🎯 Já na página correta, não redirecionando');
            return;
        }
        
        console.log('🏠 Redirecionando após login para:', targetPath);
        
        // Delay maior para evitar piscar
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = '/usuarios.html';
            } else {
                window.location.href = '/inputs.html';
            }
        }, 1000);
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
    console.log('🌟 DOM carregado, configurando AuthGuard...');
    
    // Esconder conteúdo inicialmente para evitar piscar (apenas se não for login)
    if (!window.location.pathname.includes('login.html')) {
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');
        
        if (mainContent) {
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
            mainContent.style.transition = 'opacity 0.5s ease-in-out';
        }
        
        if (sidebar) {
            sidebar.style.visibility = 'hidden';
            sidebar.style.opacity = '0';
            sidebar.style.transition = 'opacity 0.5s ease-in-out';
        }
        
        // Adicionar classe de loading ao body
        document.body.classList.add('loading');
    }

    // Pequeno delay antes de inicializar para evitar conflitos
    setTimeout(() => {
        authGuard.init().catch(console.error);
    }, 100);
});

// Exportar para uso global
window.authGuard = authGuard;
window.logout = logout;
