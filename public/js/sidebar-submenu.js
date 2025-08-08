// sidebar-submenu.js - Controla o comportamento dos submenus da sidebar

document.addEventListener('DOMContentLoaded', function() {
    initializeSubmenuBehavior();
});

function initializeSubmenuBehavior() {
    initializeAnaliseVPLMenu();
    initializeControladoriaMenu();
}

function initializeAnaliseVPLMenu() {
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
        showAnaliseVPLSubmenu();
        analiseVPLToggle.classList.add('active');
        // Garantir que as classes de cor estejam corretas
        analiseVPLToggle.classList.remove('text-teal-200');
        analiseVPLToggle.classList.add('text-white');
    } else {
        hideAnaliseVPLSubmenu();
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
            hideAnaliseVPLSubmenu();
        } else {
            showAnaliseVPLSubmenu();
        }
    });
    
    // Funções auxiliares para Análise VPL
    function showAnaliseVPLSubmenu() {
        analiseVPLSubmenu.classList.remove('hidden');
        analiseVPLChevron.classList.remove('fa-chevron-right');
        analiseVPLChevron.classList.add('fa-chevron-down');
        analiseVPLChevron.style.transform = '';
    }
    
    function hideAnaliseVPLSubmenu() {
        analiseVPLSubmenu.classList.add('hidden');
        analiseVPLChevron.classList.remove('fa-chevron-down');
        analiseVPLChevron.classList.add('fa-chevron-right');
        analiseVPLChevron.style.transform = '';
    }
}

function initializeControladoriaMenu() {
    const controladoriaToggle = document.getElementById('controladoriaToggle');
    const controladoriaSubmenu = document.getElementById('controladoriaSubmenu');
    const controladoriaChevron = document.getElementById('controladoriaChevron');
    
    if (!controladoriaToggle || !controladoriaSubmenu || !controladoriaChevron) {
        return; // Elementos não encontrados, sair da função
    }
    
    // Verificar se estamos em uma das páginas de Controladoria
    const currentPage = window.location.pathname.split('/').pop();
    const controladoriaPages = ['fluxo-caixa.html', 'vendas.html', 'inadimplencia.html', 'orcamento.html', 'obra.html', 'despesas.html'];
    const isControladoriaPage = controladoriaPages.includes(currentPage);
    
    // Se estivermos em uma página Controladoria, manter o submenu aberto
    if (isControladoriaPage) {
        showControladoriaSubmenu();
        controladoriaToggle.classList.add('active');
        // Garantir que as classes de cor estejam corretas
        controladoriaToggle.classList.remove('text-teal-200');
        controladoriaToggle.classList.add('text-white');
    } else {
        hideControladoriaSubmenu();
        controladoriaToggle.classList.remove('active');
        // Garantir que as classes de cor estejam corretas para estado inativo
        controladoriaToggle.classList.remove('text-white');
        controladoriaToggle.classList.add('text-teal-200');
    }
    
    // Adicionar evento de clique para expandir/recolher
    controladoriaToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = !controladoriaSubmenu.classList.contains('hidden');
        
        if (isExpanded) {
            hideControladoriaSubmenu();
        } else {
            showControladoriaSubmenu();
        }
    });
    
    // Funções auxiliares para Controladoria
    function showControladoriaSubmenu() {
        controladoriaSubmenu.classList.remove('hidden');
        controladoriaChevron.classList.remove('fa-chevron-right');
        controladoriaChevron.classList.add('fa-chevron-down');
        controladoriaChevron.style.transform = '';
    }
    
    function hideControladoriaSubmenu() {
        controladoriaSubmenu.classList.add('hidden');
        controladoriaChevron.classList.remove('fa-chevron-down');
        controladoriaChevron.classList.add('fa-chevron-right');
        controladoriaChevron.style.transform = '';
    }
}

// Manter o comportamento responsivo para ambos os menus
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobileOverlay');

// Fechar sidebar no mobile quando clicar em um link de submenu
if (sidebar && mobileOverlay) {
    const allSubmenuLinks = document.querySelectorAll('.sidebar-subitem');
    allSubmenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 1024) { // Breakpoint lg
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            }
        });
    });
}
