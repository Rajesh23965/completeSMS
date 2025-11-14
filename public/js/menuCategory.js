// menuCategory.js
document.addEventListener("DOMContentLoaded", function () {
    const catListContainer = document.getElementById("menuCateListContainer");
    const catFormContainer = document.getElementById("menuCategoryFormContainer");
    const alertBox = document.getElementById("alertMessage");

    let currentQuery = "";
    let currentPage = 1;
    let currentLimit = 10;

    // =============================
    // Load Categories (list view)
    // =============================
    async function loadCategories() {
        try {
            const url = `/frontend/menu/category?page=${currentPage}&limit=${currentLimit}&q=${encodeURIComponent(currentQuery)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                renderCategoryTable(data.result, data.pagination);
            } else {
                catListContainer.innerHTML = `<p class="text-danger">No categories found.</p>`;
            }
        } catch (err) {
            console.error("Error loading categories:", err);
            catListContainer.innerHTML = `<p class="text-danger">Error loading categories</p>`;
        }
    }

    // =============================
    // Load Menus for Select Dropdown
    // =============================
    async function loadMenuOptions(selectedId = null) {
        try {
            const res = await fetch("/frontend/menus");
            const data = await res.json();
            if (data.success && Array.isArray(data.menus)) {
                const menuSelect = document.getElementById("menu_id");
                menuSelect.innerHTML = `<option value="">-- Select Menu --</option>`; // reset

                data.menus.forEach(menu => {
                    const option = document.createElement("option");
                    option.value = menu.id;
                    option.textContent = menu.menu_title;
                    if (selectedId && selectedId == menu.id) option.selected = true;
                    menuSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Error loading menus:", err);
        }
    }

    // =============================
    // Load Category Form (create/edit)
    // =============================

    async function loadCategoryForm(id = null) {
        try {
            const url = id ? `/frontend/partials/menuCategoryForm?id=${id}` : `/frontend/partials/menuCategoryForm`;
            const res = await fetch(url);
            catFormContainer.innerHTML = await res.text();

            // Prefill if editing
            if (id) {
                try {
                    const resCat = await fetch(`/frontend/menu-category/${id}`);
                    const { success, result } = await resCat.json();
                    if (success && result) {
                        // Use setTimeout to ensure DOM is ready
                        setTimeout(() => {
                            const titleField = document.getElementById("menu_category_title");
                            const urlField = document.getElementById("menu_category_url");
                            const positionField = document.getElementById("position");
                            const statusField = document.getElementById("status");

                            if (titleField) titleField.value = result.menu_category_title || "";
                            if (urlField) urlField.value = result.menu_category_url || "";
                            if (positionField) positionField.value = result.position || 0;
                            if (statusField) statusField.value = result.status || "Disable";
                        }, 100);
                    }
                } catch (err) {
                    console.error("Error loading category data:", err);
                }
            }

            initCategoryFormEvents();
            initCancelEdit();
        } catch (err) {
            console.error("Error loading category form:", err);
            catFormContainer.innerHTML = `<p class="text-danger">Error loading menu category form</p>`;
        }
    }

    // =============================
    // Render Category Table + Pagination
    // =============================
    function renderCategoryTable(categories, pagination = { page: 1, totalPages: 1 }) {
        function renderCategoryRow(cat, index) {
            return `
            <tr>
                <td>${(currentPage - 1) * currentLimit + index}</td>
                <td>Menu Tab</td>
                <td>${cat.menu_category_title || "-"}</td>
                <td>${cat.menu_category_url || "-"}</td>
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
            </tr>`;
        }

        let rows = categories.map((cat, i) => renderCategoryRow(cat, i + 1)).join("");

        catListContainer.innerHTML = `
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
                <button id="prevPageCat" class="btn btn-sm btn-outline-primary" ${pagination.page <= 1 ? "disabled" : ""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="btn btn-sm btn-light">Page ${pagination.page} of ${pagination.totalPages}</span>
                <button id="nextPageCat" class="btn btn-sm btn-outline-primary" ${pagination.page >= pagination.totalPages ? "disabled" : ""}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>`;

        // --- Event Listeners ---
        document.getElementById("rowsPerPageCat").addEventListener("change", (e) => {
            currentLimit = parseInt(e.target.value);
            currentPage = 1;
            loadCategories();
        });

        document.getElementById("searchBoxCat").addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                currentQuery = e.target.value;
                currentPage = 1;
                loadCategories();
            }
        });

        document.getElementById("btnAddNewCat").addEventListener("click", () => {
            window.location.hash = "#/category-create";
        });

        document.getElementById("prevPageCat").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadCategories();
            }
        });

        document.getElementById("nextPageCat").addEventListener("click", () => {
            if (currentPage < pagination.totalPages) {
                currentPage++;
                loadCategories();
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
                        const res = await fetch(`/frontend/menu-category/${id}`, { method: "DELETE" });
                        const result = await res.json();
                        showAlert(
                            result.success ? "Category deleted successfully" : result.message,
                            result.success ? "success" : "error"
                        );
                        if (result.success) loadCategories();
                    } catch (err) {
                        console.error("Delete category error:", err);
                        showAlert("Error deleting category", "error");
                    }
                }
            });
        });

        // --- Toggle Status ---
        document.querySelectorAll(".btn-toggle-publish").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`/frontend/menu-category/${id}/toggle-status`, { method: "PATCH" });
                    const result = await res.json();
                    if (result.success) {
                        await loadCategories();
                    } else {
                        showAlert("Failed to toggle status", "error");
                    }
                } catch (err) {
                    console.error("Toggle category status error:", err);
                    showAlert("Error toggling category status", "error");
                }
            });
        });
    }

    // =============================
    // Form Submission (create/edit)
    // =============================
    // =============================
    // Form Submission (create/edit)
    // =============================
    function initCategoryFormEvents() {
        const categoryForm = document.getElementById("menuCategoryForm");
        if (!categoryForm) return;

        // Get the category ID from URL hash if in edit mode
        const hash = window.location.hash;
        const isEditMode = hash.startsWith("#/category-edit/");
        const categoryId = isEditMode ? hash.split("/")[2] : null;

        // ✅ Add hidden input for category ID in edit mode
        if (isEditMode && categoryId) {
            // Remove existing hidden ID input if any
            const existingIdInput = categoryForm.querySelector('input[name="id"]');
            if (existingIdInput) {
                existingIdInput.remove();
            }

            // Add hidden input with category ID
            const idInput = document.createElement("input");
            idInput.type = "hidden";
            idInput.name = "id";
            idInput.value = categoryId;
            categoryForm.appendChild(idInput);
        }

        // ✅ Populate menu_id dropdown with menu titles
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

                        // If editing, pre-select the current menu_id
                        if (isEditMode && categoryId) {
                            try {
                                const resCat = await fetch(`/frontend/menu-category/${categoryId}`);
                                const { success, result } = await resCat.json();
                                if (success && result && result.menu_id) {
                                    menuSelect.value = result.menu_id;
                                }
                            } catch (err) {
                                console.error("Error setting menu selection:", err);
                            }
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
                window.location.hash = "#/list";
            });
        }

        // Submit form
        categoryForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const formData = new FormData(categoryForm);
            const data = Object.fromEntries(formData.entries());

            // Determine if this is create or update
            const isUpdate = isEditMode && categoryId;
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
                    showAlert(`Menu category ${isUpdate ? 'updated' : 'created'} successfully!`, "success");
                    setTimeout(() => {
                        window.location.hash = "#/list";
                    }, 1000);
                } else {
                    showAlert(result.message || `Failed to ${isUpdate ? 'update' : 'create'} category`, "error");
                }
            } catch (err) {
                console.error("Save category error:", err);
                showAlert(`Error ${isUpdate ? 'updating' : 'creating'} menu category`, "error");
            }
        });
    }
    // =============================
    // Cancel Edit Button
    // =============================
    function initCancelEdit() {
        const cancelEditBtn = document.getElementById("cancelCategory");
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener("click", () => {
                window.location.hash = "#/list";
            });
        }
    }

    // =============================
    // Alert Box
    // =============================
    function showAlert(message, type = "success") {
        if (!alertBox) return;

        alertBox.innerHTML = `
            <span>${message}</span>
            <button id="alertOkBtn">OK</button>
        `;
        alertBox.className = `alert-message ${type} show`;
        alertBox.style.display = "flex";

        setTimeout(() => {
            alertBox.classList.remove("show");
            setTimeout(() => (alertBox.style.display = "none"), 300);
        }, 3000);

        const okBtn = document.getElementById("alertOkBtn");
        if (okBtn) okBtn.onclick = () => {
            alertBox.classList.remove("show");
            setTimeout(() => (alertBox.style.display = "none"), 300);
        };
    }

    // =============================
    // Hash Router: List / Create / Edit
    // =============================
    async function loadView() {
        const hash = window.location.hash;

        catListContainer.classList.add("hidden");
        catFormContainer.classList.add("hidden");

        if (hash === "#/category-create" || hash.startsWith("#/category-edit/")) {
            catFormContainer.classList.remove("hidden");
            const id = hash.startsWith("#/category-edit/") ? hash.split("/")[2] : null;
            await loadCategoryForm(id);
        } else {
            catListContainer.classList.remove("hidden");
            await loadCategories();
        }
        updateActiveTab();
    }

    function updateActiveTab() {
        const listTab = document.getElementById("menuCatListTab");
        const createTab = document.getElementById("menuCategoryCreateTab");

        if (!listTab || !createTab) return;

        listTab.classList.remove("active");
        createTab.classList.remove("active");

        const hash = window.location.hash;
        if (hash === "#/category-create" || hash.startsWith("#/category-edit/")) {
            createTab.classList.add("active");
        } else {
            listTab.classList.add("active");
        }
    }

    // =============================
    // Init
    // =============================
    loadView();
    window.addEventListener("hashchange", loadView);
});
