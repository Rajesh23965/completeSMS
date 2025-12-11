// public/sidebar.js
class Sidebar {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.overlay = document.querySelector('.sidebar-overlay');
        this.fullscreenToggle = document.getElementById('fullscreen-toggle');
        this.isMobile = window.innerWidth <= 768;
        this.isSidebarOpen = false;
        this.isFullscreen = false;
        this.STORAGE_KEY = 'sidebar_state';
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleResize();
        this.loadSavedState(); // Load saved state on initialization
        window.addEventListener('resize', () => this.handleResize());
    }

    bindEvents() {
        // Handle expandable menu items
        const expandableItems = document.querySelectorAll('.menu-item.expandable');
        expandableItems.forEach(item => {
            item.addEventListener('click', (e) => this.toggleSubmenu(e));
        });

        // Handle submenu item clicks
        const submenuItems = document.querySelectorAll('.submenu .menu-item');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => this.selectSubmenuItem(e));
        });

        // Handle sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Handle fullscreen toggle
        const fullscreenToggle = document.getElementById('fullscreen-toggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
        }

        // Handle escape key for fullscreen exit
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        if (this.sidebar) {
            this.sidebar.addEventListener('mouseenter', () => this.handleMouseEnter());
            this.sidebar.addEventListener('mouseleave', () => this.handleMouseLeave());
        }

        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());

        // Handle overlay click for mobile
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }
    }

    loadSavedState() {
        // Load saved state from localStorage
        const savedState = localStorage.getItem(this.STORAGE_KEY);
        if (savedState) {
            try {
                const state = JSON.parse(savedState);

                // Restore sidebar collapsed state
                if (state.sidebarCollapsed && !this.isMobile) {
                    this.sidebar.classList.add('collapsed');
                    this.mainContent.classList.add('sidebar-collapsed');

                    // Update toggle icon
                    const icon = this.sidebarToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-indent');
                        icon.classList.add('fa-bars');
                    }
                }

                // Restore expanded menus
                if (state.expandedMenus && state.expandedMenus.length > 0) {
                    setTimeout(() => {
                        state.expandedMenus.forEach(menuId => {
                            this.restoreMenuState(menuId);
                        });
                    }, 100);
                }

                // Restore active menu item
                if (state.activeItem) {
                    setTimeout(() => {
                        this.restoreActiveItem(state.activeItem.menuId, state.activeItem.submenuText);
                    }, 150);
                }
            } catch (e) {
                console.error('Failed to load sidebar state:', e);
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
    }

    saveState() {
        const state = {
            sidebarCollapsed: this.sidebar.classList.contains('collapsed'),
            expandedMenus: this.getExpandedMenus(),
            activeItem: this.getActiveItem()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }

    getExpandedMenus() {
        const expandedMenus = [];
        const expandedItems = document.querySelectorAll('.menu-item.expandable.expanded');
        expandedItems.forEach(item => {
            const menuId = item.getAttribute('data-menu');
            if (menuId) {
                expandedMenus.push(menuId);
            }
        });
        return expandedMenus;
    }

    getActiveItem() {
        const activeMenuItem = document.querySelector('.menu-item.active');
        if (activeMenuItem) {
            const parentSubmenu = activeMenuItem.closest('.submenu');
            if (parentSubmenu) {
                const menuId = parentSubmenu.id.replace('-submenu', '');
                const submenuText = activeMenuItem.textContent.trim();
                return { menuId, submenuText };
            }
        }
        return null;
    }

    restoreMenuState(menuId) {
        const button = document.querySelector(`[data-menu="${menuId}"]`);
        const submenu = document.getElementById(`${menuId}-submenu`);

        if (button && submenu) {
            button.classList.add('expanded');
            submenu.classList.add('open');
            submenu.style.maxHeight = submenu.scrollHeight + 'px';

            const icon = button.querySelector('.expand-icon');
            if (icon) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        }
    }

    restoreActiveItem(menuId, submenuText) {
        this.restoreMenuState(menuId);

        setTimeout(() => {
            const submenu = document.getElementById(`${menuId}-submenu`);
            if (submenu) {
                const items = submenu.querySelectorAll('.menu-item');
                items.forEach(item => {
                    if (item.textContent.trim() === submenuText) {
                        item.classList.add('active');

                        // Update content if needed
                        this.simulateNavigation(submenuText);
                    }
                });
            }
        }, 50);
    }

    toggleSubmenu(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const menuId = button.getAttribute('data-menu');
        const submenu = document.getElementById(`${menuId}-submenu`);

        if (!submenu) return;

        const isExpanded = button.classList.contains('expanded');
        const icon = button.querySelector('.expand-icon');

        // Only close other menus if we're expanding this one
        if (!isExpanded) {
            const otherMenus = document.querySelectorAll(`.menu-item.expandable:not([data-menu="${menuId}"])`);
            otherMenus.forEach(item => {
                item.classList.remove('expanded');
                const otherSubmenu = document.getElementById(`${item.getAttribute('data-menu')}-submenu`);
                if (otherSubmenu) {
                    otherSubmenu.classList.remove('open');
                    otherSubmenu.style.maxHeight = '0px';
                }
                const otherIcon = item.querySelector('.expand-icon');
                if (otherIcon) {
                    otherIcon.classList.remove('fa-minus');
                    otherIcon.classList.add('fa-plus');
                }
            });
        }

        if (!isExpanded) {
            button.classList.add('expanded');
            submenu.classList.add('open');
            submenu.style.maxHeight = submenu.scrollHeight + 'px';

            if (icon) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
            this.setActiveMenuItem(button);
        } else {
            button.classList.remove('expanded');
            submenu.classList.remove('open');
            submenu.style.maxHeight = '0px';

            if (icon) {
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }

            // Clear active item if closing the menu
            if (button.classList.contains('active')) {
                button.classList.remove('active');
            }
        }

        // Save state after toggling
        setTimeout(() => this.saveState(), 50);
    }

    selectSubmenuItem(event) {
        // Only prevent default for items that don't have actual hrefs
        const href = event.currentTarget.getAttribute('href');
        if (!href || href === '#' || href === 'javascript:void(0)') {
            event.preventDefault();
        }

        const clickedItem = event.currentTarget;

        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        clickedItem.classList.add('active');

        // Ensure parent menu is expanded
        const parentSubmenu = clickedItem.closest('.submenu');
        const parentButton = document.querySelector(`[data-menu="${parentSubmenu.id.replace('-submenu', '')}"]`);

        if (parentButton) {
            parentButton.classList.add('expanded');
            parentSubmenu.classList.add('open');
            parentSubmenu.style.maxHeight = parentSubmenu.scrollHeight + 'px';

            // Update icon
            const parentIcon = parentButton.querySelector('.expand-icon');
            if (parentIcon) {
                parentIcon.classList.remove('fa-plus');
                parentIcon.classList.add('fa-minus');
            }
        }

        // Only simulate navigation for demo items without real links
        if (!href || href === '#' || href === 'javascript:void(0)') {
            this.simulateNavigation(clickedItem.textContent.trim());
        }

        // Save state after selection
        setTimeout(() => this.saveState(), 50);
    }

    toggleSidebar() {
        if (this.isMobile) {
            // Mobile behavior - full show/hide
            this.isSidebarOpen = !this.isSidebarOpen;
            this.sidebar.classList.toggle('mobile-open', this.isSidebarOpen);
            this.overlay.classList.toggle('active', this.isSidebarOpen);
            document.body.classList.toggle('no-scroll', this.isSidebarOpen);
        } else {
            // Desktop behavior - collapse to icons
            this.sidebar.classList.toggle('collapsed');
            this.mainContent.classList.toggle('sidebar-collapsed');

            // Update toggle icon
            const icon = this.sidebarToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-indent');
                icon.classList.toggle('fa-bars');
            }

            // Close all submenus when entering collapsed mode
            if (this.sidebar.classList.contains('collapsed')) {
                this.closeAllSubmenus();
            }
        }

        // Save sidebar state
        setTimeout(() => this.saveState(), 50);
    }

    closeAllSubmenus() {
        const expandedItems = document.querySelectorAll('.menu-item.expanded');
        const openSubmenus = document.querySelectorAll('.submenu.open');

        expandedItems.forEach(item => {
            item.classList.remove('expanded');
        });

        openSubmenus.forEach(submenu => {
            submenu.classList.remove('open');
            submenu.style.maxHeight = '0px';
        });
    }

    setActiveMenuItem(menuItem) {
        document.querySelectorAll('.sidebar-section .menu-item.expandable').forEach(item => {
            if (item !== menuItem) {
                item.classList.remove('active');
            }
        });
    }

    simulateNavigation(pageName) {
        const mainContent = document.querySelector('.demo-content h1');
        if (mainContent) {
            mainContent.textContent = pageName;
        }
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const element = document.documentElement;

        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }

        document.body.classList.add('fullscreen-active');
        this.isFullscreen = true;
        this.updateFullscreenIcon();
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        document.body.classList.remove('fullscreen-active');
        this.isFullscreen = false;
        this.updateFullscreenIcon();
    }

    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement);

        if (!isFullscreen && this.isFullscreen) {
            document.body.classList.remove('fullscreen-active');
            this.isFullscreen = false;
            this.updateFullscreenIcon();
        }
    }

    updateFullscreenIcon() {
        const fullscreenIcon = document.querySelector('#fullscreen-toggle i');
        if (fullscreenIcon) {
            if (this.isFullscreen) {
                fullscreenIcon.className = 'fas fa-compress';
            } else {
                fullscreenIcon.className = 'fas fa-expand';
            }
        }
    }

    handleResize() {
        const sidebar = document.querySelector('.sidebar');
        this.isMobile = window.innerWidth <= 768;

        if (!this.isMobile && this.isSidebarOpen) {
            // If switching to desktop, remove mobile overlay
            this.closeSidebar();
        }
        if (window.innerWidth <= 768) {
            if (this.isSidebarOpen) {
                sidebar.classList.add('mobile-open');
            } else {
                sidebar.classList.remove('mobile-open');
            }
        } else {
            sidebar.classList.remove('mobile-open');
            if (this.isSidebarOpen) {
                sidebar.classList.remove('closed');
            }
        }
    }

    openSidebar() {
        if (!this.isSidebarOpen) {
            this.toggleSidebar();
        }
    }

    closeSidebar() {
        if (this.isSidebarOpen) {
            this.isSidebarOpen = false;
            this.sidebar.classList.remove('mobile-open');
            this.overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }

    openMenu(menuId) {
        const button = document.querySelector(`[data-menu="${menuId}"]`);
        if (button && !button.classList.contains('expanded')) {
            button.click();
        }
    }

    closeMenu(menuId) {
        const button = document.querySelector(`[data-menu="${menuId}"]`);
        if (button && button.classList.contains('expanded')) {
            button.click();
        }
    }

    setActiveItem(menuId, submenuText) {
        this.openMenu(menuId);

        setTimeout(() => {
            const submenu = document.getElementById(`${menuId}-submenu`);
            if (submenu) {
                const items = submenu.querySelectorAll('.menu-item');
                items.forEach(item => {
                    if (item.textContent.trim() === submenuText) {
                        item.click();
                    }
                });
            }
        }, 100);
    }

    handleMouseEnter() {
        // Only apply hover expansion if NOT mobile AND sidebar is currently collapsed
        if (!this.isMobile && this.sidebar.classList.contains('collapsed')) {
            this.sidebar.classList.add('hover-expanded');
        }
    }

    handleMouseLeave() {
        if (!this.isMobile) {
            this.sidebar.classList.remove('hover-expanded');
        }
    }

    clearSavedState() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// Initialize sidebar
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new Sidebar();
    window.sidebar = sidebar;
});