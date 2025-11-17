document.addEventListener("DOMContentLoaded", () => {
    /* =====================
       SIDEBAR BEHAVIOR
    ====================== */
    initTabSwitching();

    /* =====================
       FORM SUBMISSION HANDLERS
    ====================== */
    const generalForm = document.getElementById('generalSettingsForm');
    const logoForm = document.getElementById('logoSettingsForm');
    const alertMessage = document.getElementById('alertMessage');
    const toggleInputs = document.querySelectorAll('.toggle-setting');

    const showAlert = (message, isSuccess = true) => {
        alertMessage.textContent = message;
        alertMessage.style.display = 'block';
        alertMessage.className = `alert-message alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 5000);
    };

    // 1. General Settings Form Submission (JSON data)
    if (generalForm) {
        generalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(generalForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(generalForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (response.ok) {
                    showAlert(result.message, true);
                } else {
                    showAlert(result.message || 'An error occurred during general settings update.', false);
                }
            } catch (error) {
                console.error('Submission error:', error);
                showAlert('Network error or server connection failed.', false);
            }
        });
    }
    
    // 2. Logo Settings Form Submission (Multi-part form data)
    if (logoForm) {
        logoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(logoForm);
            
            try {
                const response = await fetch(logoForm.action, {
                    method: 'POST',
                    // Correctly allowing browser to set Content-Type: multipart/form-data boundary
                    body: formData
                });

                const result = await response.json();
                
                if (response.ok) {
                    showAlert(result.message, true);
                    // To see the new logo, you'll need to update the <img> tags or reload the page here.
                } else {
                    showAlert(result.message || 'An error occurred during logo upload.', false);
                }
            } catch (error) {
                console.error('Submission error:', error);
                showAlert('Network error or server connection failed.', false);
            }
        });
    }
    
    // 3. Toggle Setting Handlers (Checkboxes)
    if (toggleInputs.length > 0) {
        toggleInputs.forEach(input => {
            input.addEventListener('change', async (e) => {
                const key = input.getAttribute('data-key');
                // Value is '1' if checked, '0' if unchecked
                const value = input.checked ? '1' : '0'; 
                
                try {
                    const response = await fetch('/settings/toggle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ key, value })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        showAlert(result.message, true);
                    } else {
                        // Revert the toggle state if the update fails
                        input.checked = !input.checked; 
                        showAlert(result.message || `Failed to update toggle ${key}.`, false);
                    }
                } catch (error) {
                    console.error('Toggle update error:', error);
                    // Revert the toggle state
                    input.checked = !input.checked; 
                    showAlert('Network error: Could not update toggle setting.', false);
                }
            });
        });
    }
});


/* =====================
   INITIALIZE TAB EVENTS (Unchanged from previous version)
====================== */
const initTabSwitching = () => {
    const menuItems = document.querySelectorAll('.menu-item-setting');
    const contentAreas = document.querySelectorAll('.tab-content-setting');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab-id');

            // 1. Deactivate all menu items and activate the clicked one
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // 2. Hide all content areas and show the one corresponding to the clicked menu item
            contentAreas.forEach(content => {
                content.classList.remove('active');
            });

            const targetContent = document.querySelector(`.tab-content-setting[data-content-id="${tabId}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // 3. Update the title/icon
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
}