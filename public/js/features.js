// public/js/features.js

/**
 * ============================================================
 * Features UI Script
 * Handles list loading, form submission and delete.
 * ============================================================
 */

(() => {
    // ----------------------------
    // GLOBAL STATE
    // ----------------------------
    let currentPage = 1;
    let currentLimit = 5;
    let currentSearch = "";
    const listContainer = document.getElementById("featureListContainer");
    const formContainer = document.getElementById("featureFormContainer");

    // ----------------------------
    // HELPER FUNCTIONS
    // ----------------------------

    const getCurrentListState = () => {
        if (listContainer.querySelector("#rowsPerPage")) {
            currentLimit = parseInt(listContainer.querySelector("#rowsPerPage").value) || 5;
        }
        if (listContainer.querySelector("#searchBox")) {
            currentSearch = listContainer.querySelector("#searchBox").value.trim();
        }
    };

    const fetchContent = async (url, container) => {
        try {
            container.innerHTML = '<div class="text-center py-4">Loading...</div>';
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const html = await res.text();
            container.innerHTML = html;

            if (container.id === "featureListContainer") attachListListeners(container);
            if (container.id === "featureFormContainer") {
                handleFormSubmission();
            }
        } catch (err) {
            console.error("Error loading content:", err);
            container.innerHTML = `<div class="text-danger p-3">Failed to load content: ${err.message}</div>`;
        }
    };

    const loadPage = (page = 1) => {
        currentPage = page;
        getCurrentListState();
        const url = `/frontend/features/featuresList?page=${currentPage}&limit=${currentLimit}&search=${currentSearch}`;
        fetchContent(url, listContainer);
    };

    // ----------------------------
    // MODAL CONFIRMATION HANDLER
    // ----------------------------

    const showCustomConfirm = (message, note, callback) => {
        const modalEl = document.getElementById("customConfirmModal");
        const modalText = document.getElementById("confirmModalText");
        const continueBtn = document.getElementById("confirmContinueBtn");

        modalText.textContent = message;

        // Reset event listener to avoid duplicates
        const newBtn = continueBtn.cloneNode(true);
        continueBtn.replaceWith(newBtn);

        newBtn.addEventListener("click", () => {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            callback();
        });

        // Use Bootstrap 5's Modal API
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    };


    // ----------------------------
    // CRUD ACTIONS
    // ----------------------------

    const deleteFeature = async (id) => {
        showCustomConfirm(
            "Do you want to delete this feature?",
            "*Note: This data will be permanently deleted.",
            async () => {
                const res = await fetch(`/frontend/features/delete/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    loadPage(currentPage);
                    showToast("success", data.message);
                } else {
                    showToast("error", "Failed to delete feature.");
                }
            }
        );
    };



    const loadEditForm = (id) => {
        switchTab(document.getElementById("featureCreateTab"));
        fetchContent(`/frontend/features/edit/${id}`, formContainer);
    };

  // public/js/features.js

const handleFormSubmission = () => {
    const form = document.getElementById("featuresForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const url = form.getAttribute("action");

        // 👇 FIX: Define urlSearchParams here
        const urlSearchParams = new URLSearchParams(formData); 
        // 👆 This line converts the form data into the necessary format.

        try {
            const res = await fetch(url, { 
                method: "POST", 
                headers: {
                    // Set the correct Content-Type for the server's body-parser
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                // Send the URL-encoded string as the body
                body: urlSearchParams.toString()
            });

            const data = await res.json();

            if (data.success) {
                showToast("success", data.message);
                switchTab(document.getElementById("featureListTab"));
            } else {
                showToast("error", data.message);
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            showToast("error", "An unexpected error occurred while saving.");
        }
    });
};

    // ----------------------------
    // LISTENERS (Dynamic Content)
    // ----------------------------

    const attachListListeners = (container) => {
        container.querySelectorAll(".btn-edit").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                loadEditForm(e.currentTarget.dataset.id);
            })
        );

        container.querySelectorAll(".btn-delete").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                deleteFeature(e.currentTarget.dataset.id);
            })
        );



        container.querySelectorAll(".page-link").forEach((link) =>
            link.addEventListener("click", (e) => {
                e.preventDefault();
                loadPage(parseInt(e.currentTarget.dataset.page));
            })
        );

        container.querySelector("#rowsPerPage")?.addEventListener("change", () => loadPage(1));

        let searchTimeout;
        const searchBox = container.querySelector("#searchBox");

        if (searchBox) {
            // 1. INPUT listener for debounced search (on typing)
            searchBox.addEventListener("input", () => {
                clearTimeout(searchTimeout);
                // Search will happen 400ms after the user stops typing
                searchTimeout = setTimeout(() => loadPage(1), 400);
            });

            // 2. KEYPRESS listener for instant search on Enter key
            searchBox.addEventListener("keypress", (e) => {
                // Check if the pressed key is 'Enter'
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent default form submission behavior (if any)
                    clearTimeout(searchTimeout); // Cancel any pending debounced search
                    loadPage(1); // Load the page immediately
                }
            });
        }
    };

    // ----------------------------
    // TABS & INITIALIZATION
    // ----------------------------

    const listTab = document.getElementById("featureListTab");
    const createTab = document.getElementById("featureCreateTab");

    const switchTab = (activeTab) => {
        listTab.classList.remove("active-tab");
        createTab.classList.remove("active-tab");
        activeTab.classList.add("active-tab");

        if (activeTab === listTab) {
            formContainer.classList.add("hidden");
            listContainer.classList.remove("hidden");
            loadPage(1);
        } else {
            listContainer.classList.add("hidden");
            formContainer.classList.remove("hidden");
            fetchContent("/frontend/features/featuresUI", formContainer);
        }
    };

    const showToast = (type, message) => {
        const bg = type === "success" ? "bg-success" : "bg-danger";
        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-white border-0 position-fixed top-0 end-0 m-3 ${bg}`;
        toast.role = "alert";
        toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 2500 });
        bsToast.show();
        toast.addEventListener("hidden.bs.toast", () => toast.remove());
    };

    document.addEventListener("DOMContentLoaded", () => {
        if (!listTab || !createTab || !listContainer || !formContainer) {
            console.error("Features containers or tabs not found.");
            return;
        }

        listTab.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab(listTab);
        });
        createTab.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab(createTab);
        });

        switchTab(listTab);

        // Inject styles for tabs
        const style = document.createElement("style");
        style.textContent = `
      .hidden { display: none !important; }
      .section-title { padding: 10px 15px; cursor: pointer; color: #444; border-bottom: 2px solid transparent; }
      .section-title:hover { color: #007bff; }
      .active-tab { color: #007bff; border-bottom: 2px solid #007bff; font-weight: 600; }
    `;
        document.head.appendChild(style);
    });
})();
