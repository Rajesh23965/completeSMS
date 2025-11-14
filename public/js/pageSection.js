// js/pageSection.js

document.addEventListener("DOMContentLoaded", () => {
  /* =====================
     SIDEBAR BEHAVIOR
  ====================== */
  document.querySelectorAll(".menu-item1 .menu-text").forEach(el => {
    if (el.textContent.trim().toLowerCase() === "pages") {
      el.closest(".menu-item1").style.display = "none";
    }
  });

  document.querySelectorAll(".menu-item1").forEach(item => {
    item.addEventListener("click", () => {
      const menuId = item.getAttribute("data-menu");

      document.querySelectorAll(".menu-item1").forEach(m => m.classList.remove("active"));
      item.classList.add("active");

      document.querySelectorAll(".menu-tabs, .tab-content").forEach(el => el.classList.add("d-none"));
      document.getElementById("tabs-" + menuId)?.classList.remove("d-none");
      document.getElementById("content-" + menuId)?.classList.remove("d-none");
    });
  });

  /* =====================
     INITIALIZE TAB EVENTS
  ====================== */
  initTabSwitching();

  // Auto-load first tab content on page load
  const firstActive = document.querySelector(".tab-pane.active .section-content");
  if (firstActive) {
    const slug = firstActive.dataset.slug;
    loadSection(firstActive, slug);
  }
});

/* =====================
   TAB CLICK HANDLER
====================== */
function initTabSwitching() {
  document.querySelectorAll(".menu-tabs .nav-link").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();

      // Tab UI toggle
      const parentTabs = link.closest(".menu-tabs");
      const parentContent = parentTabs?.nextElementSibling;
      const targetId = link.getAttribute("href");

      if (!targetId || !parentTabs || !parentContent) return;

      parentTabs.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      parentContent.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("show", "active");
      });
      const targetPane = parentContent.querySelector(targetId);
      if (!targetPane) return;
      targetPane.classList.add("show", "active");

      // Load section if not loaded yet
      const contentDiv = targetPane.querySelector(".section-content");
      const slug = contentDiv?.dataset.slug;
      if (contentDiv && slug && !contentDiv.dataset.loaded) {
        await loadSection(contentDiv, slug);
      }
    });
  });
}

/* =====================
   SECTION LOADER
====================== */
async function loadSection(container, slug) {
  container.innerHTML = `<div class="text-center p-3"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
  const res = await fetch(`/frontend/section/${slug}`);
  const html = await res.text();
  container.innerHTML = html;
  container.dataset.loaded = "true";
  initPhotoUpload();
  if (slug === "teachers") {
    initTeachersUpload();
    initTeachersForm(container);
  } else if (slug === 'options') {
    initHomeOptions(container);
  } else if (slug === 'call-to-action-section') {
    initHomeCta(container);
  } else if (slug === "statistics") {
    initStatisticsUpload();
    initStatisticsForm(container);
  } else if (slug === 'services') {
    initHomeServices(container);
  } else if (slug === 'testimonial') {
    initHomeTestimonial(container);
  } else if (slug === "teacher-section") {
    initTeacherSectionUpload();
    initTeacherSectionForm(container);
  } else if (slug === "events") {
    initEventForm(container);
  } else if (slug === "event-options") {
    initEventOptionUpload();
    initEventOptionForm(container);
  } else if (slug === "about") {
    initAboutUsSecAboutUpload();
    initAboutUsSecAboutForm(container);
  } else if (slug === "service") {
    initAboutUsSecServiceUpload();
    initAboutUsSecServiceForm(container);
  } else if (slug === "aboutus-cta") {
    initAboutUsCTAForm(container);
  } else if (slug === "about-options") {
    initAboutUsOptionsUpload();
    initAboutUsOptionForm(container);
  } else if (slug === "faq") {
    intiFaqForm(container);
  } else if (slug === "faq-options") {
    initFaqOptionsUpload();
    initFaqOptionForm(container);
  } else if (slug === "gallery") {
    initGalleryUpload();
    initGalleryForm(container);
  } else if (slug === "exam-results") {
    initEamResultUpload();
    initExamResultForm(container);
  } else {
    initFormSubmit(container, slug);
  }
}

/* =====================
   FORM SUBMIT (AJAX)
====================== */
function initFormSubmit(container, slug) {
  const form = container.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Reload section after save
      await loadSection(container, slug);
      alert(" Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save";
      }
    }
  });
}

/* =====================
   Welcome PHOTO UPLOAD HANDLER
====================== */
function initPhotoUpload() {
  const dropArea = document.getElementById("photoDropArea");
  const photoInput = document.getElementById("photoInput");
  const preview = document.getElementById("photoPreview");

  if (!dropArea || !photoInput) return;

  // Click to open
  dropArea.addEventListener("click", () => photoInput.click());

  // File selected manually
  photoInput.addEventListener("change", e => handleFile(e.target.files[0]));

  // Drag enter/leave
  ["dragenter", "dragover"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
      e.preventDefault();
      dropArea.classList.add("border-primary");
    })
  );
  ["dragleave", "drop"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
      e.preventDefault();
      dropArea.classList.remove("border-primary");
    })
  );

  // Drop
  dropArea.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file) {
      photoInput.files = e.dataTransfer.files;
      handleFile(file);
    }
  });

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      if (preview) {
        preview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview"
                 style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid #ddd;">
            <button type="button" class="btn btn-danger btn-sm"
                    style="position: absolute; top: 5px; right: 5px;"
                    onclick="removeImage('photo')">
              <i class="fas fa-times"></i>
            </button>
          </div>`;
      }
    };
    reader.readAsDataURL(file);
  }
}

/* =====================
  Teachesr Photo upload Handler
=======================*/
function initTeachersUpload() {
  const dropArea = document.getElementById("teachersPhotoDropArea");
  const photoInput = document.getElementById("teachersPhotoInput");
  const preview = document.getElementById("teachersPhotoPreview");

  if (!dropArea || !photoInput) return;

  // Click to open
  dropArea.addEventListener("click", () => photoInput.click());

  // File selected manually
  photoInput.addEventListener("change", e => handleFile(e.target.files[0]));

  ["dragenter", "dragover"].forEach(evt =>
    dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.classList.add("border-primary"); })
  );
  ["dragleave", "drop"].forEach(evt =>
    dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.classList.remove("border-primary"); })
  );

  dropArea.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file) { photoInput.files = e.dataTransfer.files; handleFile(file); }
  });

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `
        <div class="preview-item position-relative d-inline-block">
          <img src="${e.target.result}" alt="Preview" style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" style="position:absolute; top:5px; right:5px;" onclick="removeImage('teachersPhoto')">
            <i class="fas fa-times"></i>
          </button>
        </div>`;
    };
    reader.readAsDataURL(file);
  }
}


/*======================
  Teachers form submiit handler(Ajax)
=======================*/
function initTeachersForm(container) {
  const form = container.querySelector("#teachersForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`; }

    try {
      const res = await fetch(form.action, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Save failed");
      // Reload the teachers section

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "teachers";
      await loadSection(contentDiv, slug);
      alert(" Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Save"; }
    }
  });
}

/*======================
  Home Options
=======================*/
function initHomeOptions(container) {
  const form = container.querySelector("#homeOptionsForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true; btn.innerHTML = `<i class ="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, { method: "POST", body: formData });

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "home-options";
      await loadSection(contentDiv, slug);
      alert("saved successfully");
    } catch (err) {
      console.error(err);
      alert("Saved failed")
    } finally {
      if (btn) {
        btn.disabled = false; btn.textContent = "Save";
      }
    }
  });
}

/*======================
  Home Call To Action Section
=======================*/
function initHomeCta(container) {
  const form = container.querySelector("#homeCtaForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true; btn.innerHTML = `<i class ="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, { method: "POST", body: formData });

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "call-to-action-section";
      await loadSection(contentDiv, slug);
      alert("saved successfully");
    } catch (err) {
      console.error(err);
      alert("Saved failed")
    } finally {
      if (btn) {
        btn.disabled = false; btn.textContent = "Save";
      }
    }
  });
}

/* =====================
  Statistics Photo upload Handler
=======================*/
function initStatisticsUpload() {
  const dropArea = document.getElementById("statisticsPhotoDropArea");
  const photoInput = document.getElementById("statisticsPhotoInput");
  const preview = document.getElementById("statisticsPhotoPreview");

  if (!dropArea || !photoInput) return;

  // Click to open
  dropArea.addEventListener("click", () => photoInput.click());

  // File selected manually
  photoInput.addEventListener("change", e => handleFile(e.target.files[0]));

  ["dragenter", "dragover"].forEach(evt =>
    dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.classList.add("border-primary"); })
  );
  ["dragleave", "drop"].forEach(evt =>
    dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.classList.remove("border-primary"); })
  );

  dropArea.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file) { photoInput.files = e.dataTransfer.files; handleFile(file); }
  });

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `
        <div class="preview-item position-relative d-inline-block">
          <img src="${e.target.result}" alt="Preview" style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" style="position:absolute; top:5px; right:5px;" onclick="removeImage('statisticsPhoto')">
            <i class="fas fa-times"></i>
          </button>
        </div>`;
    };
    reader.readAsDataURL(file);
  }
}

/*======================
  Statistics form submiit handler(Ajax)
=======================*/
function initStatisticsForm(container) {
  const form = container.querySelector("#statisticsForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`; }

    try {
      const res = await fetch(form.action, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Save failed");
      // Reload the teachers section

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "statistics";
      await loadSection(contentDiv, slug);
      alert(" Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Save"; }
    }
  });
}

/*======================
  Home Services
=======================*/
function initHomeServices(container) {
  const form = container.querySelector("#homeServicesForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, { method: "POST", body: formData });

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "home-services"; // ✅ FIX HERE
      await loadSection(contentDiv, slug);
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}

/*======================
  Home Testimonial
=======================*/
function initHomeTestimonial(container) {
  const form = container.querySelector("#homeTestimonialForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true; btn.innerHTML = `<i class ="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, { method: "POST", body: formData });

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "testimonial";
      await loadSection(contentDiv, slug);
      alert("saved successfully");
    } catch (err) {
      console.error(err);
      alert("Saved failed")
    } finally {
      if (btn) {
        btn.disabled = false; btn.textContent = "Save";
      }
    }
  });
}


/* =====================
  Teacher Section Banner Photo upload Handler
=======================*/
function initTeacherSectionUpload() {
  const dropArea = document.getElementById("teachersSectionPhotoDropArea");
  const photoInput = document.getElementById("teacherSectionPhotoInput");
  const preview = document.getElementById("teacherSectionPhotoPreview");

  console.log('initTeacherSectionUpload called (CORRECTED)');
  console.log('Drop area:', dropArea);
  console.log('Photo input:', photoInput);
  console.log('Preview:', preview);

  if (!dropArea || !photoInput) {
    console.error('Missing required elements for teacher section upload');
    return;
  }

  // CRITICAL FIX: DO NOT CLONE NODES HERE. 
  // Cloning/replacing the input element causes the browser to discard the selected file.

  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself 
    // or the 'Select File' button (if the button's inline onclick is removed).
    // This prevents double-clicks if the button's inline onclick is still present.
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      console.log('Drop area clicked');
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    console.log('File selected via input', e.target.files);
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
      console.log('Drag over');
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
      console.log('Drag leave/drop');
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // Assign dropped files to the input element
      photoInput.files = dt.files;
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    console.log('Handling file:', file.name, file.type, file.size);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('File read successfully');
      if (targetPreview) {
        targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
            <button type="button" class="btn btn-danger btn-sm" 
                    style="position:absolute; top:5px; right:5px;" 
                    onclick="removeImage('teacherSectionPhoto')">
              <i class="fas fa-times"></i>
            </button>
          </div>`;
        console.log('Preview updated');
      }
    };

    reader.onerror = function () {
      console.error('Error reading file');
      // Replace alert with console.error or a non-blocking UI message
      console.error('Error reading file. Please try another image.');
    };

    reader.readAsDataURL(file);
  }
}


/*======================
  Teacher Section form submiit handler(Ajax)
=======================*/
function initTeacherSectionForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }

  console.log('Teacher section form found:', form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    // Debugging: Check if the photo is in the FormData
    // NOTE: If the user hasn't selected a new file, formData.get('photo') will be an empty File object if the form had an input.
    // If a file was selected, it will be the File object.
    const photoFile = formData.get('photo');
    console.log('Photo file in FormData (type):', typeof photoFile);
    if (photoFile instanceof File) {
      console.log('Photo file in FormData (name/size):', photoFile.name, photoFile.size);
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      console.log('Sending form data...');
      // IMPORTANT: When sending a FormData object with file uploads, DO NOT manually set the Content-Type header. 
      // The browser will set it to 'multipart/form-data' automatically, including the necessary boundary.
      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);



      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "teacher-section";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      // Using console.error instead of alert for better user experience
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}

/*======================
 Events
=======================*/
function initEventForm(container) {
  const form = container.querySelector("#eventsForm");
  if (!form) {
    console.error("Event form with ID #eventsForm not found.");
    return;
  }

  const descriptionTextarea = container.querySelector('#description');

  // 💡 Check for jQuery and the Summernote function instead of window.tinymce
  if (window.jQuery && descriptionTextarea && $.fn.summernote) {

    // Convert the native textarea to a jQuery object for Summernote
    const $description = $(descriptionTextarea);

    // --- SUMMERNOTE CONFIGURATION ---
    $description.summernote({
      placeholder: 'Enter the event description here...',
      tabsize: 2,
      height: 300,

      // Configure the toolbar for maximum free features
      toolbar: [
        // Basic formatting and undo/redo
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],

        // Lists and alignment
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']], // Line height


        ['insert', ['link', 'picture', 'video', 'table']],

        ["history", ["undo", "redo"]],

        // View and utility
        ['view', ['fullscreen', 'codeview', 'help']]
      ],
      // Optional: Set default font and size if needed
      fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Times New Roman'],
      fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '24', '36'],
      callbacks: {
        onImageUpload: function (files) {
          // This function is triggered when a file is dropped or selected
          sendFile(files[0], $description);
        }
      }
    });
    $description.on("summernote.enterFullscreen", function () {
      $(".note-editor.fullscreen").css("z-index", 1055);
    });
    // --- END OF SUMMERNOTE CONFIGURATION ---

  } else {
    console.warn("Summernote requirements (jQuery and/or textarea) not met. Skipping editor init.");
  }


  // The submit handler logic
  form.addEventListener("submit", async e => {
    e.preventDefault();

    // 💡 CRITICAL: Summernote automatically updates the original textarea on submit 
    // IF the form is submitted traditionally. For AJAX submission (like yours), 
    // it's safest to manually trigger the update/retrieve the HTML content.
    if (window.jQuery && $.fn.summernote) {
      // Get the HTML content from Summernote's DOM element 
      // and manually set it back to the textarea's value.
      const htmlContent = $('#description').summernote('code');
      descriptionTextarea.value = htmlContent;
    }

    const formData = new FormData(form);

    const urlSearchParams = new URLSearchParams(formData);


    const btn = form.querySelector('button[type="submit"]');

    if (btn) {
      btn.disabled = true; btn.innerHTML = `<i class ="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: urlSearchParams,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "events";
      await loadSection(contentDiv, slug);
      alert("saved successfully");
    } catch (err) {
      console.error(err);
      alert("Saved failed")
    } finally {
      if (btn) {
        btn.disabled = false; btn.textContent = "Save";
      }
    }
  });
}


/* =====================
  Event Option Photo upload Handler
=======================*/
function initEventOptionUpload() {
  const dropArea = document.getElementById("eventOptionsPhotoDropArea");
  const photoInput = document.getElementById("eventOptionPhotoInput");
  const preview = document.getElementById("eventOptionPhotoPreview");

  console.log('initTeacherSectionUpload called (CORRECTED)');
  console.log('Drop area:', dropArea);
  console.log('Photo input:', photoInput);
  console.log('Preview:', preview);

  if (!dropArea || !photoInput) {
    console.error('Missing required elements for event option upload');
    return;
  }

  // CRITICAL FIX: DO NOT CLONE NODES HERE. 
  // Cloning/replacing the input element causes the browser to discard the selected file.

  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself 
    // or the 'Select File' button (if the button's inline onclick is removed).
    // This prevents double-clicks if the button's inline onclick is still present.
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      console.log('Drop area clicked');
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    console.log('File selected via input', e.target.files);
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
      console.log('Drag over');
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
      console.log('Drag leave/drop');
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // Assign dropped files to the input element
      photoInput.files = dt.files;
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    console.log('Handling file:', file.name, file.type, file.size);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('File read successfully');
      if (targetPreview) {
        targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" 
        style="position:absolute; top:5px; right:5px;" 
        onclick="removeImage('eventOptionsPhoto')">
  <i class="fas fa-times"></i>
</button>

          </div>`;
        console.log('Preview updated');
      }
    };

    reader.onerror = function () {
      console.error('Error reading file');
      // Replace alert with console.error or a non-blocking UI message
      console.error('Error reading file. Please try another image.');
    };

    reader.readAsDataURL(file);
  }
}


/*======================
  Event Options form submiit handler(Ajax)
=======================*/
function initEventOptionForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }

  console.log('Teacher section form found:', form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();


    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    // Debugging: Check if the photo is in the FormData
    // NOTE: If the user hasn't selected a new file, formData.get('photo') will be an empty File object if the form had an input.
    // If a file was selected, it will be the File object.
    const photoFile = formData.get('photo');
    console.log('Photo file in FormData (type):', typeof photoFile);
    if (photoFile instanceof File) {
      console.log('Photo file in FormData (name/size):', photoFile.name, photoFile.size);
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      console.log('Sending form data...');
      // IMPORTANT: When sending a FormData object with file uploads, DO NOT manually set the Content-Type header. 
      // The browser will set it to 'multipart/form-data' automatically, including the necessary boundary.
      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);


      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "event-options";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      // Using console.error instead of alert for better user experience
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}


/* =====================
  AboutUs About Photo upload Handler
=======================*/
function initAboutUsSecAboutUpload() {
  const dropArea = document.getElementById("aboutUsAboutPhotoDropArea");
  const photoInput = document.getElementById("aboutUsAboutPhotoInput");
  const preview = document.getElementById("aboutUsAboutPhotoPreview");



  if (!dropArea || !photoInput || !preview) {
    console.error('Missing required elements for about upload');
    return;
  }

  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself or the 'Select File' button
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // 1. Assign dropped files to the input element (for server submission)
      photoInput.files = dt.files;

      // 2. Generate the client-side preview
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    // FIX 1: Replaced alert with console.error
    if (!file.type.match('image.*')) {
      console.error('Error: Please select an image file');
      return;
    }


    // FIX 2 (Crucial for Preview): Clear the preview area immediately
    // This ensures the new image replaces any old image and existing hidden inputs.
    targetPreview.innerHTML = '';

    const reader = new FileReader();

    reader.onload = function (e) {

      // The image URL is e.target.result (Base64 data)
      targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" 
        style="position:absolute; top:5px; right:5px;" 
        onclick="removeImage('aboutUsAboutPhoto')">
  <i class="fas fa-times"></i>
</button>
          </div>`;
    };

    reader.onerror = function (err) {
      console.error('Error reading file for preview:', err);
      // Log an error if the file reader fails
      console.error('Error reading file. The preview could not be loaded.');
    };

    reader.readAsDataURL(file);
  }
}




/*======================
  AboutUs Section About form submiit handler(Ajax)
=======================*/
function initAboutUsSecAboutForm(container) {
  // Select the form element
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }

  const descriptionTextarea = form.querySelector('#description');
  const btn = form.querySelector('button[type="submit"]');

  // --- SUMMERNOTE INITIALIZATION LOGIC ---
  if (window.jQuery && descriptionTextarea && $.fn.summernote) {
    const $description = $(descriptionTextarea);

    // Initialize Summernote with the detailed configuration
    $description.summernote({
      placeholder: 'Enter the about here...',
      tabsize: 2,
      height: 300,

      // Configure the toolbar for standard features
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['insert', ['link', 'picture', 'video', 'table']],
        ["history", ["undo", "redo"]],
        ['view', ['fullscreen', 'codeview', 'help']]
      ],
      // Optional: Set default font and size if needed
      fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Times New Roman'],
      fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '24', '36'],
      callbacks: {
        onImageUpload: function (files) {
          // Placeholder for handling image uploads within the editor (if necessary)
          console.warn('Image upload via Summernote not fully implemented in this script.');
        },
        onEnterFullscreen: function () {
          // Adjust z-index when fullscreen to ensure it overlays other elements
          $(".note-editor.fullscreen").css("z-index", 1055);
        }
      }
    });
  } else {
    console.warn("Summernote requirements (jQuery and/or $.fn.summernote) not met. Skipping editor init.");
  }
  // --- END OF SUMMERNOTE INIT ---


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- CRITICAL FIX: Update textarea from Summernote before serializing ---
    // if (window.jQuery && descriptionTextarea && $.fn.summernote) {
    //   // This command forces Summernote to update the hidden <textarea name="description"> 
    //   // with the latest HTML content from the editor.
    //   $(descriptionTextarea).summernote('save');
    //   console.log('Summernote content saved to textarea.');
    // }

    // Create FormData ONLY AFTER the textarea has been updated
    const formData = new FormData(form);

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {


      const res = await fetch(form.action, {
        method: "POST",
        body: formData // Correctly handles files and text content
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Save failed: ${res.status} ${res.statusText}.`);
      }



      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "about";
      await loadSection(contentDiv, slug);

      // Changed from alert() to better practice, though keeping alert() if context requires it.
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      alert("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}



/* =====================
  AboutUs Service Photo upload Handler
=======================*/
function initAboutUsSecServiceUpload() {
  const dropArea = document.getElementById("aboutUsServicePhotoDropArea");
  const photoInput = document.getElementById("aboutUsServicePhotoInput");
  const preview = document.getElementById("aboutUsServicePhotoPreview");


  if (!dropArea || !photoInput) {
    console.error('Missing required elements for aboutus section service upload');
    return;
  }

  // CRITICAL FIX: DO NOT CLONE NODES HERE. 
  // Cloning/replacing the input element causes the browser to discard the selected file.

  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself 
    // or the 'Select File' button (if the button's inline onclick is removed).
    // This prevents double-clicks if the button's inline onclick is still present.
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      console.log('Drop area clicked');
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    console.log('File selected via input', e.target.files);
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
      console.log('Drag over');
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
      console.log('Drag leave/drop');
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // Assign dropped files to the input element
      photoInput.files = dt.files;
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    console.log('Handling file:', file.name, file.type, file.size);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('File read successfully');
      if (targetPreview) {
        targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
            <button type="button" class="btn btn-danger btn-sm" 
                    style="position:absolute; top:5px; right:5px;" 
                    onclick="removeImage('aboutUsServicePhoto')">
              <i class="fas fa-times"></i>
            </button>
          </div>`;
        console.log('Preview updated');
      }
    };

    reader.onerror = function () {
      console.error('Error reading file');
      // Replace alert with console.error or a non-blocking UI message
      console.error('Error reading file. Please try another image.');
    };

    reader.readAsDataURL(file);
  }
}


/*======================
  AboutUs Section Service form submiit handler(Ajax)
=======================*/
function initAboutUsSecServiceForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }

  console.log('AboutUs Section Service section form found:', form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    // Debugging: Check if the photo is in the FormData
    // NOTE: If the user hasn't selected a new file, formData.get('photo') will be an empty File object if the form had an input.
    // If a file was selected, it will be the File object.
    const photoFile = formData.get('photo');
    console.log('Photo file in FormData (type):', typeof photoFile);
    if (photoFile instanceof File) {
      console.log('Photo file in FormData (name/size):', photoFile.name, photoFile.size);
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      console.log('Sending form data...');
      // IMPORTANT: When sending a FormData object with file uploads, DO NOT manually set the Content-Type header. 
      // The browser will set it to 'multipart/form-data' automatically, including the necessary boundary.
      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);



      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "teacher-section";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      // Using console.error instead of alert for better user experience
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}


/*======================
  AboutUs Section CTA form submiit handler(Ajax)
=======================*/
function initAboutUsCTAForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }

  console.log('AboutUs section CTA form found:', form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');



    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {

      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);



      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "call-to-action-section";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      // Using console.error instead of alert for better user experience
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}

/* =====================
  About Us Option Photo upload Handler
=======================*/
function initAboutUsOptionsUpload() {
  const dropArea = document.getElementById("aboutOptionsPhotoDropArea");
  const photoInput = document.getElementById("aboutOptionPhotoInput");
  const preview = document.getElementById("aboutOptionPhotoPreview");


  if (!dropArea || !photoInput) {
    console.error('Missing required elements for about option upload');
    return;
  }

  // CRITICAL FIX: DO NOT CLONE NODES HERE. 
  // Cloning/replacing the input element causes the browser to discard the selected file.

  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself 
    // or the 'Select File' button (if the button's inline onclick is removed).
    // This prevents double-clicks if the button's inline onclick is still present.
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      console.log('Drop area clicked');
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    console.log('File selected via input', e.target.files);
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
      console.log('Drag over');
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
      console.log('Drag leave/drop');
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // Assign dropped files to the input element
      photoInput.files = dt.files;
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    console.log('Handling file:', file.name, file.type, file.size);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('File read successfully');
      if (targetPreview) {
        targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" 
        style="position:absolute; top:5px; right:5px;" 
        onclick="removeImage('aboutOptionsPhoto')">
  <i class="fas fa-times"></i>
</button>

          </div>`;
        console.log('Preview updated');
      }
    };

    reader.onerror = function () {
      console.error('Error reading file');
      // Replace alert with console.error or a non-blocking UI message
      console.error('Error reading file. Please try another image.');
    };

    reader.readAsDataURL(file);
  }
}

/*======================
  About Options form submiit handler(Ajax)
=======================*/
function initAboutUsOptionForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }


  form.addEventListener("submit", async (e) => {
    e.preventDefault();


    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    // Debugging: Check if the photo is in the FormData
    // NOTE: If the user hasn't selected a new file, formData.get('photo') will be an empty File object if the form had an input.
    // If a file was selected, it will be the File object.
    const photoFile = formData.get('photo');
    console.log('Photo file in FormData (type):', typeof photoFile);
    if (photoFile instanceof File) {
      console.log('Photo file in FormData (name/size):', photoFile.name, photoFile.size);
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      console.log('Sending form data...');
      // IMPORTANT: When sending a FormData object with file uploads, DO NOT manually set the Content-Type header. 
      // The browser will set it to 'multipart/form-data' automatically, including the necessary boundary.
      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);


      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "event-options";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      // Using console.error instead of alert for better user experience
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}

/*======================
 Faq Section
=======================*/
function intiFaqForm(container) {
  const form = container.querySelector("#faqForm");
  if (!form) {
    console.error("Faq form with ID #faqForm not found.");
    return;
  }

  const descriptionTextarea = container.querySelector('#description');

  //  Check for jQuery and the Summernote function instead of window.tinymce
  if (window.jQuery && descriptionTextarea && $.fn.summernote) {

    // Convert the native textarea to a jQuery object for Summernote
    const $description = $(descriptionTextarea);

    // --- SUMMERNOTE CONFIGURATION ---
    $description.summernote({
      placeholder: 'Enter the event description here...',
      tabsize: 2,
      height: 300,

      // Configure the toolbar for maximum free features
      toolbar: [
        // Basic formatting and undo/redo
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],

        // Lists and alignment
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']], // Line height


        ['insert', ['link', 'picture', 'video', 'table']],

        ["history", ["undo", "redo"]],

        // View and utility
        ['view', ['fullscreen', 'codeview', 'help']]
      ],
      // Optional: Set default font and size if needed
      fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Times New Roman'],
      fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '24', '36'],
      callbacks: {
        onImageUpload: function (files) {
          // This function is triggered when a file is dropped or selected
          sendFile(files[0], $description);
        }
      }
    });
    $description.on("summernote.enterFullscreen", function () {
      $(".note-editor.fullscreen").css("z-index", 1055);
    });
    // --- END OF SUMMERNOTE CONFIGURATION ---

  } else {
    console.warn("Summernote requirements (jQuery and/or textarea) not met. Skipping editor init.");
  }


  // The submit handler logic
  form.addEventListener("submit", async e => {
    e.preventDefault();

    // 💡 CRITICAL: Summernote automatically updates the original textarea on submit 
    // IF the form is submitted traditionally. For AJAX submission (like yours), 
    // it's safest to manually trigger the update/retrieve the HTML content.
    if (window.jQuery && $.fn.summernote) {
      // Get the HTML content from Summernote's DOM element 
      // and manually set it back to the textarea's value.
      const htmlContent = $('#description').summernote('code');
      descriptionTextarea.value = htmlContent;
    }

    const formData = new FormData(form);

    const urlSearchParams = new URLSearchParams(formData);


    const btn = form.querySelector('button[type="submit"]');

    if (btn) {
      btn.disabled = true; btn.innerHTML = `<i class ="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: urlSearchParams,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "faq";
      await loadSection(contentDiv, slug);
      alert("saved successfully");
    } catch (err) {
      console.error(err);
      alert("Saved failed")
    } finally {
      if (btn) {
        btn.disabled = false; btn.textContent = "Save";
      }
    }
  });
}


/* =====================
  Faq Option Photo upload Handler
=======================*/
function initFaqOptionsUpload() {
  const dropArea = document.getElementById("faqOptionsPhotoDropArea");
  const photoInput = document.getElementById("faqOptionPhotoInput");
  const preview = document.getElementById("faqOptionPhotoPreview");


  if (!dropArea || !photoInput) {
    console.error('Missing required elements for faq option upload');
    return;
  }


  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself 
    // or the 'Select File' button (if the button's inline onclick is removed).
    // This prevents double-clicks if the button's inline onclick is still present.
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // Assign dropped files to the input element
      photoInput.files = dt.files;
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    console.log('Handling file:', file.name, file.type, file.size);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('File read successfully');
      if (targetPreview) {
        targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" 
        style="position:absolute; top:5px; right:5px;" 
        onclick="removeImage('faqOptionsPhoto')">
  <i class="fas fa-times"></i>
</button>

          </div>`;
        console.log('Preview updated');
      }
    };

    reader.onerror = function () {
      console.error('Error reading file');
      // Replace alert with console.error or a non-blocking UI message
      console.error('Error reading file. Please try another image.');
    };

    reader.readAsDataURL(file);
  }
}

/*======================
  Faq Options form submiit handler(Ajax)
=======================*/
function initFaqOptionForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }


  form.addEventListener("submit", async (e) => {
    e.preventDefault();


    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    const photoFile = formData.get('photo');
    console.log('Photo file in FormData (type):', typeof photoFile);
    if (photoFile instanceof File) {
      console.log('Photo file in FormData (name/size):', photoFile.name, photoFile.size);
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      console.log('Sending form data...');
      // IMPORTANT: When sending a FormData object with file uploads, DO NOT manually set the Content-Type header. 
      // The browser will set it to 'multipart/form-data' automatically, including the necessary boundary.
      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);


      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "faq-options";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}

/* =====================
  Gallery Photo upload Handler
=======================*/
function initGalleryUpload() {
  const dropArea = document.getElementById("galleryPhotoDropArea");
  const photoInput = document.getElementById("galleryPhotoInput");
  const preview = document.getElementById("galleryPhotoPreview");


  if (!dropArea || !photoInput) {
    console.error('Missing required elements for gallery upload');
    return;
  }


  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // Assign dropped files to the input element
      photoInput.files = dt.files;
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    console.log('Handling file:', file.name, file.type, file.size);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('File read successfully');
      if (targetPreview) {
        targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" 
        style="position:absolute; top:5px; right:5px;" 
        onclick="removeImage('galleryPhoto')">
  <i class="fas fa-times"></i>
</button>

          </div>`;
        console.log('Preview updated');
      }
    };

    reader.onerror = function () {
      console.error('Error reading file');
      // Replace alert with console.error or a non-blocking UI message
      console.error('Error reading file. Please try another image.');
    };

    reader.readAsDataURL(file);
  }
}

/*======================
  Gallery form submiit handler(Ajax)
=======================*/
function initGalleryForm(container) {
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }


  form.addEventListener("submit", async (e) => {
    e.preventDefault();


    const formData = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    const photoFile = formData.get('photo');
    console.log('Photo file in FormData (type):', typeof photoFile);
    if (photoFile instanceof File) {
      console.log('Photo file in FormData (name/size):', photoFile.name, photoFile.size);
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      console.log('Sending form data...');

      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);


      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "gallery";
      await loadSection(contentDiv, slug);
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      console.error("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}


/* =====================
  Exam Result Photo upload Handler
=======================*/
function initEamResultUpload() {
  const dropArea = document.getElementById("examresultPhotoDropArea");
  const photoInput = document.getElementById("examresultPhotoInput");
  const preview = document.getElementById("examresultPhotoPreview");



  if (!dropArea || !photoInput || !preview) {
    console.error('Missing required elements for exam result upload');
    return;
  }

  // Click to open file dialog
  dropArea.addEventListener("click", (e) => {
    // Only trigger file input if the click target is the dropArea itself or the 'Select File' button
    if (e.target.id === dropArea.id || e.target.closest('button')) {
      e.preventDefault();
      photoInput.click();
    }
  });

  // File selected manually
  photoInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0], preview);
  });

  // Drag and drop event preventers
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drag visual feedback
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("border-primary");
    }, false);
  });

  // Drag visual feedback removal
  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("border-primary");
    }, false);
  });

  // Handle actual file drop
  dropArea.addEventListener("drop", (e) => {

    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      // 1. Assign dropped files to the input element (for server submission)
      photoInput.files = dt.files;

      // 2. Generate the client-side preview
      handleFile(file, preview);
    }
  });

  function handleFile(file, targetPreview) {
    if (!file) {
      console.log('No file provided');
      return;
    }

    // FIX 1: Replaced alert with console.error
    if (!file.type.match('image.*')) {
      console.error('Error: Please select an image file');
      return;
    }


    // FIX 2 (Crucial for Preview): Clear the preview area immediately
    // This ensures the new image replaces any old image and existing hidden inputs.
    targetPreview.innerHTML = '';

    const reader = new FileReader();

    reader.onload = function (e) {

      // The image URL is e.target.result (Base64 data)
      targetPreview.innerHTML = `
          <div class="preview-item position-relative d-inline-block">
            <img src="${e.target.result}" alt="Preview" 
                 style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid #ddd;">
          <button type="button" class="btn btn-danger btn-sm" 
        style="position:absolute; top:5px; right:5px;" 
        onclick="removeImage('examresultPhoto')">
  <i class="fas fa-times"></i>
</button>
          </div>`;
    };

    reader.onerror = function (err) {
      console.error('Error reading file for preview:', err);
      // Log an error if the file reader fails
      console.error('Error reading file. The preview could not be loaded.');
    };

    reader.readAsDataURL(file);
  }
}




/*======================
  Exam Result form submiit handler(Ajax)
=======================*/
function initExamResultForm(container) {
  // Select the form element
  const form = container.querySelector("form");
  if (!form) {
    console.error('Form not found in container');
    return;
  }
  form.addEventListener("submit", () => {
    const attendance = form.querySelector('input[name="print_attendance"]');
    const gradescale = form.querySelector('input[name="print_gradescale"]');

    if (!attendance.checked) attendance.value = "Disable";
    if (!gradescale.checked) gradescale.value = "Disable";
  });

  const descriptionTextarea = form.querySelector('#description');
  const btn = form.querySelector('button[type="submit"]');

  // --- SUMMERNOTE INITIALIZATION LOGIC ---
  if (window.jQuery && descriptionTextarea && $.fn.summernote) {
    const $description = $(descriptionTextarea);

    // Initialize Summernote with the detailed configuration
    $description.summernote({
      placeholder: '',
      tabsize: 2,
      height: 300,

      // Configure the toolbar for standard features
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['insert', ['link', 'picture', 'video', 'table']],
        ["history", ["undo", "redo"]],
        ['view', ['fullscreen', 'codeview', 'help']]
      ],
      // Optional: Set default font and size if needed
      fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Times New Roman'],
      fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '24', '36'],
      callbacks: {
        onImageUpload: function (files) {
          // Placeholder for handling image uploads within the editor (if necessary)
          console.warn('Image upload via Summernote not fully implemented in this script.');
        },
        onEnterFullscreen: function () {
          // Adjust z-index when fullscreen to ensure it overlays other elements
          $(".note-editor.fullscreen").css("z-index", 1055);
        }
      }
    });
  } else {
    console.warn("Summernote requirements (jQuery and/or $.fn.summernote) not met. Skipping editor init.");
  }
  // --- END OF SUMMERNOTE INIT ---


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create FormData ONLY AFTER the textarea has been updated
    const formData = new FormData(form);

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    }

    try {


      const res = await fetch(form.action, {
        method: "POST",
        body: formData // Correctly handles files and text content
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Save failed: ${res.status} ${res.statusText}.`);
      }



      const contentDiv = form.closest(".section-content");
      const slug = contentDiv?.dataset.slug || "exam-results";
      await loadSection(contentDiv, slug);

      // Changed from alert() to better practice, though keeping alert() if context requires it.
      alert("Saved successfully!");

    } catch (err) {
      console.error('Save error:', err);
      alert("Save failed: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }
  });
}



function removeImage(type) {
  // Fix for the specific IDs used in the EJS file
  let inputId;
  let previewId;

  if (type === 'teacherSectionPhoto') {
    inputId = 'teacherSectionPhotoInput';
    previewId = 'teacherSectionPhotoPreview';
  } else if (type === 'teachersPhoto') {
    inputId = 'teachersPhotoInput';
    previewId = 'teachersPhotoPreview';
  } else if (type === 'eventOptionsPhoto') {
    inputId = 'eventOptionPhotoInput';
    previewId = 'eventOptionPhotoPreview';
  } else if (type === 'about') {
    inputId = 'aboutUsAboutPhotoInput';
    previewId = 'aboutUsAboutPhotoPreview';
  } else if (type === 'service') {
    inputId = 'aboutUsServicePhotoInput',
      previewId = 'aboutUsServicePhotoPreview';
  } else if (type === 'about-options') {
    inputId = 'aboutOptionPhotoInput',
      previewId = 'aboutOptionPhotoPreview'
  } else if (type === 'faq-options') {
    inputId = 'faqOptionPhotoInput',
      previewId = 'faqOptionPhotoPreview'
  } else if (type === 'gallery') {
    inputId = 'galleryPhotoInput',
      previewId = 'galleryPhotoPreview'
  } else if (type === 'exam-results') {
    inputId = 'examresultPhotoInput',
      previewId = 'examresultPhotoPreview'
  } else {
    inputId = `${type}Input`;
    previewId = `${type}Preview`;
  }

  const preview = document.getElementById(previewId);
  const input = document.getElementById(inputId);

  if (preview) preview.innerHTML = "";
  if (input) input.value = "";
}
