// public/js/employee/employee.js

$(document).ready(function () {
    console.log("Employee.js loaded");

    // Initialize Select2 first
    $('.select2').select2({
        placeholder: "Select",
        allowClear: true,
        width: '100%',
        color: 'black'
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
                maxDate: "today",
                onChange: function (selectedDates, dateStr, instance) {
                    console.log("DOB selected:", dateStr);
                    instance.close();
                }
            });

            // Add click event to icon
            $(joiningDateInput).closest('.input-group').find('.input-icon').click(function () {
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
                onChange: function (selectedDates, dateStr, instance) {
                    console.log("DOB selected:", dateStr);
                    instance.close();
                }
            });

            // Add click event to icon
            $(dobInput).closest('.input-group').find('.input-icon').click(function () {
                dobInput._flatpickr.open();
            });

        } catch (error) {
            console.error("Error initializing DOB picker:", error);
        }
    }
}



function setupEventHandlers() {
    // Skip Bank Details functionality
    $('#skipBankDetails').change(function () {
        if ($(this).is(':checked')) {
            $('#bankDetailsSection').slideUp(300);
            // Clear bank fields when skipped
            $('#bankDetailsSection input').val('');
            $('#bankDetailsSection textarea').val('');
        } else {
            $('#bankDetailsSection').slideDown(300);
        }
    });

    // File upload preview
    setupFileUpload();

    // Password validation
    $('#confirmPassword').on('keyup', validatePasswords);
    $('#password').on('keyup', validatePasswords);

    // Real-time form validation
    setupFormValidation();
}

function validatePasswords() {
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    const feedback = $('.password-feedback');

    if (password.length < 6 && password !== '') {
        $('#password').addClass('is-invalid');
        feedback.text('Password must be at least 6 characters');
        return false;
    } else {
        $('#password').removeClass('is-invalid');
    }

    if (password !== confirmPassword && confirmPassword !== '') {
        $('#confirmPassword').addClass('is-invalid');
        feedback.text('Passwords do not match');
        return false;
    } else {
        $('#confirmPassword').removeClass('is-invalid');
        feedback.text('');
    }

    return true;
}

function setupFormValidation() {
    // Username validation
    $('input[name="username"]').on('blur', function () {
        const username = $(this).val();
        const feedback = $('.username-feedback');

        if (username.length < 3) {
            $(this).addClass('is-invalid');
            feedback.text('Username must be at least 3 characters');
        } else {
            $(this).removeClass('is-invalid');
            feedback.text('');
        }
    });

    // Mobile number validation
    $('input[name="mobile_number"]').on('blur', function () {
        const mobile = $(this).val();
        if (mobile && !/^\d{10}$/.test(mobile)) {
            $(this).addClass('is-invalid');
            showInlineError($(this), 'Please enter a valid 10-digit mobile number');
        } else {
            $(this).removeClass('is-invalid');
            hideInlineError($(this));
        }
    });

    // Email validation
    $('input[name="email"]').on('blur', function () {
        const email = $(this).val();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $(this).addClass('is-invalid');
            showInlineError($(this), 'Please enter a valid email address');
        } else {
            $(this).removeClass('is-invalid');
            hideInlineError($(this));
        }
    });

    // Bank details validation (only if not skipped)
    $('input[name="bank_name"], input[name="account_no"]').on('blur', function () {
        const skipBank = $('#skipBankDetails').is(':checked');
        if (!skipBank) {
            const bankName = $('input[name="bank_name"]').val();
            const accountNo = $('input[name="account_no"]').val();

            // If either bank name or account number is filled, both should be filled
            if ((bankName && !accountNo) || (!bankName && accountNo)) {
                showInlineError($(this), 'Please fill both Bank Name and Account Number');
            } else {
                hideInlineError($(this));
            }
        }
    });
}

function showInlineError(element, message) {
    // Remove any existing error message
    hideInlineError(element);

    // Add error class
    element.addClass('is-invalid');

    // Create error message element
    const errorDiv = $('<div class="invalid-feedback">' + message + '</div>');
    element.after(errorDiv);
}



function hideInlineError(element) {
    element.removeClass('is-invalid');
    element.next('.invalid-feedback').remove();
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

    // Click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        handleFileSelection(this.files[0]);
    });

    removeBtn.addEventListener('click', function () {
        resetFileUpload();
    });

    // Drag and drop functionality
    ['dragover', 'dragenter'].forEach(event => {
        dropZone.addEventListener(event, function (e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
    });

    ['dragleave', 'dragend'].forEach(event => {
        dropZone.addEventListener(event, function () {
            this.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    function handleFileSelection(file) {
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size should be less than 2MB');
            fileInput.value = '';
            return;
        }

        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            filenameDisplay.textContent = file.name;
            dropContent.style.display = 'none';
            previewContainer.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }

    function resetFileUpload() {
        fileInput.value = '';
        previewImage.src = '';
        filenameDisplay.textContent = '';
        previewContainer.style.display = 'none';
        dropContent.style.display = 'flex';
    }
}

function showErrorAlert(message) {
    alert(message);
}

// Form submission



// Form submission
$('#employeeForm').submit(function (e) {
    e.preventDefault();

    // Basic validation
    let isValid = true;

    // Check required fields
    $('.required-field').each(function() {
        const input = $(this).closest('.col-half, .col-third, .col-quarter').find('input, select');
        if (input.val() === '' || (input.is('select') && input.val() === '')) {
            input.addClass('is-invalid');
            isValid = false;
        } else {
            input.removeClass('is-invalid');
        }
    });

    // Validate passwords
    if (!validatePasswords()) {
        isValid = false;
    }

    // Check joining date
    const joiningDate = $('input[name="joining_date"]').val();
    if (!joiningDate) {
        $('input[name="joining_date"]').addClass('is-invalid');
        isValid = false;
    }

    // Check bank details if not skipped
    const skipBank = $('#skipBankDetails').is(':checked');
    if (!skipBank) {
        const bankName = $('input[name="bank_name"]').val();
        const accountNo = $('input[name="account_no"]').val();
        
        // If bank details are partially filled
        if ((bankName && !accountNo) || (!bankName && accountNo)) {
            if (bankName) $('input[name="bank_name"]').addClass('is-invalid');
            if (accountNo) $('input[name="account_no"]').addClass('is-invalid');
            isValid = false;
            
            if (!confirm('You have partially filled bank details. Are you sure you want to continue without completing all bank fields?')) {
                return false;
            }
        }
    }

    // Check file size if file is selected
    const fileInput = $('#file-input')[0];
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert('Profile picture size should be less than 2MB');
            return false;
        }
    }

    if (!isValid) {
        alert('Please fill all required fields correctly!');
        return false;
    }

    // Show loading state
    const submitBtn = $(this).find('.save-btn');
    const originalText = submitBtn.html();
    submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Saving...');
    submitBtn.prop('disabled', true);

    // Submit form via AJAX for better feedback
    const formData = new FormData(this);
    
    fetch('/employee/add', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else if (response.ok) {
            return response.json();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        if (data && data.success === false) {
            throw new Error(data.message || 'Failed to create employee');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
        submitBtn.html(originalText);
        submitBtn.prop('disabled', false);
    });

    return false;
});