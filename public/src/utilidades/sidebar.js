/**
 * Script global para el manejo del sidebar de navegación
 * Se incluye en todas las páginas de la aplicación
 */

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setActiveLink();
});

/**
 * Inicializa el funcionamiento del sidebar
 */
function initSidebar() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (!mobileMenuBtn || !sidebar || !sidebarOverlay) {
        return;
    }

    // Abrir sidebar en móvil
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    });

    // Cerrar sidebar al hacer clic en el overlay
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Cerrar sidebar con el botón toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', closeSidebar);
    }

    // Cerrar sidebar al hacer clic en un enlace (en móvil)
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // Cerrar sidebar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

/**
 * Cierra el sidebar en móvil
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }
}

/**
 * Marca como activo el enlace de la página actual
 */
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'tablero.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
