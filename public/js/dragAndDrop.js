function setupDragDrop(dropArea, input, previewArea) {
  if (!dropArea || !input || !previewArea) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName =>
    dropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false)
  );

  dropArea.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length) {
      input.files = files;
      previewImage(files[0], previewArea, input);
    }
  });

  dropArea.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    if (input.files.length) previewImage(input.files[0], previewArea, input);
  });
}

function previewImage(file, previewArea, input) {
  if (!file.type.match("image.*")) {
    alert("Please upload an image file");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewArea.innerHTML = "";

    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";

    const img = document.createElement("img");
    img.src = e.target.result;

    const removeBtn = document.createElement("div");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => {
      previewItem.remove();
      input.value = "";
    };

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    previewArea.appendChild(previewItem);
  };

  reader.readAsDataURL(file);
}
