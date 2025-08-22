document.addEventListener('DOMContentLoaded', function () {
    // Select both types of dropdown triggers
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger, [data-toggle="dropdown"]');

    dropdownTriggers.forEach(trigger => {
        // Find the menu: either next sibling OR inside parent (for userbox)
        let dropdownMenu = trigger.nextElementSibling;
        if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-menu')) {
            dropdownMenu = trigger.parentElement.querySelector('.dropdown-menu');
        }

        if (!dropdownMenu) return;

        function toggleDropdown(event) {
            event.preventDefault();
            event.stopPropagation();

            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.remove('active');
            });

            // Toggle current
            dropdownMenu.classList.toggle('active');

            if (dropdownMenu.classList.contains('active')) {
                // Position dynamically ONLY if it’s the grid dropdown
                if (dropdownMenu.classList.contains('header-menubox')) {
                    const rect = trigger.getBoundingClientRect();
                    dropdownMenu.style.top = `${rect.bottom + window.scrollY}px`;
                    dropdownMenu.style.left = `${rect.left + window.scrollX}px`;
                }
                document.addEventListener('click', clickOutsideHandler);
            } else {
                document.removeEventListener('click', clickOutsideHandler);
            }

        }

        function clickOutsideHandler(e) {
            if (!dropdownMenu.contains(e.target) && !trigger.contains(e.target)) {
                dropdownMenu.classList.remove('active');
                document.removeEventListener('click', clickOutsideHandler);
            }
        }

        trigger.addEventListener('click', toggleDropdown);
    });

    // Responsive fix for grid-style dropdowns only
    function handleResponsiveDropdown() {
        document.querySelectorAll('.dropdown-menu.header-menubox').forEach(dropdownMenu => {
            const menuIconGrid = dropdownMenu.querySelector('.menu-icon-grid');
            if (!menuIconGrid) return;

            if (window.innerWidth < 768) {
                dropdownMenu.style.width = '100%';
                dropdownMenu.style.left = '0';
                dropdownMenu.style.right = '0';
                menuIconGrid.style.gridTemplateColumns = '1fr 1fr';
            } else {
                dropdownMenu.style.width = '';
                dropdownMenu.style.left = '100%';
                dropdownMenu.style.right = '';
                menuIconGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        });
    }

    handleResponsiveDropdown();
    window.addEventListener('resize', handleResponsiveDropdown);
});
