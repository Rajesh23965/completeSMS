/**
 * ============================================================
 * Gallery Category UI Script
 * Handles list loading, form submission, and delete.
 * ============================================================
 */

(() => {
  // ----------------------------
  // GLOBAL STATE
  // ----------------------------
  let currentPage = 1;
  let currentLimit = 5;
  let currentSearch = "";
  const listContainer = document.getElementById("galleryCatListContainer");
  const formContainer = document.getElementById("galleryCatFormContainer");

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

      if (container.id === "galleryCatListContainer") attachListListeners(container);
      if (container.id === "galleryCatFormContainer") {
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
    const url = `/frontend/gallery/category/galleryCatList?page=${currentPage}&limit=${currentLimit}&search=${currentSearch}`;
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

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  };

  // ----------------------------
  // CRUD ACTIONS
  // ----------------------------

  const deleteGalleryCat = async (id) => {
    showCustomConfirm(
      "Do you want to delete this category?",
      "*Note: This data will be permanently deleted.",
      async () => {
        const res = await fetch(`/frontend/gallery/category/delete/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          loadPage(currentPage);
          showToast("success", data.message);
        } else {
          showToast("error", "Failed to delete gallery category.");
        }
      }
    );
  };

  const loadEditForm = (id) => {
    switchTab(document.getElementById("galleryCatCreateTab"));
    fetchContent(`/frontend/gallery/category/edit/${id}`, formContainer);
  };

  // ----------------------------
  // FORM SUBMISSION HANDLER
  // ----------------------------

  const handleFormSubmission = () => {
    const form = document.getElementById("galleryCatForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const url = form.getAttribute("action");

      const urlSearchParams = new URLSearchParams(formData);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlSearchParams.toString(),
        });

        const data = await res.json();

        if (data.success) {
          showToast("success", data.message);
          switchTab(document.getElementById("galleryCatListTab"));
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
        deleteGalleryCat(e.currentTarget.dataset.id);
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
      searchBox.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => loadPage(1), 400);
      });

      searchBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
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

  const listTab = document.getElementById("galleryCatListTab");
  const createTab = document.getElementById("galleryCatCreateTab");

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
      fetchContent("/frontend/gallery/category/galleryCatUI", formContainer);
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

  // ----------------------------
  // INITIAL LOAD
  // ----------------------------

  document.addEventListener("DOMContentLoaded", () => {
    if (!listTab || !createTab || !listContainer || !formContainer) {
      console.error("Gallery category containers or tabs not found.");
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

    // Inject tab styles
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
