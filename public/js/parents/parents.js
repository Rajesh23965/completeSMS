document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const dropContent = document.getElementById('drop-content');
    const removeBtn = document.getElementById('remove-btn');
    const filenameDisplay = document.getElementById('filename-display');

    if (!dropZone || !fileInput) return;

    /* Click to open file */
    dropZone.addEventListener('click', () => fileInput.click());

    /* Drag over */
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007bff';
        dropZone.style.backgroundColor = '#e7f1ff';
    });

    /* Drag leave */
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ddd';
        dropZone.style.backgroundColor = '';
    });

    /* Drop */
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        dropZone.style.backgroundColor = '';
        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            showPreview(file);
        }
    });

    /* File input change */
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showPreview(fileInput.files[0]);
        }
    });

    /* Show preview */
    function showPreview(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        previewImage.src = URL.createObjectURL(file);
        
        // Display filename (truncate if too long)
        let fileName = file.name;
        if (fileName.length > 20) {
            fileName = fileName.substring(0, 17) + '...';
        }
        filenameDisplay.textContent = fileName;
        
        previewContainer.style.display = 'flex';
        dropContent.style.display = 'none';
        dropZone.style.borderColor = '#28a745';
        dropZone.style.backgroundColor = '#f0f9f0';
    }

    /* Remove image */
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewImage.src = '';
        previewContainer.style.display = 'none';
        dropContent.style.display = 'block';
        dropZone.style.borderColor = '#ddd';
        dropZone.style.backgroundColor = '';
    });

    // Optional: Add hover effect to entire preview container
    previewContainer.addEventListener('mouseenter', () => {
        previewContainer.style.backgroundColor = '#e0e0e0';
    });
    
    previewContainer.addEventListener('mouseleave', () => {
        previewContainer.style.backgroundColor = '#f5f5f5';
    });
});


// --- NEW: Handle Form Submission ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const submitBtn = form.querySelector('.save-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';

    try {
        const response = await fetch('/parents/add', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Parent added successfully!');
            window.location.href = '/parents/view';
        } else {
            alert('Error: ' + result.message);
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save';
    }
});


