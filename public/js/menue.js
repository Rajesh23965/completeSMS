//js/menue.js
document.addEventListener("DOMContentLoaded", function () {

    const listContainer = document.getElementById("menuListContainer");
    const formContainer = document.getElementById("menuFormContainer");

    let currentQuery = "";
    let currentPage = 1;
    let currentLimit = 10;

    async function loadMenus() {
        try {
            const url = currentQuery
                ? `/frontend/search?q=${encodeURIComponent(currentQuery)}&page=${currentPage}&limit=${currentLimit}`
                : `/frontend/menus?page=${currentPage}&limit=${currentLimit}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                renderMenuTable(data.result, data.pagination);
            } else {
                listContainer.innerHTML = `<p class="text-danger">No menus found.</p>`;
            }
        } catch (err) {
            console.error("Error fetching menus:", err);
            listContainer.innerHTML = `<p class="text-danger">Error loading menus</p>`;
        }
    }

    async function loadMenuForm(id = null) {
        try {
            const url = id ? `/frontend/partials/menuForm?id=${id}` : `/frontend/partials/menuForm`;
            const res = await fetch(url);
            formContainer.innerHTML = await res.text();
            initFormEvents();
        } catch (err) {
            console.error("Error loading form:", err);
            formContainer.innerHTML = `<p class="text-danger">Error loading form</p>`;
        }
    }

    function renderMenuTable(menus, pagination) {
        function renderMenuRow(menu, index) {
            const hasChildren = menu.children && menu.children.length > 0;

            return `
            <tr>
                <td>${index}</td>
                <td>System Menu</td>
                <td>${menu.title}</td>
                <td>${menu.position}</td>
                <td>${hasChildren ? `<span class="toggle-submenu" data-id="${menu.id}" style="cursor:pointer;">&#x25BC;</span>` : '-'}</td>
             <td>
                    <button 
                        class="btn btn-sm btn-toggle-publish ${menu.publish === "Enable" ? "btn-primary" : "btn-danger"}" 
                        data-id="${menu.id}">
                        <i class="fas ${menu.publish === "Enable" ? "fa-toggle-on" : "fa-toggle-off"}"></i>
                        ${menu.publish}
                    </button>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-edit" data-id="${menu.id}">
                            <i class="fas fa-pen-nib"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${menu.id}">
                           <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            ${hasChildren ? `
                <tr class="submenu-row" data-parent="${menu.id}" style="display:none;">
                    <td colspan="7">
                        <table class="table mb-0">
                            <thead>
                                <tr>
                                    <th>Sub Title</th>
                                    <th>Publish</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${menu.children.map(child => `
                                    <tr>
                                        <td class="ps-4">&raquo; ${child.title}</td>
                                        <td>
                                            <button 
                                                class="btn btn-sm btn-toggle-publish ${child.publish === "Enable" ? "btn-primary" : "btn-danger"}" 
                                                data-id="${child.id}">
                                                <i class="fas ${child.publish === "Enable" ? "fa-toggle-on" : "fa-toggle-off"}"></i>
                                                ${child.publish}
                                            </button>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn btn-sm btn-primary btn-edit" data-id="${child.id}">
                                                    <i class="fas fa-pen-nib"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger btn-delete" data-id="${child.id}">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </td>
                </tr>
            ` : ""}
        `;
        }

        let rows = menus.map((menu, index) => renderMenuRow(menu, index + 1)).join("");

        listContainer.innerHTML = `
        <div class="menue-form">
            <!-- Top Controls -->
            <div class=" d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <select id="rowsPerPage" class="form-select w-auto">
                        <option value="5" ${currentLimit == 5 ? "selected" : ""}>5</option>
                        <option value="10" ${currentLimit == 10 ? "selected" : ""}>10</option>
                        <option value="25" ${currentLimit == 25 ? "selected" : ""}>25</option>
                        <option value="50" ${currentLimit == 50 ? "selected" : ""}>50</option>
                    </select>
                    <span>rows per page</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <input id="searchBox" class="form-control" placeholder="Search menu..." value="${currentQuery}">
                    <button class="btn btn-primary" id="btnAddNew">
                        <i class="fas fa-plus"></i> Add New
                    </button>
                </div>
            </div>

            <!-- Table -->
            <table class="table mt-3">
                <thead>
                    <tr>
                        <th>Sl</th>
                        <th>Menu Type</th>
                        <th>Title</th>
                        <th>Position</th>
                        <th>Sub Menu</th>
                        <th>Publish</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || `<tr><td colspan="7" class="text-center">No menus found</td></tr>`}
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="pagination-controls d-flex justify-content-end align-items-center gap-2">
                <button id="prevPage" class="btn btn-sm btn-outline-primary" ${pagination.page <= 1 ? "disabled" : ""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="btn btn-sm btn-light">Page ${pagination.page} of ${pagination.totalPages}</span>
                <button id="nextPage" class="btn btn-sm btn-outline-primary" ${pagination.page >= pagination.totalPages ? "disabled" : ""}>
                 <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

        // --- Toggle submenu show/hide ---
        document.querySelectorAll(".toggle-submenu").forEach(toggle => {
            toggle.addEventListener("click", () => {
                const parentId = toggle.dataset.id;
                const row = document.querySelector(`.submenu-row[data-parent="${parentId}"]`);
                if (row.style.display === "none") {
                    row.style.display = "table-row";
                    toggle.innerHTML = "&#x25B2;";
                } else {
                    row.style.display = "none";
                    toggle.innerHTML = "&#x25BC;";
                }
            });
        });

        // --- Add New Button ---
        document.getElementById("btnAddNew").addEventListener("click", () => {
            window.location.hash = "#/create";
        });

        // --- Search ---
        document.getElementById("searchBox").addEventListener("input", debounce((e) => {
            currentQuery = e.target.value.trim();
            currentPage = 1;
            loadMenus();
        }, 300));

        // --- Row Per Page ---
        document.getElementById("rowsPerPage").addEventListener("change", (e) => {
            currentLimit = parseInt(e.target.value);
            currentPage = 1;
            loadMenus();
        });


        // --- Pagination ---
        document.getElementById("prevPage").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadMenus();
            }
        });
        document.getElementById("nextPage").addEventListener("click", () => {
            if (currentPage < pagination.totalPages) {
                currentPage++;
                loadMenus();
            }
        });

        // --- Toggle Publish Event ---
        document.querySelectorAll(".btn-toggle-publish").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/frontend/menus/${id}/toggle-publish`, {
                        method: "PATCH",
                    });
                    const result = await res.json();
                    if (result.success) {
                        await loadMenus();
                    } else {
                        showAlert("Failed to toggle publish", "error");

                    }
                } catch (err) {
                    console.error("Toggle publish error:", err);
                    showAlert("Error toggling publish", "error");
                }
            });
        });


        // Edit Event
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                window.location.hash = `#/edit/${id}`;
            });
        });

        // Delete Event
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (confirm("Delete this menu?")) {
                    await fetch(`/frontend/menus/${id}`, { method: "DELETE" });
                    loadMenus();
                }
            });
        });
    }

    function initFormEvents() {
        const menuForm = document.getElementById("menuForm");
        if (!menuForm) return;

        const publishToggle = menuForm.querySelector("#publish");
        const externalToggle = menuForm.querySelector("#external_url");
        const externalLinkInput = menuForm.querySelector("#external_link");
        const cancelEditBtn = menuForm.querySelector("#cancelEdit");

        // External URL toggle
        if (externalToggle && externalLinkInput) {
            externalLinkInput.disabled = !externalToggle.checked;
            externalToggle.addEventListener("change", () => {
                externalLinkInput.disabled = !externalToggle.checked;
                if (!externalToggle.checked) externalLinkInput.value = "";
            });
        }

        // Cancel edit
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener("click", () => {
                window.location.hash = "#/list";
            });
        }

        // Form submission
        menuForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(menuForm);
            const data = {
                id: formData.get("id") || null,
                title: formData.get("title").trim(),
                position: formData.get("position").trim(),
                publish: formData.get("publish") ? "Enable" : "Disable",
                target_new_window: formData.get("target_new_window") ? 1 : 0,
                external_url: formData.get("external_url") ? 1 : 0,
                external_link: formData.get("external_url") ? formData.get("external_link").trim() : null,
                sub_menu: formData.get("sub_menu") || null,
            };

            if (!data.title || !data.position) {
                return showAlert("Title and Position are required", "error");
            }

            // Validate external link if provided
            if (data.external_url && data.external_link) {
                const isValidLink = data.external_link.startsWith('/') ||
                    data.external_link.startsWith('http://') ||
                    data.external_link.startsWith('https://');

                if (!isValidLink) {
                    return showAlert("External link must start with / for relative paths or http:///https:// for full URLs", "error");
                }
            }


            try {
                const response = await fetch("/frontend/menus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                if (result.success) {
                    showAlert(`Menu ${data.id ? 'updated' : 'saved'} successfully!`, "success");
                    setTimeout(() => {
                        window.location.hash = "#/list";
                    }, 1000);
                } else {
                    showAlert(result.message || "Failed to save menu", "error");
                }
            } catch (err) {
                console.error("Save menu error:", err);
                showAlert("Error saving menu", "error");
            }
        });
    }

    // Router
    async function loadView() {
        const hash = window.location.hash;

        if (!listContainer || !formContainer) {
            console.warn("Menu containers not found on this page.");
            return;
        }

        // hide containers not related to menu
        listContainer.classList.add("hidden");
        formContainer.classList.add("hidden");

        if (hash === "#/create" || hash.startsWith("#/edit/")) {
            formContainer.classList.remove("hidden");
            let id = hash.startsWith("#/edit/") ? hash.split("/")[2] : null;
            await loadMenuForm(id);
        } else if (hash === "#/list" || hash === "" || hash === "#") {
            listContainer.classList.remove("hidden");
            await loadMenus();
        }
        updateActiveTab();
    }


    // -------------------------
    // Utility Functions
    // -------------------------
    function showAlert(message, type = "success") {
        const alertBox = document.getElementById("alertMessage");
        if (!alertBox) return;

        alertBox.innerHTML = `
    <span>${message}</span>
    <button id="alertOkBtn">OK</button>
  `;
        alertBox.className = `alert-message ${type} show`;

        // Auto hide after 3s
        setTimeout(() => {
            alertBox.classList.remove("show");
            setTimeout(() => (alertBox.style.display = "none"), 300);
        }, 3000);

        // Manual close
        document.getElementById("alertOkBtn").onclick = () => {
            alertBox.classList.remove("show");
            setTimeout(() => (alertBox.style.display = "none"), 300);
        };

        // Ensure display flex when shown
        alertBox.style.display = "flex";
    }


    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function updateActiveTab() {
        const listTab = document.getElementById("menuListTab");
        const createTab = document.getElementById("menuCreateTab");

        if (!listTab || !createTab) return;

        listTab.classList.remove("active");
        createTab.classList.remove("active");

        const hash = window.location.hash;
        if (hash === "#/create" || hash.startsWith("#/edit/")) {
            createTab.classList.add("active");
        } else if (hash === "#/list" || hash === "" || hash === "#") {
            listTab.classList.add("active");
        }
    }

    loadView();
    window.addEventListener("hashchange", loadView);
});
