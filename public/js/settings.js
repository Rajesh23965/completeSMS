// public/js/settings.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/frontend/api");
    const data = await res.json();

    if (data.success && data.data) {
      const settings = data.data;

      // Fill inputs
      Object.keys(settings).forEach(key => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
          if (field.type === "file") {
            return;
          }

          if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
            field.value = settings[key] || "";
          } else if (field.tagName === "SELECT") {
            [...field.options].forEach(opt => {
              if (opt.value === settings[key]) {
                opt.selected = true;
              }
            });
          }
        }
      });

      // Update color previews with actual database values
      document.querySelectorAll(".color-picker-container").forEach(container => {
        const colorInput = container.querySelector(".color-input");
        const textInput = container.querySelector(".color-text-input");
        const preview = container.querySelector(".color-preview");

        if (colorInput && preview) {
          // Use the actual value from the form input (which was set from DB)
          preview.style.backgroundColor = colorInput.value;
        }
        if (colorInput && textInput) {
          textInput.value = colorInput.value;
        }
      });

      // Logo preview
      if (settings.logo) {
        const dropArea = document.getElementById("logoDropArea");
        if (dropArea) {
          dropArea.innerHTML = `
            <div class="preview-item">
              <img src="${settings.logo}" alt="Logo">
              <div class="overlay">
                <span class="file-name">${settings.logo.split('/').pop()}</span>
                <div class="remove-btn">Remove</div>
              </div>
            </div>`;
        }
      }

      // Favicon preview
      if (settings.fav_icon) {
        const dropArea = document.getElementById("faviconDropArea");
        if (dropArea) {
          dropArea.innerHTML = `
            <div class="preview-item">
              <img src="${settings.fav_icon}" alt="Favicon">
              <div class="overlay">
                <span class="file-name">${settings.fav_icon.split('/').pop()}</span>
                <div class="remove-btn">Remove</div>
              </div>
            </div>`;
        }
      }
    }
  } catch (err) {
    console.error("Error loading settings:", err);
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settingsForm");
  const alertBox = document.getElementById("alertMessage");

  function showAlert(message, type = "success") {
    alertBox.innerHTML = `
      <span>${message}</span>
      <button id="alertOkBtn">OK</button>
    `;
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

  // Make color pickers interactive
  document.querySelectorAll(".color-input").forEach(input => {
    input.addEventListener("input", function () {
      const container = this.closest(".color-picker-container");
      const preview = container.querySelector(".color-preview");
      const textInput = container.querySelector(".color-text-input");

      preview.style.backgroundColor = this.value;
      textInput.value = this.value;
    });
  });

  document.querySelectorAll(".color-text-input").forEach(input => {
    input.addEventListener("input", function () {
      const container = this.closest(".color-picker-container");
      const colorInput = container.querySelector(".color-input");
      const preview = container.querySelector(".color-preview");

      // Validate hex color
      if (/^#([0-9A-F]{3}){1,2}$/i.test(this.value)) {
        colorInput.value = this.value;
        preview.style.backgroundColor = this.value;
      }
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    // Update all color previews with their data-color values
    document.querySelectorAll('.color-preview').forEach(preview => {
      const color = preview.getAttribute('data-color');
      preview.style.backgroundColor = color;
    });
  });
});

