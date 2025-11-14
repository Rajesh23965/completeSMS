//js/mainMenue.js
document.addEventListener("DOMContentLoaded", function () {
    const listContainer = document.getElementById("menuListContainer");
    const formContainer = document.getElementById("menuFormContainer");

    // Keep track of state
    let currentQuery = "";
    let currentPage = 1;
    let currentLimit = 10;
    let isEditing = false;

    // -------------------------
    // Load View
    // -------------------------
    // -------------------------
    // Load View
    // -------------------------
    async function loadView() {
        const hash = window.location.hash;

        // Get all containers
        const listContainer = document.getElementById("menuListContainer");
        const formContainer = document.getElementById("menuFormContainer");
        const categoryListContainer = document.getElementById("menuCateListContainer");
        const categoryFormContainer = document.getElementById("menuCategoryFormContainer");

        // Clear all containers
        if (listContainer) listContainer.innerHTML = "";
        if (formContainer) formContainer.innerHTML = "";
        if (categoryListContainer) categoryListContainer.innerHTML = "";
        if (categoryFormContainer) categoryFormContainer.innerHTML = "";

        // Hide all sections by default
        if (listContainer) listContainer.classList.add("hidden");
        if (formContainer) formContainer.classList.add("hidden");
        if (categoryListContainer) categoryListContainer.classList.add("hidden");
        if (categoryFormContainer) categoryFormContainer.classList.add("hidden");

        if (hash === "#/create" || hash.startsWith("#/edit/")) {
            // Show Menu Form
            if (formContainer) {
                formContainer.classList.remove("hidden");
                let id = null;
                if (hash.startsWith("#/edit/")) {
                    id = hash.split("/")[2];
                    isEditing = true;
                } else {
                    isEditing = false;
                }
                await loadForm(id);
            }

        } else if (hash === "#/category-create" || hash.startsWith("#/category-edit/")) {
            // Show Category Form - FIX: Use categoryFormContainer instead of formContainer
            if (categoryFormContainer) {
                categoryFormContainer.classList.remove("hidden");
                let id = null;
                if (hash.startsWith("#/category-edit/")) {
                    id = hash.split("/")[2];
                    isEditing = true;
                } else {
                    isEditing = false;
                }
                await loadCategoryForm(id);
            }

        } else if (hash === "#/cate-list") {
            // Show Category List
            if (categoryListContainer) {
                categoryListContainer.classList.remove("hidden");
                await loadMenusCat();
            }

        } else {
            // Default: Show Menu List
            if (listContainer) {
                listContainer.classList.remove("hidden");
                await loadMenus();
            }
        }

        updateActiveTab();
    }

    // -------------------------
    // Load Form
    // -------------------------
    async function loadForm(id = null) {
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

    // -------------------------
    // Load Category Form
    // -------------------------
    async function loadCategoryForm(id = null) {
        const categoryFormContainer = document.getElementById("menuCategoryFormContainer");
        if (!categoryFormContainer) {
            console.error("Category form container not found");
            return;
        }

        try {
            const url = id ? `/frontend/partials/menuCategoryForm?id=${id}` : `/frontend/partials/menuCategoryForm`;

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const html = await res.text();
            categoryFormContainer.innerHTML = html;

            // Wait a bit for DOM to be updated, then initialize events
            setTimeout(() => {
                // Prefill if editing
                if (id) {
                    prefillCategoryData(id);
                }
                initCategoryFormEvents();
            }, 100);

        } catch (err) {
            console.error("Error loading category form:", err);
            categoryFormContainer.innerHTML = `
            <div class="alert alert-danger">
                Error loading menu category form: ${err.message}
            </div>
        `;
        }
    }

    // Helper function to prefill category form data
    async function prefillCategoryData(id) {
        try {
            const resCat = await fetch(`/frontend/menu-category/${id}`);
            const { success, result } = await resCat.json();

            if (success && result) {
                // Use setTimeout to ensure form elements are available
                setTimeout(() => {
                    const titleField = document.getElementById("menu_category_title");
                    const urlField = document.getElementById("menu_category_url");
                    const positionField = document.getElementById("position");
                    const statusField = document.getElementById("status");
                    const menuField = document.getElementById("menu_id");

                    if (titleField) titleField.value = result.menu_category_title || "";
                    if (urlField) urlField.value = result.menu_category_url || "";
                    if (positionField) positionField.value = result.position || 0;
                    if (statusField) statusField.value = result.status || "Disable";
                    if (menuField) menuField.value = result.menu_id || "";
                }, 200);
            }
        } catch (err) {
            console.error("Error loading category data:", err);
        }
    }


    // -------------------------
    // Init Category Form Events
    // -------------------------

    function initCategoryFormEvents() {
        const categoryFormContainer = document.getElementById("menuCategoryFormContainer");
        if (!categoryFormContainer) {
            console.error("Category form container not found");
            return;
        }

        const categoryForm = categoryFormContainer.querySelector("#menuCategoryForm");
        if (!categoryForm) {
            console.error("Category form not found in container");
            return;
        }



        //  Populate menu_id dropdown with menu titles
        const menuSelect = categoryForm.querySelector("#menu_id");
        if (menuSelect) {
            (async () => {
                try {
                    const res = await fetch("/frontend/menus-simple");
                    const data = await res.json();
                    if (data.success) {
                        menuSelect.innerHTML = `<option value="">-- Select Menu --</option>`;
                        data.result.forEach(menu => {
                            const opt = document.createElement("option");
                            opt.value = menu.id;
                            opt.textContent = menu.title;
                            menuSelect.appendChild(opt);
                        });

                        // If editing, set the selected value after populating
                        const hash = window.location.hash;
                        if (hash.startsWith("#/category-edit/")) {
                            const categoryId = hash.split("/")[2];
                            // This will be handled by prefillCategoryData
                        }
                    }
                } catch (err) {
                    console.error("Error loading menus for category:", err);
                }
            })();
        }

        // Cancel button
        const cancelBtn = categoryForm.querySelector("#cancelCategory");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                window.location.hash = "#/cate-list";
            });
        }

        // Submit form
        categoryForm.addEventListener("submit", async function (e) {
            e.preventDefault();


            const formData = new FormData(categoryForm);
            const data = Object.fromEntries(formData.entries());

            // Determine if this is create or update
            const hash = window.location.hash;
            const isUpdate = hash.startsWith("#/category-edit/");
            const categoryId = isUpdate ? hash.split("/")[2] : null;

            const url = isUpdate ? `/frontend/menu-category/${categoryId}` : "/frontend/menu-category";
            const method = isUpdate ? "PUT" : "POST";

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (result.success) {
                    showCustomAlert(`Menu category ${isUpdate ? 'updated' : 'created'} successfully!`, "success");
                    setTimeout(() => {
                        window.location.hash = "#/cate-list";
                    }, 1000);
                } else {
                    showCustomAlert(result.message || `Failed to ${isUpdate ? 'update' : 'create'} category`, "error");
                }
            } catch (err) {
                console.error("Save category error:", err);
                showCustomAlert(`Error ${isUpdate ? 'updating' : 'creating'} menu category`, "error");
            }
        });
    }
    // -------------------------
    // Fetch Menus
    // -------------------------
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

    // -------------------------
    // Render Table
    // -------------------------
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

        // --- Rows Per Page ---
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
      // --- Toggle Publish Event ---
document.querySelectorAll(".btn-toggle-publish").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const menuTitle = btn.closest('tr').querySelector('td:nth-child(3)').textContent;
        
        try {
            const res = await fetch(`/frontend/menus/${id}/toggle-publish`, {
                method: "PATCH",
            });
            const result = await res.json();
            if (result.success) {
                const newStatus = result.newStatus; // Make sure your API returns the new status
                const action = newStatus === "Enable" ? "Published" : "Unpublished";
                
                showCustomAlert(
                    `${action} On Website\n\n${menuTitle}`,
                    "success",
                    true,
                    "Successfully"
                );
                
                await loadMenus();
            } else {
                showCustomAlert(
                    "Failed to toggle publish status",
                    "error",
                    false,
                    "Error"
                );
            }
        } catch (err) {
            console.error("Toggle publish error:", err);
            showCustomAlert(
                "Error toggling publish status",
                "error",
                false,
                "Error"
            );
        }
    });
});

        // --- Edit Event ---
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                window.location.hash = `#/edit/${id}`;
            });
        });

        // --- Delete Event ---
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (confirm("Are you sure you want to delete this menu?")) {
                    try {
                        const res = await fetch(`/frontend/menus/${id}`, {
                            method: "DELETE",
                        });
                        const result = await res.json();
                        showCustomAlert(result.success ? "Menu deleted successfully" : "Failed to delete menu",
                            result.success ? "success" : "error");

                    } catch (err) {
                        console.error("Delete menu error:", err);
                        showCustomAlert("Error deleting menu", "error");
                    }
                }
            });
        });
    }

    // -------------------------
    // Fetch Menus Category
    // -------------------------
    async function loadMenusCat() {
        try {
            const url = currentQuery
                ? `/frontend/menu/category?search=${encodeURIComponent(currentQuery)}&page=${currentPage}&limit=${currentLimit}`
                : `/frontend/menu/category?page=${currentPage}&limit=${currentLimit}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                renderMenuCategoryTable(data.result, data.pagination);
            } else {
                document.getElementById("menuCateListContainer").innerHTML = `<p class="text-danger">No menu categories found.</p>`;
            }
        } catch (err) {
            console.error("Error fetching menu categories:", err);
            document.getElementById("menuCateListContainer").innerHTML = `<p class="text-danger">Error loading menu categories</p>`;
        }
    }


    // -------------------------
    // Render menue category Table
    // -------------------------
    function renderMenuCategoryTable(categories, pagination) {
        function renderCategoryRow(cat, index) {
            return `
            <tr>
                <td>${index}</td>
                <td>Menu Tab</td>
                <td>${cat.menu_category_title}</td>
                <td>${cat.menu_category_url}</td>
                <td>${cat.menu_title || "-"}</td>
                <td>
                   <button 
 class="btn btn-sm btn-toggle-publish ${cat.status === "Enable" ? "btn-primary" : "btn-danger"}" 
 data-id="${cat.id}">
 <i class="fas ${cat.status === "Enable" ? "fa-toggle-on" : "fa-toggle-off"}"></i>
 ${cat.status}
</button>

                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-edit" data-id="${cat.id}">
                            <i class="fas fa-pen-nib"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${cat.id}">
                           <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }

        let rows = categories.map((cat, i) => renderCategoryRow(cat, i + 1)).join("");

        document.getElementById("menuCateListContainer").innerHTML = `
        <div class="menue-form">
            <!-- Top Controls -->
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <select id="rowsPerPageCat" class="form-select w-auto">
                        <option value="5" ${currentLimit == 5 ? "selected" : ""}>5</option>
                        <option value="10" ${currentLimit == 10 ? "selected" : ""}>10</option>
                        <option value="25" ${currentLimit == 25 ? "selected" : ""}>25</option>
                        <option value="50" ${currentLimit == 50 ? "selected" : ""}>50</option>
                    </select>
                    <span>rows per page</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <input id="searchBoxCat" class="form-control" placeholder="Search category..." value="${currentQuery}">
                    <button class="btn btn-primary" id="btnAddNewCat">
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
                        <th>Category Title</th>
                        <th>URL</th>
                        <th>Menu</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || `<tr><td colspan="7" class="text-center">No categories found</td></tr>`}
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="pagination-controls d-flex justify-content-end align-items-center gap-2">
                <button id="prevPageCat" class="btn btn-sm btn-outline-primary" ${pagination.currentPage <= 1 ? "disabled" : ""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="btn btn-sm btn-light">Page ${pagination.page} of ${pagination.totalPages}</span>
                <button id="nextPageCat" class="btn btn-sm btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? "disabled" : ""}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

        // 🔹 Attach event listeners
        document.getElementById("rowsPerPageCat").addEventListener("change", (e) => {
            currentLimit = parseInt(e.target.value);
            currentPage = 1;
            loadMenusCat();
        });

        document.getElementById("searchBoxCat").addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                currentQuery = e.target.value;
                currentPage = 1;
                loadMenusCat();
            }
        });

        document.getElementById("btnAddNewCat").addEventListener("click", () => {
            window.location.hash = "#/category-create";
        });

        document.getElementById("prevPageCat").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadMenusCat();
            }
        });

        document.getElementById("nextPageCat").addEventListener("click", () => {
            if (currentPage < pagination.totalPages) {
                currentPage++;
                loadMenusCat();
            }
        });


        // --- Edit Category ---
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                window.location.hash = `#/category-edit/${id}`;
            });
        });

        // --- Delete Category ---
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (confirm("Are you sure you want to delete this category?")) {
                    try {
                        const res = await fetch(`/frontend/menu-category/${id}`, {
                            method: "DELETE",
                        });
                        const result = await res.json();
                        showCustomAlert(
                            result.success ? "Category deleted successfully" : result.message,
                            result.success ? "success" : "error"
                        );
                        if (result.success) loadMenusCat();
                    } catch (err) {
                        console.error("Delete category error:", err);
                        showCustomAlert("Error deleting category", "error");
                    }
                }
            });
        });

        // --- Toggle Category Status ---
      // --- Toggle Category Status ---
document.querySelectorAll(".btn-toggle-publish").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const categoryTitle = btn.closest('tr').querySelector('td:nth-child(3)').textContent;
        
        try {
            const res = await fetch(`/frontend/menu-category/${id}/toggle-status`, {
                method: "PATCH"
            });
            const result = await res.json();
            if (result.success) {
                const newStatus = result.newStatus; // Make sure your API returns the new status
                const action = newStatus === "Enable" ? "Published" : "Unpublished";
                
                showCustomAlert(
                    `${action} On Website\n\n${categoryTitle}`,
                    "success",
                    true,
                    "Successfully"
                );
                
                await loadMenusCat();
            } else {
                showCustomAlert(
                    "Failed to toggle status",
                    "error",
                    false,
                    "Error"
                );
            }
        } catch (err) {
            console.error("Toggle category status error:", err);
            showCustomAlert(
                "Error toggling category status",
                "error",
                false,
                "Error"
            );
        }
    });
});


    }



    // -------------------------
    // Form Events
    // -------------------------
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
                return showCustomAlert("Title and Position are required", "error");
            }

            // Validate external link if provided
            if (data.external_url && data.external_link) {
                const isValidLink = data.external_link.startsWith('/') ||
                    data.external_link.startsWith('http://') ||
                    data.external_link.startsWith('https://');

                if (!isValidLink) {
                    return showCustomAlert("External link must start with / for relative paths or http:///https:// for full URLs", "error");
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
                    showCustomAlert(`Menu ${data.id ? 'updated' : 'saved'} successfully!`, "success");
                    setTimeout(() => {
                        window.location.hash = "#/list";
                    }, 1000);
                } else {
                    showCustomAlert(result.message || "Failed to save menu", "error");
                }
            } catch (err) {
                console.error("Save menu error:", err);
                showCustomAlert("Error saving menu", "error");
            }
        });
    }

    // -------------------------
    // Utility Functions
    // -------------------------
    // -------------------------
    // Custom Alert Function
    // -------------------------
    function showCustomAlert(message, type = "success", showNote = true, title = null) {
        const customAlert = document.getElementById("customAlert");
        const alertTitle = document.getElementById("customAlertTitle");
        const alertMessage = document.getElementById("customAlertMessage");
        const alertNote = document.getElementById("customAlertNote");
        const okBtn = document.getElementById("customAlertOkBtn");
        const closeBtn = document.querySelector(".custom-alert-close");

        if (!customAlert) {
            console.error("Custom alert element not found");
            return;
        }

        // Set content
        alertMessage.textContent = message;
        alertNote.style.display = showNote ? "block" : "none";

        // Set title based on type if not provided
        if (!title) {
            title = type === "success" ? "Successfully" : "Error";
        }
        alertTitle.textContent = title;

        // Set type (success/error)
        customAlert.className = `custom-alert ${type}`;
        customAlert.classList.remove("hidden");

        // Close functions
        const closeAlert = () => {
            customAlert.classList.add("hidden");
        };

        // Event listeners
        okBtn.onclick = closeAlert;
        closeBtn.onclick = closeAlert;

        // Auto close for success messages after 5 seconds
        if (type === "success") {
            setTimeout(closeAlert, 5000);
        }
    }

    // -------------------------
    // Custom Alert Function
    // -------------------------
    function showCustomAlert(message, type = "success", showNote = true, title = null) {
        const customAlert = document.getElementById("customAlert");
        const alertTitle = document.getElementById("customAlertTitle");
        const alertMessage = document.getElementById("customAlertMessage");
        const alertNote = document.getElementById("customAlertNote");
        const okBtn = document.getElementById("customAlertOkBtn");
        const closeBtn = document.querySelector(".custom-alert-close");

        if (!customAlert) {
            console.error("Custom alert element not found");
            return;
        }

        // Set content
        alertMessage.textContent = message;
        alertNote.style.display = showNote ? "block" : "none";

        // Set title based on type if not provided
        if (!title) {
            title = type === "success" ? "Successfully" : "Error";
        }
        alertTitle.textContent = title;

        // Set type (success/error)
        customAlert.className = `custom-alert ${type}`;
        customAlert.classList.remove("hidden");

        // Close functions
        const closeAlert = () => {
            customAlert.classList.add("hidden");
        };

        // Event listeners
        okBtn.onclick = closeAlert;
        closeBtn.onclick = closeAlert;

        // Auto close for success messages after 5 seconds
        if (type === "success") {
            setTimeout(closeAlert, 5000);
        }
    }

    // Keep the old showAlert function for backward compatibility
    function showAlert(message, type = "success") {
        showCustomAlert(message, type, type === "success");
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
        const categoryCreateTab = document.getElementById("menuCategoryCreateTab");
        const categoryListTab = document.getElementById("menuCatListTab");

        if (!listTab || !createTab || !categoryCreateTab || !categoryListTab) return;

        // Remove active class from all tabs
        listTab.classList.remove("active");
        createTab.classList.remove("active");
        categoryCreateTab.classList.remove("active");
        categoryListTab.classList.remove("active");

        const hash = window.location.hash;
        if (hash === "#/create" || hash.startsWith("#/edit/")) {
            createTab.classList.add("active");
        } else if (hash === "#/category-create" || hash.startsWith("#/category-edit/")) {
            categoryCreateTab.classList.add("active");
        } else if (hash === "#/cate-list") {
            categoryListTab.classList.add("active");
        } else {
            listTab.classList.add("active");
        }
    }



    // -------------------------
    // Init
    // -------------------------
    loadView();
    window.addEventListener("hashchange", loadView);
});

