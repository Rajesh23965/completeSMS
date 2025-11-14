// public/js/front_gallery.js

/**
 * ============================================================
 * Album 
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
    const listContainer = document.getElementById("galleryUploadListContainer");
    const formContainer = document.getElementById("galleryUploadFormContainer");

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

            if (container.id === "galleryUploadListContainer") attachListListeners(container);
            if (container.id === "galleryUploadFormContainer") {
                handleFormSubmission();
                setupPhotoDragDrop();
            }
        } catch (err) {
            console.error("Error loading content:", err);
            container.innerHTML = `<div class="text-danger p-3">Failed to load content: ${err.message}</div>`;
        }
    };

    const loadPage = (page = 1) => {
        currentPage = page;
        getCurrentListState();
        const url = `/frontend/gallery/album/galleryList?page=${currentPage}&limit=${currentLimit}&search=${currentSearch}`;
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

    const deleteGallery = async (id) => {
        showCustomConfirm(
            "Do you want to delete this album?",
            "*Note: This data will be permanently deleted.",
            async () => {
                const res = await fetch(`/frontend/gallery/album/delete/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    loadPage(currentPage);
                    showToast("success", data.message);
                } else {
                    showToast("error", "Failed to delete album.");
                }
            }
        );
    };


    const loadEditForm = (id) => {
        switchTab(document.getElementById("galleryUploadCreateTab"));
        fetchContent(`/frontend/gallery/album/edit/${id}`, formContainer);
    };

    const handleFormSubmission = () => {
        const form = document.getElementById("albumForm");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const url = form.getAttribute("action");

            try {
                const res = await fetch(url, { method: "POST", body: formData });
                const data = await res.json();

                if (data.success) {
                    showToast("success", data.message);
                    switchTab(document.getElementById("galleryUploadListTab"));
                } else {
                    showToast("error", data.message);
                }
            } catch (err) {
                console.error("Error submitting form:", err);
                showToast("error", "An unexpected error occurred while saving.");
            }
        });
    };

    const setupPhotoDragDrop = () => {
        const dropArea = document.getElementById("galleryPhotoDropArea");
        const fileInput = document.getElementById("galleryPhotoInput");
        const previewContainer = document.getElementById("galleryPhotoPreview");

        if (!dropArea || !fileInput || !previewContainer) return;

        const handleFile = (file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewContainer.innerHTML = `
          <div class="position-relative d-inline-block">
            <img src="${e.target.result}" style="max-width:200px; border-radius:8px; border:1px solid #ddd;">
            <button type="button" class="btn btn-danger btn-sm position-absolute" style="top:5px; right:5px;">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
                previewContainer.querySelector("button").addEventListener("click", () => {
                    fileInput.value = "";
                    previewContainer.innerHTML = "";
                });
            };
            reader.readAsDataURL(file);
        };

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) =>
            dropArea.addEventListener(evt, preventDefaults)
        );

        ["dragenter", "dragover"].forEach((evt) =>
            dropArea.addEventListener(evt, () => dropArea.classList.add("border-primary"))
        );

        ["dragleave", "drop"].forEach((evt) =>
            dropArea.addEventListener(evt, () => dropArea.classList.remove("border-primary"))
        );

        dropArea.addEventListener("drop", (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFile(files[0]);
            }
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
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
                deleteGallery(e.currentTarget.dataset.id);
            })
        );

        container.querySelectorAll(".btn-toggle-publish").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                toggleShow(e.currentTarget);
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

    const listTab = document.getElementById("galleryUploadListTab");
    const createTab = document.getElementById("galleryUploadCreateTab");

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
            fetchContent("/frontend/gallery/album/galleryUI", formContainer);
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
            console.error("Album containers or tabs not found.");
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
