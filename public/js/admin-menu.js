
// ADMIN MENU - VERSÃO ISOLADA (NÃO INTERFERE COM PERFIL)


// Função ISOLADA para mostrar aba usuários (não mexe no perfil)
function showUsersTabForAdmin() {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
        
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        
        
        // APENAS mexer com a aba usuários, nada mais!
        if (user.role === 'admin' || user.tipo === 'admin') {
            const adminUsersLink = document.getElementById('adminUsersLink');
            if (adminUsersLink) {
                adminUsersLink.style.display = 'flex';
                
            } else {
                
            }
        } else {
            const adminUsersLink = document.getElementById('adminUsersLink');
            if (adminUsersLink) {
                adminUsersLink.style.display = 'none';
                
            }
        }
    } catch (error) {
        console.error('❌ Erro admin menu:', error);
    }
}

// Executar IMEDIATAMENTE mas só mexer na aba usuários
showUsersTabForAdmin();

// Executar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showUsersTabForAdmin);
} else {
    // DOM já está pronto
    showUsersTabForAdmin();
}
