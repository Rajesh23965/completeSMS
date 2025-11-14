// public/js/dragAndDrop.js

function setupDragDrop(dropArea, input) {
    if (!dropArea || !input) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName =>
        dropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false)
    );

    dropArea.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
            input.files = files; // ✅ keep input in sync
            previewImage(files[0], dropArea, input);
        }
    });

    dropArea.addEventListener("click", () => input.click());

    input.addEventListener("change", () => {
        if (input.files.length) previewImage(input.files[0], dropArea, input);
    });
}

function previewImage(file, dropArea, input) {
    if (!file.type.match("image.*")) {
        alert("Please upload an image file");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Remove old preview
        dropArea.querySelectorAll(".preview-item").forEach(el => el.remove());

        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";

        const img = document.createElement("img");
        img.src = e.target.result;

        const removeBtn = document.createElement("div");
        removeBtn.className = "remove-btn";
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => {
            previewItem.remove();
            input.value = ""; // clear file input
        };

        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        dropArea.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
}

// Auto-attach on page load
document.addEventListener("DOMContentLoaded", () => {
    setupDragDrop(document.getElementById("logoDropArea"), document.getElementById("logoInput"));
    setupDragDrop(document.getElementById("faviconDropArea"), document.getElementById("faviconInput"));
});
