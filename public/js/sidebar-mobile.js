// Sidebar Mobile Controller - Versão Padrão Unificada
document.addEventListener('DOMContentLoaded', function() {
    // Só executa no mobile (< 1024px)
    if (window.innerWidth >= 1024) return;
    
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const mainContent = document.getElementById('mainContent');

    // Função para abrir sidebar mobile
    function openMobileSidebar() {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }

    // Função para fechar sidebar mobile
    function closeMobileSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    // Event listener para botão do header mobile
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openMobileSidebar();
        });
    }

    // Fechar overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeMobileSidebar();
        });
    }

    // Fechar menu ao clicar em links
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileSidebar();
        });
    });

    // Inicialização mobile
    function initializeMobileSidebar() {
        // Sidebar sempre oculta por padrão no mobile
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        
        // Main content ocupa tela inteira
        if (mainContent) {
            mainContent.classList.remove('lg:ml-72');
            mainContent.classList.add('ml-0');
        }
        
        console.log('✅ Sidebar Mobile inicializada');
    }

    // Monitorar redimensionamento (só para garantir)
    window.addEventListener('resize', function() {
        if (window.innerWidth < 1024) {
            initializeMobileSidebar();
        }
    });

    // Executar inicialização
    initializeMobileSidebar();
});
