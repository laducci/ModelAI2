// Common Sidebar JavaScript - Model AI

// Estado da sidebar
let sidebarCollapsed = false;

// Sidebar toggle functionality com animação suave
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleSidebar();
        });
    }

    // Adicionar listeners para elementos que devem desaparecer quando collapsed
    setupSidebarTextElements();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarTexts = document.querySelectorAll('.sidebar-text');
    const toggleIcon = document.querySelector('#toggleSidebar i');
    
    if (!sidebar) return;

    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        // Colapsar sidebar usando classes CSS
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
        
        // Rotacionar ícone
        if (toggleIcon) {
            toggleIcon.style.transform = 'rotate(180deg)';
        }
        
    } else {
        // Expandir sidebar
        sidebar.classList.remove('collapsed');
        if (mainContent) {
            mainContent.classList.remove('expanded');
        }
        
        // Rotacionar ícone de volta
        if (toggleIcon) {
            toggleIcon.style.transform = 'rotate(0deg)';
        }
    }
}

function setupSidebarTextElements() {
    // Configurar transição do ícone de toggle
    const toggleIcon = document.querySelector('#toggleSidebar i');
    if (toggleIcon) {
        toggleIcon.style.transition = 'transform 0.5s ease';
    }
    
    // Aplicar transitions CSS diretamente aos elementos da sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
}

// Responsive handling
function handleSidebarResize() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar && mainContent) {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
}

// Adicionar aba de usuários para administradores
async function setupAdminNavigation() {
    try {
        if (!api.isAuthenticated()) return;
        
        const userProfile = await api.getProfile();
        
        if (userProfile.user.role === 'admin') {
            // DESABILITADO - Menu já está fixo no HTML das páginas
            // Não adicionar menu duplicado na própria página de usuários
            // const currentPage = window.location.pathname.split('/').pop();
            // if (currentPage !== 'usuarios.html') {
            //     // Verificar se já existe o link de usuários
            //     const existingUsersLink = document.querySelector('a[href="usuarios.html"]');
            //     if (!existingUsersLink) {
            //         // Adicionar aba de usuários no menu
            //         const nav = document.querySelector('nav');
            //         if (nav) {
            //             const usuariosLink = document.createElement('a');
            //             usuariosLink.href = 'usuarios.html';
            //             usuariosLink.className = 'nav-item flex items-center space-x-3 p-3 rounded-lg text-teal-100 hover:bg-teal-700/50 transition-colors';
            //             usuariosLink.innerHTML = `
            //                 <i class="fas fa-users w-5"></i>
            //                 <span>👑 Usuários (Admin)</span>
            //             `;
            //             nav.appendChild(usuariosLink);
            //         }
            //     }
            // }
            
            // Adicionar ícone de coroa no info do usuário
            const userIcon = document.querySelector('.sidebar .w-8.h-8, .sidebar .w-10.h-10');
            if (userIcon && !userIcon.querySelector('.fa-crown')) {
                userIcon.innerHTML = '<i class="fas fa-crown text-yellow-300"></i>';
                userIcon.classList.add('bg-teal-500');
            }
        }
    } catch (error) {
        console.error('Erro ao configurar navegação admin:', error);
    }
}

// Atualizar informações do usuário no sidebar
async function updateUserInfo() {
    try {
        if (!api.isAuthenticated()) return;
        
        const userProfile = await api.getProfile();
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        
        if (userNameEl) userNameEl.textContent = userProfile.user.name;
        if (userEmailEl) userEmailEl.textContent = userProfile.user.email;
        
    } catch (error) {
        console.error('Erro ao atualizar info do usuário:', error);
    }
}

// Função de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        api.logout();
        window.location.href = '/login.html';
    }
}

// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    handleSidebarResize();
    window.addEventListener('resize', handleSidebarResize);
});
