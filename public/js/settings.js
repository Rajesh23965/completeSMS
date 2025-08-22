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
          if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
            field.value = settings[key];
          }
          if (field.tagName === "SELECT") {
            [...field.options].forEach(opt => {
              if (opt.value === settings[key]) {
                opt.selected = true;
              }
            });
          }
        }
      });

      // Logo preview
      if (settings.logo) {
        const dropArea = document.getElementById("logoDropArea");
        dropArea.innerHTML = `<div class="preview-item">
          <img src="${settings.logo}" alt="Logo">
          <div class="remove-btn"><i class="fas fa-times"></i></div>
        </div>`;
      }

      // Favicon preview
      if (settings.fav_icon) {
        const dropArea = document.getElementById("faviconDropArea");
        dropArea.innerHTML = `<div class="preview-item">
          <img src="${settings.fav_icon}" alt="Favicon">
          <div class="remove-btn"><i class="fas fa-times"></i></div>
        </div>`;
      }
    }
  } catch (err) {
    console.error("Error loading settings:", err);
  }
});


document.getElementById("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  try {
    const res = await fetch("/frontend/api/save", { method: "POST", body: formData });
    const data = await res.json();

    const alertBox = document.getElementById("alertMessage");

    function showAlert(message, type = "success") {
      alertBox.innerHTML = `
    <span>${message}</span>
    <button id="alertOkBtn">OK</button>
  `;

      alertBox.className = `alert-message ${type} show`;
      alertBox.style.display = "flex";

      // OK button closes immediately
      document.getElementById("alertOkBtn").onclick = () => {
        alertBox.classList.remove("show");
        setTimeout(() => (alertBox.style.display = "none"), 500);
      };

      // Auto hide after 3s if not closed
      setTimeout(() => {
        if (alertBox.classList.contains("show")) {
          alertBox.classList.remove("show");
          setTimeout(() => (alertBox.style.display = "none"), 500);
        }
      }, 3000);
    }

    document.getElementById("settingsForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);

      try {
        const res = await fetch("/frontend/api/save", { method: "POST", body: formData });
        const data = await res.json();

        if (data.success) {
          showAlert("Settings saved successfully!", "success");
        } else {
          showAlert("Failed to save settings", "error");
        }
      } catch (err) {
        console.error("Error saving settings:", err);
        showAlert("⚠️ Something went wrong", "error");
      }
    });

    if (data.success) {
      alertBox.textContent = "✅ Settings saved successfully!";
      alertBox.style.display = "block";
      alertBox.classList.add("success");
    } else {
      alertBox.textContent = "❌ Failed to save settings";
      alertBox.style.display = "block";
      alertBox.classList.add("error");
    }
  } catch (err) {
    console.error("Error saving settings:", err);
  }
});



document.addEventListener("DOMContentLoaded", () => {
  // Attach change events to all color pickers
  document.querySelectorAll(".color-picker-container").forEach(container => {
    const colorInput = container.querySelector(".color-input");
    const textInput = container.querySelector(".color-text-input");
    const preview = container.querySelector(".color-preview");

    // Update preview + text when color input changes
    colorInput.addEventListener("input", () => {
      preview.style.backgroundColor = colorInput.value;
      textInput.value = colorInput.value;
    });

    // Update preview + color input when text field changes
    textInput.addEventListener("input", () => {
      let val = textInput.value.trim();

      // Ensure it starts with #
      if (!val.startsWith("#")) {
        val = "#" + val.replace(/[^0-9a-f]/gi, "");
      }

      // If valid hex, update
      if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
        preview.style.backgroundColor = val;
        colorInput.value = val;
      }
    });
  });
});
