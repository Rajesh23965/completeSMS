

/**
 * ============================================================
 * Faq UI Script
 * Handles list loading, form submission, delete, and Summernote initialization.
 * ============================================================
 */

(() => {
    // ----------------------------
    // GLOBAL STATE & CONSTANTS
    // ----------------------------
    let currentPage = 1;
    let currentLimit = 5;
    let currentSearch = "";
    const listContainer = document.getElementById("faqListContainer");
    const formContainer = document.getElementById("faqFormContainer");

    // ----------------------------
    // HELPER FUNCTIONS
    // ----------------------------

    const getCurrentListState = () => {
        // Ensure we get the latest state from the dynamically loaded list view
        const rowsPerPageSelect = listContainer.querySelector("#rowsPerPage");
        const searchBoxInput = listContainer.querySelector("#searchBox");

        if (rowsPerPageSelect) {
            currentLimit = parseInt(rowsPerPageSelect.value) || 5;
        }
        if (searchBoxInput) {
            currentSearch = searchBoxInput.value.trim();
        }
    };

    const fetchContent = async (url, container) => {
        try {
            container.innerHTML = '<div class="text-center py-4">Loading...</div>';

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const html = await res.text();
            container.innerHTML = html;

            // Attach listeners specific to the loaded content
            if (container.id === "faqListContainer") {
                attachListListeners(container);
            }
            if (container.id === "faqFormContainer") {
                handleFormSubmission(container);
                initializeSummernote(container); // Initialize Summernote here
            }
        } catch (err) {
            console.error("Error loading content:", err);
            container.innerHTML = `<div class="text-danger p-3">Failed to load content: ${err.message}</div>`;
        }
    };

    const loadPage = (page = 1) => {
        currentPage = page;
        getCurrentListState(); // Get current limit and search before loading
        const url = `/frontend/faq/faqList?page=${currentPage}&limit=${currentLimit}&search=${currentSearch}`;
        fetchContent(url, listContainer);
    };

    // ----------------------------
    // SUMMERNOTE INITIALIZATION
    // ----------------------------

    const initializeSummernote = (container) => {
        const form = container.querySelector("#faqForm");
        if (!form) return;

        const descriptionTextarea = container.querySelector('#description');

        // Check for jQuery and the Summernote function
        if (window.jQuery && descriptionTextarea && $.fn.summernote) {
            // Convert the native textarea to a jQuery object for Summernote
            const $description = $(descriptionTextarea);

            // Destroy any existing instance before initializing a new one
            $description.summernote('destroy');

            // --- SUMMERNOTE CONFIGURATION ---
            $description.summernote({
                placeholder: 'Enter the FAQ description here...',
                tabsize: 2,
                height: 300,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'clear']],
                    ['fontname', ['fontname']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['insert', ['link', 'picture', 'video', 'table']],
                    ["history", ["undo", "redo"]],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ],
                // Add fullscreen z-index fix if needed for your environment
                callbacks: {
                    onInit: function () {
                        // Optional: Adjust z-index of fullscreen modal if necessary
                        $(descriptionTextarea).on("summernote.enterFullscreen", function () {
                            $(".note-editor.fullscreen").css("z-index", 1055);
                        });
                    }
                }
            });
        } else if (!descriptionTextarea) {
            console.warn("Description textarea not found. Skipping Summernote init.");
        } else {
            console.warn("Summernote or jQuery not available. Description will be a standard textarea.");
        }
    }


    // ----------------------------
    // MODAL CONFIRMATION HANDLER (No Change)
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
            // Check for modal instance before trying to hide (BS5 method)
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
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

    const deleteFaq = async (id) => {
        showCustomConfirm(
            "Do you want to delete this FAQ?",
            "*Note: This data will be permanently deleted.",
            async () => {
                const res = await fetch(`/frontend/faq/delete/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    loadPage(currentPage);
                    showToast("success", data.message);
                } else {
                    showToast("error", "Failed to delete FAQ.");
                }
            }
        );
    };

    const loadEditForm = (id) => {
        switchTab(document.getElementById("faqCreateTab"));
        // Fetch form content and form will be re-initialized in fetchContent success callback
        fetchContent(`/frontend/faq/edit/${id}`, formContainer);
    };

    const handleFormSubmission = (container) => {
        const form = container.querySelector("#faqForm");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // IMPORTANT: Get content from Summernote before serializing form data
            const descriptionTextarea = container.querySelector('#description');
            if (window.jQuery && descriptionTextarea && $.fn.summernote) {
                // Summernote updates the textarea value automatically, but this ensures it's current.
                // You can skip this line if your Summernote config handles this, 
                // but it's safer to call it manually right before form submission.
                const $description = $(descriptionTextarea);
                $description.val($description.summernote('code'));
            }

            const formData = new FormData(form);
            const url = form.getAttribute("action");

            const urlSearchParams = new URLSearchParams(formData);

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: urlSearchParams.toString()
                });

                const data = await res.json();

                if (data.success) {
                    showToast("success", data.message);
                    switchTab(document.getElementById("faqListTab"));
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
        // Edit Button Listener
        container.querySelectorAll(".btn-edit").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                loadEditForm(e.currentTarget.dataset.id);
            })
        );

        // Delete Button Listener
        container.querySelectorAll(".btn-delete").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                deleteFaq(e.currentTarget.dataset.id);
            })
        );

        // Pagination Link Listener (Handles AJAX pagination)
        container.querySelectorAll(".page-link").forEach((link) =>
            link.addEventListener("click", (e) => {
                e.preventDefault();

                // Do not proceed if the link is disabled
                if (e.currentTarget.classList.contains('disabled')) {
                    return;
                }

                // Get page number from data-page attribute (set in faqList.ejs)
                const newPage = parseInt(e.currentTarget.dataset.page);

                if (!isNaN(newPage) && newPage > 0) {
                    loadPage(newPage);
                }
            })
        );

        // Rows Per Page Listener
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
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    loadPage(1);
                }
            });
        }
    };

    // ----------------------------
    // TABS & INITIALIZATION
    // ----------------------------

    const listTab = document.getElementById("faqListTab");
    const createTab = document.getElementById("faqCreateTab");

    const switchTab = (activeTab) => {
        listTab.classList.remove("active-tab");
        createTab.classList.remove("active-tab");
        activeTab.classList.add("active-tab");

        if (activeTab === listTab) {
            formContainer.classList.add("hidden");
            listContainer.classList.remove("hidden");
            loadPage(1); // Reload list when switching back to the list tab
        } else {
            listContainer.classList.add("hidden");
            formContainer.classList.remove("hidden");
            // If switching to Create Tab, load the blank form
            if (activeTab === createTab && !formContainer.querySelector('#faqForm [name="id"]')) {
                fetchContent("/frontend/faq/faqUI", formContainer);
            }
        }
    };

    const showToast = (type, message) => {
        const bg = type === "success" ? "bg-success" : "bg-danger";
        const toast = document.createElement("div");
        // Use Bootstrap classes for positioning (requires Bootstrap 5)
        toast.className = `toast align-items-center text-white border-0 position-fixed top-0 end-0 m-3 ${bg}`;
        toast.role = "alert";
        toast.setAttribute("aria-live", "assertive");
        toast.setAttribute("aria-atomic", "true");
        toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
        document.body.appendChild(toast);
        // Ensure Bootstrap's Toast is initialized
        const bsToast = new bootstrap.Toast(toast, { delay: 2500 });
        bsToast.show();
        toast.addEventListener("hidden.bs.toast", () => toast.remove());
    };

    document.addEventListener("DOMContentLoaded", () => {
        if (!listTab || !createTab || !listContainer || !formContainer) {
            console.error("FAQs containers or tabs not found.");
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

        // Load the list initially
        switchTab(listTab);

        // Inject styles for tabs (Keep existing styling)
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
