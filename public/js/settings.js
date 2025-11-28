document.addEventListener("DOMContentLoaded", async () => {

  // Fetch settings from API
  let settings = {};
  try {
    const res = await fetch("/frontend/api");
    const data = await res.json();
    if (data.success && data.data) settings = data.data;
  } catch (err) {
    console.error("Error loading settings:", err);
  }

  // Fill normal inputs
  Object.keys(settings).forEach(key => {
    const field = document.querySelector(`[name="${key}"]`);
    if (!field) return;

    if (field.type === "file") return;

    if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
      field.value = settings[key] || "";
    } else if (field.tagName === "SELECT") {
      [...field.options].forEach(opt => {
        if (opt.value === settings[key]) opt.selected = true;
      });
    }
  });

  // Setup drag & drop with preview areas
  setupDragDrop(
    document.getElementById("leftLogoDropArea"),
    document.getElementById("leftLogoInput"),
    document.getElementById("leftLogoPreview")
  );

  setupDragDrop(
    document.getElementById("rightLogoDropArea"),
    document.getElementById("rightLogoInput"),
    document.getElementById("rightLogoPreview")
  );

  setupDragDrop(
    document.getElementById("faviconDropArea"),
    document.getElementById("faviconInput"),
    document.getElementById("faviconPreview")
  );

  // Populate previews if logos/fav_icon already exist
  if (settings.left_logo) populatePreview("leftLogoPreview", settings.left_logo, "left_logo");
  if (settings.right_logo) populatePreview("rightLogoPreview", settings.right_logo, "right_logo");
  if (settings.fav_icon) populatePreview("faviconPreview", settings.fav_icon, "favicon");

  // Settings form submit
  const settingsForm = document.getElementById("settingsForm");
  const alertBox = document.getElementById("alertMessage");

  function showAlert(message, type = "success") {
    alertBox.innerHTML = `<span>${message}</span><button id="alertOkBtn">OK</button>`;
    alertBox.className = `alert-message ${type} show`;
    alertBox.style.display = "flex";

    document.getElementById("alertOkBtn").onclick = () => {
      alertBox.classList.remove("show");
      setTimeout(() => (alertBox.style.display = "none"), 500);
    };

    setTimeout(() => {
      if (alertBox.classList.contains("show")) {
        alertBox.classList.remove("show");
        setTimeout(() => (alertBox.style.display = "none"), 500);
      }
    }, 3000);
  }

  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      try {
        const res = await fetch("/frontend/api/save", { method: "POST", body: formData });
        const data = await res.json();
        showAlert(data.success ? "Settings saved successfully!" : "Failed to save settings",
          data.success ? "success" : "error");
      } catch (err) {
        console.error("Error saving settings:", err);
        showAlert("Something went wrong", "error");
      }
    });
  }

});


function populatePreview(previewId, filePath, key) {
  const previewArea = document.getElementById(previewId);
  if (!previewArea) return;

  previewArea.innerHTML = `
    <div class="preview-item">
      <img src="${filePath}" alt="${key}">
      <div class="remove-btn" onclick="removeImage('${key}')"><i class="fas fa-times"></i></div>
    </div>
  `;
}
