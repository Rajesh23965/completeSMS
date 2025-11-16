// public/js/galleryAlbum.js

/**
 * ============================================================
 * Album & Album Content Logic
 * Handles list loading, form submission, modal visibility, and delete.
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
    const contentContainer = document.getElementById("albumContentListContainer"); // New container for content

    // ----------------------------
    // HELPER FUNCTIONS
    // ----------------------------

    const getCurrentListState = (container) => {
        let limit = 5;
        let search = "";

        if (container.querySelector("#rowsPerPage")) {
            limit = parseInt(container.querySelector("#rowsPerPage").value) || 5;
        }
        if (container.querySelector("#searchBox")) {
            search = container.querySelector("#searchBox").value.trim();
        }
        return { limit, search };
    };

    const getCurrentContentListState = (container) => {
        let limit = 10; // Default for content list
        let search = "";

        if (container.querySelector("#contentRowsPerPage")) {
            limit = parseInt(container.querySelector("#contentRowsPerPage").value) || 10;
        }
        if (container.querySelector("#contentSearchBox")) {
            search = container.querySelector("#contentSearchBox").value.trim();
        }
        return { limit, search };
    };

    const fetchContent = async (url, container, attachListenersFn) => {
        try {
            container.innerHTML = '<div class="text-center py-4">Loading...</div>';
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const html = await res.text();
            container.innerHTML = html;

            if (attachListenersFn) attachListenersFn(container);

        } catch (err) {
            console.error("Error loading content:", err);
            container.innerHTML = `<div class="text-danger p-3">Failed to load content: ${err.message}</div>`;
        }
    };

    // --- Album List Logic ---
    const loadPage = (page = 1) => {
        currentPage = page;
        const state = getCurrentListState(listContainer);
        currentLimit = state.limit;
        currentSearch = state.search;
        const url = `/frontend/gallery/album/galleryList?page=${currentPage}&limit=${currentLimit}&search=${currentSearch}`;
        fetchContent(url, listContainer, attachListListeners);
    };

    // --- Album Content List Logic ---
    const loadContentPage = (albumId, page = 1) => {
        const state = getCurrentContentListState(contentContainer);
        const limit = state.limit;
        const search = state.search;

        const url = `/frontend/gallery/album/content/${albumId}?page=${page}&limit=${limit}&search=${search}`;
        fetchContent(url, contentContainer, attachContentListListeners);
    };


    const showCustomConfirm = (message, note, callback) => {
        // ... (Keep existing showCustomConfirm function) ...
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

    const deleteGallery = async (id, isContent = false, albumId) => {
        const endpoint = isContent ? `/frontend/gallery/album/content/${id}` : `/frontend/gallery/album/${id}`;
        const message = isContent ? "Do you want to delete this media item?" : "Do you want to delete this album?";

        showCustomConfirm(
            message,
            "*Note: This data will be permanently deleted.",
            async () => {
                const res = await fetch(endpoint, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                    if (isContent) {
                        loadContentPage(albumId, 1); // Reload content list
                    } else {
                        loadPage(currentPage); // Reload main album list
                    }
                    showToast("success", data.message);
                } else {
                    showToast("error", "Failed to delete item.");
                }
            }
        );
    };


    const loadEditForm = (id) => {
        switchTab(document.getElementById("galleryUploadCreateTab"));
        fetchContent(`/frontend/gallery/album/edit/${id}`, formContainer, handleFormSubmission);
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

    // NEW: Handle submission for the media modal
    const handleMediaModalSubmission = () => {
        const form = document.getElementById("mediaUploadForm");
        const modalEl = document.getElementById('uploadMediaModal');

        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const albumId = form.querySelector('[name="album_id"]').value;
            const formData = new FormData(form);
            const url = form.getAttribute("action"); // /frontend/gallery/album/content/:albumId

            try {
                const res = await fetch(url, { method: "POST", body: formData });
                const data = await res.json();

                if (data.success) {
                    showToast("success", data.message);

                    // Hide modal and clear form
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    modal.hide();
                    form.reset();

                    // Reload the content list
                    loadContentPage(albumId, 1);

                } else {
                    showToast("error", data.message);
                }
            } catch (err) {
                console.error("Error submitting media form:", err);
                showToast("error", "An unexpected error occurred while saving media.");
            }
        });
    }

    // ----------------------------
    // LISTENERS (Dynamic Content)
    // ----------------------------

    const attachListListeners = (container) => {
        // ... (Existing list listeners for main Album page)

        container.querySelectorAll(".btn-edit").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                loadEditForm(e.currentTarget.dataset.id);
            })
        );

        container.querySelectorAll(".btn-delete").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                deleteGallery(e.currentTarget.dataset.id, false); // Not content
            })
        );

        // ... (toggle publish listeners) ...

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
            searchBox.addEventListener("input", () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => loadPage(1), 400);
            });

            searchBox.addEventListener("keypress", (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    loadPage(1);
                }
            });
        }

        // Ensure album form D&D is setup for the main album
        setupPhotoDragDrop();
    };

    // NEW: Listeners for Album Content page
    const attachContentListListeners = (container) => {
        const albumId = container.querySelector('#contentRowsPerPage')?.dataset.albumId;
        if (!albumId) return;

        // Pagination links
        container.querySelectorAll(".content-page-link").forEach((link) =>
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                if (page > 0) loadContentPage(albumId, page);
            })
        );

        // Rows per page change
        container.querySelector("#contentRowsPerPage")?.addEventListener("change", () => loadContentPage(albumId, 1));

        // Search
        let searchTimeout;
        const searchBox = container.querySelector("#contentSearchBox");
        if (searchBox) {
            searchBox.addEventListener("input", () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => loadContentPage(albumId, 1), 400);
            });
            searchBox.addEventListener("keypress", (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    loadContentPage(albumId, 1);
                }
            });
        }

        // Delete buttons
        container.querySelectorAll(".btn-content-delete").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                deleteGallery(e.currentTarget.dataset.id, true, albumId);
            })
        );

        // Note: Edit functionality for content is not fully implemented but the listener is here
        container.querySelectorAll(".btn-content-edit").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                // Placeholder for content edit logic if implemented later
                showToast("info", "Edit functionality for media content not implemented yet.");
            })
        );
    };


    const setupPhotoDragDrop = () => {
        // ... (Keep existing setupPhotoDragDrop function for main album form)
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
            fetchContent("/frontend/gallery/album/galleryUI", formContainer, handleFormSubmission);
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

    // NEW: Logic for conditional fields in the media upload modal
    const setupMediaModalLogic = () => {
        const mediaTypeSelect = document.getElementById("mediaType");
        const videoUrlSection = document.getElementById("videoUrlSection");
        const videoUrlInput = document.getElementById("videoUrl");
        const thumbImageInput = document.getElementById("thumbImageInput");

        const updateModalFields = () => {
            if (mediaTypeSelect.value === "Photo") {
                // Photo selected: Hide Video URL, Thumb Image is ALWAYS visible and required.
                videoUrlSection.classList.add("hidden");
                videoUrlInput.required = false;
            } else if (mediaTypeSelect.value === "Video URL") {
                // Video URL selected: Show Video URL, Thumb Image is ALWAYS visible and required.
                videoUrlSection.classList.remove("hidden");
                videoUrlInput.required = true;
            }
            // ThumbImageInput is always required by the HTML structure
        };

        if (mediaTypeSelect) {
            mediaTypeSelect.addEventListener("change", updateModalFields);
            updateModalFields(); // Initial setup
        }
    };


    // General function to set up drag-and-drop for any file input (Moved here for clarity)
    const setupDragDrop = (dropAreaId, fileInputId, previewContainerId) => {
        const dropArea = document.getElementById(dropAreaId);
        const fileInput = document.getElementById(fileInputId);
        const previewContainer = document.getElementById(previewContainerId);

        if (!dropArea || !fileInput || !previewContainer) return;

        const handleFile = (file) => {
            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    let mediaHtml = '';
                    if (file.type.startsWith("image/")) {
                        mediaHtml = `<img src="${e.target.result}" style="max-width:150px; border-radius:8px; border:1px solid #ddd;">`;
                    } else {
                        mediaHtml = `<i class="fas fa-video fa-3x text-success"></i><p class="small mt-2">File ready: ${file.name}</p>`;
                    }

                    previewContainer.innerHTML = `
                        <div class="position-relative d-inline-block p-2">
                            ${mediaHtml}
                            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0" style="z-index: 1;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;

                    previewContainer.querySelector("button").addEventListener("click", (e) => {
                        e.stopPropagation();
                        fileInput.value = "";
                        previewContainer.innerHTML = `
                            <i class="fas fa-cloud-upload-alt fa-3x text-secondary mb-2"></i>
                            <p class="mb-1 text-secondary">Drag and drop a file here or click</p>
                        `;
                    });
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.innerHTML = '<div class="text-danger small">Invalid file type.</div>';
            }
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

        // Handle file input click/selection
        dropArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        });
    };



    document.addEventListener("DOMContentLoaded", () => {
        if (listTab && createTab && listContainer && formContainer) {
            listTab.addEventListener("click", (e) => {
                e.preventDefault();
                switchTab(listTab);
            });
            createTab.addEventListener("click", (e) => {
                e.preventDefault();
                switchTab(createTab);
            });

            switchTab(listTab);
        }

        // --- Album Content Page Initialization ---
        if (contentContainer) {
            // Get album ID from the URL or a hidden field if possible. 
            // For simplicity, we assume the album ID is the last path segment before the query string
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            let albumId = null;
            if (pathSegments.length >= 3 && pathSegments[pathSegments.length - 2] === 'album') {
                albumId = pathSegments[pathSegments.length - 1];
            }

            if (albumId && albumId !== 'galleryList' && albumId !== 'galleryUploadUI' && albumId !== 'edit') {
                // If we are on the /frontend/gallery/album/:albumId page, load content list
                loadContentPage(albumId);
            }
        }

        // --- Media Upload Modal Initialization ---
        const mediaModalEl = document.getElementById('uploadMediaModal');
        if (mediaModalEl) {

            // CRITICAL FIX: Add listener to ensure form is reset when modal is shown
            mediaModalEl.addEventListener('show.bs.modal', () => {
                const form = document.getElementById("mediaUploadForm");
                const idInput = document.getElementById("mediaItemId");

                // 1. Reset the entire form fields
                if (form) form.reset();

                // 2. Clear the hidden ID input specifically to force an INSERT
                if (idInput) idInput.value = "";

                // 3. Reset the upload button text
                const uploadBtn = document.getElementById("uploadMediaBtn");
                if (uploadBtn) uploadBtn.innerHTML = '<i class="fas fa-upload me-2"></i> Upload';

                // 4. Clear existing thumb image preview if any (optional, depends on your D&D setup)
                const thumbPreview = document.getElementById("thumbImagePreview");
                if (thumbPreview) {
                    thumbPreview.innerHTML = `
                        <i class="fas fa-cloud-upload-alt fa-3x text-secondary mb-2"></i>
                        <p class="mb-1 text-secondary">Drag and drop a file here or click</p>
                    `;
                }

            });

            mediaModalEl.addEventListener('shown.bs.modal', () => {
                setupMediaModalLogic();
                setupDragDrop("thumbDropArea", "thumbImageInput", "thumbImagePreview");
                handleMediaModalSubmission();
            });
        }

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