
  document.addEventListener("DOMContentLoaded", () => {
    /* =====================
       ALERT HANDLER
    ====================== */
    const alertMessage = document.getElementById('alertMessage');
    
    const showAlert = (message, isSuccess = true) => {
      alertMessage.textContent = message;
      alertMessage.style.display = 'block';
      alertMessage.className = `alert-message alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
      setTimeout(() => {
        alertMessage.style.display = 'none';
      }, 5000);
    };

    /* =====================
       FORM SUBMISSION HANDLERS
    ====================== */
    
    // 1. General Settings Form
    const generalForm = document.getElementById('generalSettingsForm');
    if (generalForm) {
      generalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(generalForm);
        const data = Object.fromEntries(formData.entries());

        try {
          const response = await fetch(generalForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          showAlert(result.message || 'General settings saved successfully!', response.ok);
        } catch (error) {
          console.error('Submission error:', error);
          showAlert('Network error or server connection failed.', false);
        }
      });
    }

    // 2. Registration Settings Form
    const registrationForm = document.getElementById('registrationSettingsForm');
    if (registrationForm) {
      registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registrationForm);
        const data = Object.fromEntries(formData.entries());

        try {
          const response = await fetch(registrationForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          showAlert(result.message || 'Registration settings saved successfully!', response.ok);
        } catch (error) {
          console.error('Submission error:', error);
          showAlert('Network error or server connection failed.', false);
        }
      });
    }

    // 3. Fees Settings Form
    const feesForm = document.getElementById('feesSettingsForm');
    if (feesForm) {
      feesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(feesForm);
        const data = Object.fromEntries(formData.entries());

        try {
          const response = await fetch(feesForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          showAlert(result.message || 'Fees settings saved successfully!', response.ok);
        } catch (error) {
          console.error('Submission error:', error);
          showAlert('Network error or server connection failed.', false);
        }
      });
    }

    // 4. Logo Settings Form
    const logoForm = document.getElementById('logoSettingsForm');
    if (logoForm) {
      // Live preview for logo uploads
      const logoUploadInputs = document.querySelectorAll('.logo-upload-input');
      logoUploadInputs.forEach(input => {
        input.addEventListener('change', function(e) {
          const file = this.files[0];
          const previewSelector = this.getAttribute('data-preview');
          const preview = document.querySelector(previewSelector);
          
          if (file && preview) {
            const reader = new FileReader();
            reader.onload = function(e) {
              preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      });

      logoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(logoForm);
        
        try {
          const response = await fetch(logoForm.action, {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          showAlert(result.message || 'Logos uploaded successfully!', response.ok);
        } catch (error) {
          console.error('Submission error:', error);
          showAlert('Network error or server connection failed.', false);
        }
      });
    }

    /* =====================
       TOGGLE SETTINGS HANDLER
    ====================== */
    const toggleInputs = document.querySelectorAll('.toggle-setting');
    if (toggleInputs.length > 0) {
      toggleInputs.forEach(input => {
        input.addEventListener('change', async (e) => {
          const key = input.getAttribute('data-key');
          const value = input.checked ? '1' : '0';
          
          try {
            const response = await fetch('/school_settings/toggle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key, value })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              input.checked = !input.checked;
              showAlert(result.message || `Failed to update toggle ${key}.`, false);
            }
          } catch (error) {
            console.error('Toggle update error:', error);
            input.checked = !input.checked;
            showAlert('Network error: Could not update toggle setting.', false);
          }
        });
      });
    }

    /* =====================
       TAB SWITCHING
    ====================== */
    const initTabSwitching = () => {
      const menuItems = document.querySelectorAll('.menu-item-setting');
      const contentAreas = document.querySelectorAll('.tab-content-setting');

      menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const tabId = item.getAttribute('data-tab-id');

          // Update active menu item
          menuItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          // Show corresponding content area
          contentAreas.forEach(content => {
            content.classList.remove('active');
          });

          const targetContent = document.querySelector(`.tab-content-setting[data-content-id="${tabId}"]`);
          if (targetContent) {
            targetContent.classList.add('active');
          }

          // Update title
          const titleElement = document.querySelector('.setting-title');
          if (titleElement) {
            let iconClass = 'fa-cog';
            let titleText = 'Settings';
            
            if (tabId === 'schoolDetails') {
              iconClass = 'fa-school';
              titleText = 'School Setting';
            } else if (tabId === 'liveClassSettings') {
              iconClass = 'fa-video';
              titleText = 'Live Class Settings';
            }

            titleElement.innerHTML = `<i class="fas ${iconClass}"></i> ${titleText}`;
          }
        });
      });
    };

    initTabSwitching();
  });
