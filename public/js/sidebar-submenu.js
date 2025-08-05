// sidebar-submenu.js - Controla o comportamento dos submenus da sidebar

document.addEventListener('DOMContentLoaded', function() {
    initializeSubmenuBehavior();
});

function initializeSubmenuBehavior() {
    const analiseVPLToggle = document.getElementById('analiseVPLToggle');
    const analiseVPLSubmenu = document.getElementById('analiseVPLSubmenu');
    const analiseVPLChevron = document.getElementById('analiseVPLChevron');
    
    if (!analiseVPLToggle || !analiseVPLSubmenu || !analiseVPLChevron) {
        return; // Elementos não encontrados, sair da função
    }
    
    // Verificar se estamos em uma das páginas de Análise VPL
    const currentPage = window.location.pathname.split('/').pop();
    const vplPages = ['inputs.html', 'cenarios.html', 'resultados.html'];
    const isVPLPage = vplPages.includes(currentPage);
    
    // Se estivermos em uma página VPL, manter o submenu aberto
    if (isVPLPage) {
        showSubmenu();
        analiseVPLToggle.classList.add('active');
        // Garantir que as classes de cor estejam corretas
        analiseVPLToggle.classList.remove('text-teal-200');
        analiseVPLToggle.classList.add('text-white');
    } else {
        hideSubmenu();
        analiseVPLToggle.classList.remove('active');
        // Garantir que as classes de cor estejam corretas para estado inativo
        analiseVPLToggle.classList.remove('text-white');
        analiseVPLToggle.classList.add('text-teal-200');
    }
    
    // Adicionar evento de clique para expandir/recolher
    analiseVPLToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = !analiseVPLSubmenu.classList.contains('hidden');
        
        if (isExpanded) {
            hideSubmenu();
        } else {
            showSubmenu();
        }
    });
    
    // Manter o comportamento responsivo
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    // Fechar sidebar no mobile quando clicar em um link do submenu
    const submenuLinks = analiseVPLSubmenu.querySelectorAll('a');
    submenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 1024) { // Breakpoint lg
                sidebar.classList.add('-translate-x-full');
                if (mobileOverlay) {
                    mobileOverlay.classList.add('hidden');
                }
            }
        });
    });
    
    // Funções auxiliares
    function showSubmenu() {
        analiseVPLSubmenu.classList.remove('hidden');
        analiseVPLChevron.classList.remove('fa-chevron-right');
        analiseVPLChevron.classList.add('fa-chevron-down');
        // Remover qualquer transform manual para evitar bugs
        analiseVPLChevron.style.transform = '';
    }
    
    function hideSubmenu() {
        analiseVPLSubmenu.classList.add('hidden');
        analiseVPLChevron.classList.remove('fa-chevron-down');
        analiseVPLChevron.classList.add('fa-chevron-right');
        // Remover qualquer transform manual para evitar bugs
        analiseVPLChevron.style.transform = '';
    }
}
