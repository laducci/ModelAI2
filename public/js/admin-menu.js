

// Função para forçar exibição da aba de usuários para admins
function forceAdminMenuVisibility() {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) return;
    
    try {
        const user = JSON.parse(userData);
        if (user.role !== 'admin') return;
        
        // Encontrar o container de navegação
        const nav = document.querySelector('nav .space-y-2, nav');
        if (!nav) return;
        
        // Verificar se já existe link de usuários
        const existingLink = document.querySelector('a[href="usuarios.html"]');
        if (existingLink) {
            // Garantir que está visível
            existingLink.style.display = 'flex';
            existingLink.closest('li, .sidebar-item, .nav-item')?.classList.remove('hidden');
            return;
        }
        
        // Criar link de usuários se não existir
        const usuariosLink = document.createElement('a');
        usuariosLink.href = 'usuarios.html';
        usuariosLink.className = 'sidebar-item flex items-center p-3 text-teal-200 hover:text-white';
        
        // Marcar como ativo se estivermos na página de usuários
        if (window.location.pathname.includes('usuarios.html')) {
            usuariosLink.className = 'sidebar-item active flex items-center p-3 text-white';
        }
        
        usuariosLink.innerHTML = `
            <i class="fas fa-users sidebar-icon mr-3 text-lg"></i>
            <span class="font-medium sidebar-text">Usuários</span>
        `;
        
        // Inserir após o link de resultados
        const resultadosLink = document.querySelector('a[href="resultados.html"]');
        if (resultadosLink && resultadosLink.parentNode) {
            resultadosLink.parentNode.insertBefore(usuariosLink, resultadosLink.nextSibling);
        } else {
            // Se não encontrar, adicionar no final da navegação
            nav.appendChild(usuariosLink);
        }
        
        
    } catch (error) {
        console.error('❌ Erro ao inserir menu admin:', error);
    }
}

// Função para atualizar informações do usuário na interface
function updateAdminUserInfo() {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
        const user = JSON.parse(userData);
        
        // Atualizar nome do usuário
        const nameElements = document.querySelectorAll('#user-name, #userName, .user-name');
        nameElements.forEach(el => {
            if (el) el.textContent = user.name;
        });
        
        // Atualizar email do usuário
        const emailElements = document.querySelectorAll('#userEmail, .user-email');
        emailElements.forEach(el => {
            if (el) el.textContent = user.email;
        });
        
        // Atualizar ícone do usuário
        const iconElements = document.querySelectorAll('#user-icon, .user-icon');
        iconElements.forEach(icon => {
            if (icon) {
                icon.className = 'fas text-white';
                if (user.role === 'admin') {
                    icon.classList.add('fa-crown');
                } else {
                    icon.classList.add('fa-user');
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar info do usuário:', error);
    }
}

// Inicialização quando DOM estiver pronto
function initAdminMenu() {
    
    // Executar imediatamente
    forceAdminMenuVisibility();
    updateAdminUserInfo();
    
    // Executar novamente após um delay para garantir que a página está totalmente carregada
    setTimeout(() => {
        forceAdminMenuVisibility();
        updateAdminUserInfo();
    }, 500);
    
    // Monitor contínuo para garantir que o menu sempre apareça
    setInterval(() => {
        forceAdminMenuVisibility();
    }, 2000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', initAdminMenu);
window.addEventListener('load', initAdminMenu);

// Executar quando a página ganha foco (navegação entre abas)
window.addEventListener('focus', () => {
    setTimeout(forceAdminMenuVisibility, 100);
});

// Exportar funções
window.adminMenu = {
    forceVisibility: forceAdminMenuVisibility,
    updateUserInfo: updateAdminUserInfo
};

