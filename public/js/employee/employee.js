// public/js/employee/employee.js

$(document).ready(function() {
    console.log("Employee.js loaded");
    
    // Initialize Select2 first
    $('.select2').select2({
        placeholder: "Select",
        allowClear: true,
        width: '100%',
        color:'black'
    });

    // Initialize Flatpickr with console logging
    initializeDatePickers();
    

    
    // Setup event handlers
    setupEventHandlers();
    
    // Check if Flatpickr is loaded
    if (typeof flatpickr === 'undefined') {
        console.error("Flatpickr not loaded! Check your script includes.");
        showErrorAlert("Date picker library not loaded. Please refresh the page.");
    }
});

function initializeDatePickers() {
    console.log("Initializing date pickers...");
    
    // Check if elements exist
    const joiningDateInput = document.querySelector("input[name='joining_date']");
    const dobInput = document.querySelector("input[name='date_of_birth']");
    
    console.log("Joining date input:", joiningDateInput);
    console.log("DOB input:", dobInput);
    
    if (joiningDateInput) {
        try {
            // Joining Date picker
            flatpickr(joiningDateInput, {
                dateFormat: "Y-m-d",
                minDate: "today",
                defaultDate: "today",
                onChange: function(selectedDates, dateStr, instance) {
                    console.log("Joining date selected:", dateStr);
                    instance.close();
                },
                onReady: function(selectedDates, dateStr, instance) {
                    console.log("Joining date picker ready");
                },
                onOpen: function(selectedDates, dateStr, instance) {
                    console.log("Joining date picker opened");
                },
                allowInput: false,
                clickOpens: true,
                position: "auto"
            });
            
            // Add click event to icon
            $(joiningDateInput).closest('.input-group').find('.input-icon').click(function() {
                joiningDateInput._flatpickr.open();
            });
            
        } catch (error) {
            console.error("Error initializing joining date picker:", error);
        }
    }
    
    if (dobInput) {
        try {
            // Date of Birth picker
            flatpickr(dobInput, {
                dateFormat: "Y-m-d",
                maxDate: "today",
                onChange: function(selectedDates, dateStr, instance) {
                    console.log("DOB selected:", dateStr);
                    instance.close();
                }
            });
            
            // Add click event to icon
            $(dobInput).closest('.input-group').find('.input-icon').click(function() {
                dobInput._flatpickr.open();
            });
            
        } catch (error) {
            console.error("Error initializing DOB picker:", error);
        }
    }
}



function setupEventHandlers() {

    // Skip Bank Details functionality
    $('#skipBankDetails').change(function() {
        if ($(this).is(':checked')) {
            $('#bankDetailsSection').slideUp(300);
            $('#bankDetailsSection input').prop('required', false);
        } else {
            $('#bankDetailsSection').slideDown(300);
        }
    });

    // File upload preview
    setupFileUpload();

    // Password validation
    $('#confirmPassword').on('keyup', function() {
        const password = $('#password').val();
        const confirmPassword = $(this).val();
        
        if (password !== confirmPassword && confirmPassword !== '') {
            $(this).addClass('is-invalid');
            $('.password-feedback').text('Passwords do not match');
        } else {
            $(this).removeClass('is-invalid');
            $('.password-feedback').text('');
        }
    });

    // Test date picker manually
    $('input[name="joining_date"]').on('click', function() {
        console.log("Joining date input clicked");
        if (this._flatpickr) {
            console.log("Flatpickr instance found, opening...");
        } else {
            console.log("No Flatpickr instance found!");
        }
    });
}

function setupFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const dropContent = document.getElementById('drop-content');
    const filenameDisplay = document.getElementById('filename-display');
    const removeBtn = document.getElementById('remove-btn');

    if (!dropZone) {
        console.error("Drop zone element not found!");
        return;
    }

    dropZone.addEventListener('click', () => {
        console.log("Drop zone clicked");
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        console.log("File selected");
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size should be less than 2MB');
                this.value = '';
                return;
            }
            
            // Check file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                filenameDisplay.textContent = file.name;
                dropContent.style.display = 'none';
                previewContainer.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    removeBtn.addEventListener('click', function() {
        fileInput.value = '';
        previewContainer.style.display = 'none';
        dropContent.style.display = 'flex';
    });

    // Drag and drop functionality
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
}

function showErrorAlert(message) {
    alert(message);
}

// Form submission
$('#employeeForm').submit(function(e) {
    e.preventDefault();
    
    // Validate passwords match
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        $('#confirmPassword').focus();
        return;
    }
    
    // Check date fields
    const joiningDate = $('input[name="joining_date"]').val();
    if (!joiningDate) {
        alert('Please select a joining date!');
        $('input[name="joining_date"]').focus();
        return;
    }
    
    // Submit form if validation passes
    console.log("Form submitted with data:", $(this).serialize());
    this.submit();
});