
// ADMIN MENU - VERSÃO ISOLADA (NÃO INTERFERE COM PERFIL)
console.log('🔧 Admin Menu carregado!');

// Função ISOLADA para mostrar aba usuários (não mexe no perfil)
function showUsersTabForAdmin() {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
        console.log('❌ Nenhum usuário logado');
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('👤 Admin Menu - Verificando usuário:', user.name, 'Role:', user.role);
        
        // APENAS mexer com a aba usuários, nada mais!
        if (user.role === 'admin' || user.tipo === 'admin') {
            const adminUsersLink = document.getElementById('adminUsersLink');
            if (adminUsersLink) {
                adminUsersLink.style.display = 'flex';
                console.log('✅ Aba usuários MOSTRADA para admin:', user.name);
            } else {
                console.log('⚠️ Elemento adminUsersLink não encontrado');
            }
        } else {
            const adminUsersLink = document.getElementById('adminUsersLink');
            if (adminUsersLink) {
                adminUsersLink.style.display = 'none';
                console.log('❌ Aba usuários escondida para usuário normal:', user.name);
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
