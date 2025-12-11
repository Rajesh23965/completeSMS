
    // Drag and Drop Logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const form = document.querySelector('form');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007bff';
        dropZone.style.backgroundColor = '#f0f8ff';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ddd';
        dropZone.style.backgroundColor = 'white';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileInput.files = e.dataTransfer.files;
        dropZone.style.borderColor = '#28a745'; 
        dropZone.querySelector('p').innerText = fileInput.files[0].name;
    });
    
    fileInput.addEventListener('change', () => {
         if(fileInput.files.length > 0) {
            dropZone.style.borderColor = '#28a745';
            dropZone.querySelector('p').innerText = fileInput.files[0].name;
         }
    });

    // --- NEW: Handle Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop standard reload
        
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
                window.location.href = '/parents'; // Redirect to list
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
