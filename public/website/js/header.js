document.addEventListener("DOMContentLoaded", async () => {

    // SHOW LOADER
    const loader = document.getElementById("pageLoader");
    loader.classList.remove("hide");

    try {
        // FETCH SETTINGS
        const settingsRes = await fetch("http://localhost:3000/frontend/api");
        const settingsData = await settingsRes.json();
        const s = settingsData.data;

        document.documentElement.style.setProperty("--menu-bg", s.theme_menu_bg_color);
        document.documentElement.style.setProperty("--text-color", s.theme_text_color);
        document.documentElement.style.setProperty("--hover-color", s.theme_button_hover_color);
        document.documentElement.style.setProperty("--text-secondary", s.theme_text_secondary_color);

        document.getElementById("leftLogo").src = s.left_logo;
        document.getElementById("rightLogo").src = s.right_logo;

        // FETCH MENUS
        const menuRes = await fetch("http://localhost:3000/frontend/menus/");
        const menuJson = await menuRes.json();
        const menus = menuJson.result;

        const mainMenu = document.getElementById("mainMenu");
        mainMenu.innerHTML = buildMenuHTML(menus);

        // MOBILE MENU
        document.getElementById("mobileToggle").addEventListener("click", () => {
            mainMenu.classList.toggle("show");
        });

    } catch (error) {
        console.error("Header Load Error:", error);
    }

    // HIDE LOADER AFTER LOADING EVERYTHING
    setTimeout(() => {
        loader.classList.add("hide");
    }, 300); // small delay for smooth fade-out
});


// ========================
// FUNCTION TO BUILD MENU
// ========================
function buildMenuHTML(menus) {
    let html = "";

    menus
        .filter(m => m.publish === "Enable") // Only show enabled menus
        .sort((a, b) => a.position - b.position) // Sort
        .forEach(menu => {
            if (menu.children && menu.children.length > 0) {
                // Dropdown menu
                html += `
                    <div class="dropdown">
                        <a>${menu.title} <i class="fa fa-chevron-down" style="font-size:12px;"></i></a>
                        <div class="dropdown-menu">
                            ${menu.children
                                .map(child => `<a href="/${child.slug}">${child.title}</a>`)
                                .join("")}
                        </div>
                    </div>
                `;
            } else {
                // Single menu item
                let target = menu.target_new_window ? 'target="_blank"' : "";
                let url = menu.external_url ? menu.external_link : `/${menu.slug}`;
                html += `<a href="${url}" ${target}>${menu.title}</a>`;
            }
        });

    return html;
}
