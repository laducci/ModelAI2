// Common Sidebar JavaScript - Model AI

// Sidebar toggle functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');

    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
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
            // Adicionar aba de usuários no menu
            const nav = document.querySelector('nav');
            if (nav && !document.querySelector('a[href="usuarios.html"]')) {
                const usuariosLink = document.createElement('a');
                usuariosLink.href = 'usuarios.html';
                usuariosLink.className = 'nav-item flex items-center space-x-3 p-3 rounded-lg text-teal-100 hover:bg-teal-700/50 transition-colors';
                usuariosLink.innerHTML = `
                    <i class="fas fa-users w-5"></i>
                    <span>👑 Usuários (Admin)</span>
                `;
                nav.appendChild(usuariosLink);
            }
            
            // Adicionar ícone de coroa no info do usuário
            const userIcon = document.querySelector('.sidebar .w-8.h-8');
            if (userIcon) {
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
