// public/js/dragAndDrop.js

function setupDragDrop(dropArea, input) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('dragging');
    }

    function unhighlight() {
        dropArea.classList.remove('dragging');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    input.files = files;

    if (files.length) {
        previewImage(files[0], dropArea);  // 👈 use dropArea instead of next sibling
    }
}


    // Also handle click to open file dialog
    dropArea.addEventListener('click', () => {
        input.click();
    });

   input.addEventListener('change', () => {
    if (input.files.length) {
        previewImage(input.files[0], dropArea);  // 👈 inside dropArea
    }
});

}

function previewImage(file, dropArea) {
    if (!file.type.match('image.*')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        // Clear inside drop area
        dropArea.innerHTML = '';

        // Create new preview
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        const img = document.createElement('img');
        img.src = e.target.result;

        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = function () {
            dropArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & Drop your file here or click to browse</p>
                <button type="button" class="btn btn-sm btn-outline-primary">Select File</button>
                <input type="file" name="${dropArea.querySelector('input')?.name}" accept="image/*" style="display: none;">
            `;
        };

        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        dropArea.appendChild(previewItem);
    };

    reader.readAsDataURL(file);
}

function removeImage(btn) {
    const previewItem = btn.closest('.preview-item');
    previewItem.remove();
}

// Initialize drag and drop for logo and favicon
document.addEventListener('DOMContentLoaded', function () {
    setupDragDrop(document.getElementById('logoDropArea'), document.getElementById('logoInput'));
    setupDragDrop(document.getElementById('faviconDropArea'), document.getElementById('faviconInput'));

    // Color picker functionality
    document.querySelectorAll('.color-input[type="color"]').forEach(picker => {
        const textInput = picker.nextElementSibling;
        const preview = picker.previousElementSibling;

        picker.addEventListener('input', function () {
            textInput.value = this.value;
            preview.style.backgroundColor = this.value;
        });

        textInput.addEventListener('input', function () {
            if (this.value.match(/^#([0-9A-F]{3}){1,2}$/i)) {
                picker.value = this.value;
                preview.style.backgroundColor = this.value;
            }
        });
    });
});
