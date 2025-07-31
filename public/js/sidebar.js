// Sidebar Controller - APENAS DESKTOP (≥ 1024px)
document.addEventListener('DOMContentLoaded', function() {
    // Só executa no desktop (≥ 1024px)
    if (window.innerWidth < 1024) return;
    
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    // Função para toggle do desktop
    function toggleDesktopSidebar() {
        sidebar.classList.toggle('collapsed');
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }
        
        // Animação do ícone APENAS no desktop
        const toggleIcon = toggleSidebar.querySelector('i');
        if (toggleIcon) {
            toggleIcon.style.transition = 'transform 0.8s ease';
            if (sidebar.classList.contains('collapsed')) {
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        }
    }

    // Event listener para botão dentro da sidebar (APENAS DESKTOP)
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleDesktopSidebar();
        });
    }

    // Redimensionamento da janela
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) {
            // Desktop: sidebar visível, sem overlay
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.remove('collapsed');
            
            // Reset do ícone
            const toggleIcon = toggleSidebar.querySelector('i');
            if (toggleIcon) {
                toggleIcon.style.transform = 'rotate(0deg)';
                toggleIcon.style.transition = 'transform 0.8s ease';
            }
        }
    });

    // Inicialização desktop
    function initializeDesktopSidebar() {
        setTimeout(() => {
            requestAnimationFrame(() => {
                // Desktop: sidebar visível por padrão
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.remove('collapsed');
                
                // Main content com margem para sidebar
                if (mainContent) {
                    mainContent.classList.add('lg:ml-72');
                    mainContent.classList.remove('ml-0');
                }
                
                // Reset do ícone
                const toggleIcon = toggleSidebar.querySelector('i');
                if (toggleIcon) {
                    toggleIcon.style.transform = 'rotate(0deg)';
                    toggleIcon.style.transition = 'transform 0.8s ease';
                }
                
                console.log('✅ Sidebar Desktop inicializada');
            });
        }, 50);
    }

    // Executar inicialização
    initializeDesktopSidebar();
});
