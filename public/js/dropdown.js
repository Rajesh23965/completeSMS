document.addEventListener("DOMContentLoaded", () => {

    const triggers = document.querySelectorAll(".dropdown-trigger");

    function closeAll() {
        document.querySelectorAll(".dropdown-menu.active").forEach(menu => {
            menu.classList.remove("active");
        });
    }

    triggers.forEach(trigger => {
        const menuId = trigger.dataset.dropdown;
        const menu = document.getElementById(menuId);

        if (!menu) return;

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();

            const isOpen = menu.classList.contains("active");
            closeAll();

            if (!isOpen) {
                menu.classList.add("active");
            }
        });
    });

    // Close when clicking outside
    document.addEventListener("click", () => closeAll());
});
