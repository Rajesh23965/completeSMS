import EmployeeModel from "../../models/Employee/employee.model.js";
import DepartmentModel from "../../models/Employee/department.model.js";
import DesignationModel from "../../models/Employee/designation.model.js";
import bcrypt from "bcrypt";
import ejs from "ejs";
import path from "path";
import { BaseExportController } from "../BaseExportController.js";

const getUpdatePasswordModal = (employeeId, currentStatus = 1) => `
<div class="modal fade" id="authenticationModal" tabindex="-1" aria-labelledby="authenticationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="authenticationModalLabel">
                    <i class="fas fa-unlock-alt me-2"></i>Authentication
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="updatePasswordForm" data-employee-id="${employeeId}">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="password" class="form-label">
                            Password <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                            <input 
                                type="password" 
                                class="form-control" 
                                id="password" 
                                name="password"
                                placeholder="Enter new password"
                                required
                            >
                            <button 
                                class="btn btn-outline-secondary" 
                                type="button" 
                                id="togglePassword"
                                style="border: 1px solid #ced4da; border-left: 0;"
                            >
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-text mt-2">
                            <span id="passwordHint">Enter a new password to update</span>
                        </div>
                    </div>
                    
                    <div class="form-check mb-3">
                        <input 
                            class="form-check-input" 
                            type="checkbox" 
                            id="loginAuthentication" 
                            name="login_authentication"
                            ${currentStatus === 0 ? 'checked' : ''}
                            ${currentStatus === 0 ? 'disabled' : ''}
                        >
                        <label class="form-check-label" for="loginAuthentication">
                            Login Authentication Deactivate
                            ${currentStatus === 0 ? '<span class="badge bg-danger ms-2">Permanent</span>' : ''}
                        </label>
                    
                    </div>
                    
                    <input type="hidden" id="status" name="status" value="${currentStatus}">
                    <input type="hidden" id="originalStatus" name="originalStatus" value="${currentStatus}">
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary" id="submitBtn">Update</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    #authenticationModal .modal-content {
        border-radius: 10px;
        border: none;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    
    #authenticationModal .modal-header {
        color: black;
        border-radius: 10px 10px 0 0;
        border-bottom: 2px solid #0A7C53;
        padding: 1rem 1.5rem;
    }
    
    #authenticationModal .btn-close {
        margin: 0;
        padding: 0.5rem;
    }
    
    #authenticationModal .form-check-input:checked {
        background-color: #ffff;
        border-color: #fff2;
    }
    
    #authenticationModal .form-check-input:checked:disabled {
        background-color: #dc3545;
        border-color: #dc3545;
        opacity: 0.7;
    }
    
    #authenticationModal .form-check-input:not(:checked) {
        background-color: #0A7C53;
        border-color: #0A7C53;
    }
    
    #authenticationModal .modal-footer {
        border-top: 1px solid #e9ecef;
        padding: 1rem;
    }
    
    #authenticationModal .form-control:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
        color: #6c757d;
    }
    
    #authenticationModal .input-group .btn:not(:disabled):hover {
        background-color: #e9ecef;
    }
    
    #authenticationModal .input-group .btn i {
        color: #6c757d;
        transition: color 0.2s;
    }
    
    #authenticationModal .input-group .btn:not(:disabled):hover i {
        color: #495057;
    }
    
    #authenticationModal .form-text {
        font-size: 0.875rem;
        color: #6c757d;
    }
    
    #passwordHint.active {
        color: #198754;
        font-weight: 500;
    }
    
    #passwordHint.inactive {
        color: #dc3545;
        font-weight: 500;
    }
    
    #authenticationModal .badge {
        font-size: 0.7em;
        padding: 0.25em 0.5em;
    }
    
    #authenticationModal .warning-text {
        color: #dc3545;
        font-weight: 500;
        font-size: 0.9em;
        margin-top: 0.5rem;
    }
    
    .confirm-dialog {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 99999;
        justify-content: center;
        align-items: center;
    }
    
    .confirm-dialog-content {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const modalElement = document.getElementById('authenticationModal');
        const passwordInput = document.getElementById('password');
        const togglePasswordBtn = document.getElementById('togglePassword');
        const togglePasswordIcon = togglePasswordBtn.querySelector('i');
        const authCheckbox = document.getElementById('loginAuthentication');
        const statusInput = document.getElementById('status');
        const originalStatusInput = document.getElementById('originalStatus');
        const updateForm = document.getElementById('updatePasswordForm');
        const passwordHint = document.getElementById('passwordHint');
        const submitBtn = document.getElementById('submitBtn');
        
        // Check if user is already deactivated
        const isAlreadyDeactivated = ${currentStatus} === 0;
        
        // Function to update UI based on checkbox state
        function updateUIState(isDeactivated, isPermanent = false) {
            if (isDeactivated) {
                // When checked (Deactivate) - disable password input and toggle button
                passwordInput.disabled = true;
                passwordInput.required = false;
                togglePasswordBtn.disabled = true;
                togglePasswordBtn.style.cursor = 'not-allowed';
                togglePasswordBtn.style.opacity = '0.6';
                passwordInput.placeholder = "Login deactivated - no password needed";
                passwordInput.value = "";
                passwordInput.setAttribute('type', 'password');
                togglePasswordIcon.classList.remove('fa-eye-slash');
                togglePasswordIcon.classList.add('fa-eye');
                statusInput.value = "0";
                passwordHint.textContent = "Login is deactivated. User cannot access the system.";
                passwordHint.className = "form-text mt-2 inactive";
                
                // Remove validation styling
                passwordInput.classList.remove('is-invalid');
                
                // If this is a permanent deactivation (already deactivated), show warning
                if (isPermanent) {
                    // Checkbox is already disabled from HTML
                    passwordHint.textContent = "";
                }
            } else {
                // When unchecked (Active) - enable password input and toggle button
                passwordInput.disabled = false;
                passwordInput.required = true;
                togglePasswordBtn.disabled = false;
                togglePasswordBtn.style.cursor = 'pointer';
                togglePasswordBtn.style.opacity = '1';
                passwordInput.placeholder = "Enter new password";
                statusInput.value = "1";
                passwordHint.textContent = "Enter a new password (min. 6 characters)";
                passwordHint.className = "form-text mt-2 active";
            }
        }
        
        // Initialize UI state
        updateUIState(isAlreadyDeactivated, isAlreadyDeactivated);
        
        // Toggle password visibility
        togglePasswordBtn.addEventListener('click', function() {
            if (!passwordInput.disabled) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle eye icon
                if (type === 'text') {
                    togglePasswordIcon.classList.remove('fa-eye');
                    togglePasswordIcon.classList.add('fa-eye-slash');
                    togglePasswordBtn.setAttribute('title', 'Hide password');
                } else {
                    togglePasswordIcon.classList.remove('fa-eye-slash');
                    togglePasswordIcon.classList.add('fa-eye');
                    togglePasswordBtn.setAttribute('title', 'Show password');
                }
            }
        });
        
        // Real-time password validation
        passwordInput.addEventListener('input', function() {
            if (!authCheckbox.checked && this.value.length > 0 && !isAlreadyDeactivated) {
                if (this.value.length < 6) {
                    this.classList.add('is-invalid');
                    passwordHint.textContent = "Password must be at least 6 characters";
                    passwordHint.className = "form-text mt-2 text-danger";
                } else {
                    this.classList.remove('is-invalid');
                    passwordHint.textContent = "Good! Password meets requirements";
                    passwordHint.className = "form-text mt-2 text-success";
                }
            }
        });
        
        // Handle form submission
        updateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // If already deactivated, only allow closing
            if (isAlreadyDeactivated) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                return;
            }
            
            const formData = new FormData(this);
            const employeeId = this.getAttribute('data-employee-id');
            const isDeactivated = authCheckbox.checked;
            const originalStatus = parseInt(originalStatusInput.value);
            
            // Prepare data
            let passwordValue = formData.get('password') || '';
            const statusValue = isDeactivated ? '0' : '1';
            
            // If trying to deactivate (checkbox checked), no password needed
            if (isDeactivated) {
                passwordValue = ''; // Empty password for deactivated users
            } else {
                // For active users, validate password
                if (!passwordValue || passwordValue.trim() === '') {
                    alert('Please enter a password when authentication is active');
                    passwordInput.focus();
                    return;
                }
                
                if (passwordValue.length < 6) {
                    alert('Password must be at least 6 characters long');
                    passwordInput.focus();
                    return;
                }
            }
            
            const data = {
                password: passwordValue,
                status: statusValue
            };
            
            try {
                // Show loading state
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Updating...';
                submitBtn.disabled = true;
                
                const response = await fetch(\`/employee/password/\${employeeId}\`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (result.success) {
                    // Show success message
                    const successMessage = isDeactivated 
                        ? 'Login authentication permanently deactivated. User cannot login anymore.' 
                        : 'Password updated and login activated successfully.';
                    
                    // Create a nice alert
                    showNotification(successMessage, 'success');
                    
                    // Close modal after delay
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        modal.hide();
                        
                        // Refresh page to reflect permanent changes
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }, 1500);
                    
                    // If deactivated, update UI to show permanent state
                    if (isDeactivated) {
                        authCheckbox.disabled = true;
                        authCheckbox.setAttribute('data-permanent', 'true');
                        updateUIState(true, true);
                    }
                } else {
                    showNotification(result.message || 'Failed to update authentication settings', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('An error occurred. Please try again.', 'error');
                
                // Restore button state on error
                submitBtn.innerHTML = 'Update';
                submitBtn.disabled = false;
            }
        });
        
        
        // Helper function for notifications
        function showNotification(message, type = 'info') {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.custom-notification');
            existingNotifications.forEach(notification => notification.remove());
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = \`custom-notification alert alert-\${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show\`;
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            \`;
            notification.innerHTML = \`
                \${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            \`;
            
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.employeeNode) {
                    notification.remove();
                }
            }, 5000);
        }
        
        // When modal opens, reset to appropriate state
        modalElement.addEventListener('show.bs.modal', function() {
            // If already deactivated, show warning and disable form
            if (isAlreadyDeactivated) {
                submitBtn.textContent = 'Close';
                submitBtn.className = 'btn btn-secondary';
            } else {
                submitBtn.textContent = 'Update';
                submitBtn.className = 'btn btn-primary';
            }
        });
        
        // Reset form when modal is hidden
        modalElement.addEventListener('hidden.bs.modal', function() {
            // Don't reset if already deactivated - keep the permanent state
            if (!isAlreadyDeactivated) {
                updateForm.reset();
                passwordInput.setAttribute('type', 'password');
                togglePasswordIcon.classList.remove('fa-eye-slash');
                togglePasswordIcon.classList.add('fa-eye');
                passwordInput.disabled = false;
                togglePasswordBtn.disabled = false;
                togglePasswordBtn.style.cursor = 'pointer';
                togglePasswordBtn.style.opacity = '1';
                passwordInput.classList.remove('is-invalid');
                
                // Reset to initial state
                authCheckbox.checked = false;
                updateUIState(false);
                
                // Reset button
                submitBtn.textContent = 'Update';
                submitBtn.className = 'btn btn-primary';
            }
        });
    });
</script>
`;


export default class EmployeeController {

    /* =========================
       RENDER ADD FORM
    ========================== */
    static async renderAddEmployeeForm(req, res) {
        try {
            // Static roles
            const roles = [
                "Admin",
                "Accountant",
                "Teacher",
                "Librarian",
                "Receptionist"
            ];

            // Fetch dynamic data
            const designations = await DesignationModel.findAll();
            const departments = await DepartmentModel.findAll();

            const formPath = path.join(process.cwd(), "views", "employee", "add.ejs");

            const formHtml = await ejs.renderFile(formPath, {
                roles,
                designations,
                departments
            });

            res.render("dashboard", {
                pageTitle: "Add Employee",
                pageIcon: "fa-user-plus",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Employee", url: "/employees" },
                    { title: "Add Employee" }
                ],
                body: formHtml
            });

        } catch (err) {
            console.error("Render Add Employee Error:", err);
            res.status(500).send("Error rendering add employee");
        }
    }


    /* =========================
      CREATE EMPLOYEE
   ========================== */
    static async addEmployee(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Username and password are required"
                });
            }

            const existing = await EmployeeModel.findByUsername(username);
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const employeeData = {
                ...req.body,
                password: hashedPassword,
                profile_picture: req.file ? req.file.path : null
            };

            await EmployeeModel.create(employeeData);


            res.redirect("/employee/view");

        } catch (error) {
            console.error("Create Employee Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // Export Employee Data
    static async exportEmployees(req, res) {
        try {
            const status = req.query.status !== undefined ? Number(req.query.status) : 1;
            const search = req.query.search || "";

            // ROLE handling (from tab)
            let roles = [];
            if (req.query.role) {
                roles = [req.query.role];
            } else if (req.query.roles) {
                roles = Array.isArray(req.query.roles)
                    ? req.query.roles
                    : req.query.roles.split(',');
            }

            const employeeColumns = [
                { field: 'staffId', header: 'Staff ID' },
                { field: 'name', header: 'Name' },
                { field: 'role', header: 'Role' },
                { field: 'designation_name', header: 'Designation' },
                { field: 'department_name', header: 'Department' },
                { field: 'mobile_number', header: 'Mobile' },
                { field: 'email', header: 'Email' },
                { field: 'branch_name', header: 'Branch' },
            ];

            const fetchEmployeesData = async () => {
                if (status === 0) {
                    return EmployeeModel.findDeactive(10000, 0, search);
                }
                return EmployeeModel.findAll(10000, 0, search, "id", "ASC", roles);
            };

            return BaseExportController.handleExport(
                req,
                res,
                fetchEmployeesData,
                employeeColumns,
                "Employees List"
            );

        } catch (error) {
            console.error("Export error:", error);
            res.status(500).json({ success: false, message: "Export failed" });
        }
    }


    // Get Employees with column visibility
    static async getEmployeesWithColumns(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const employees = await EmployeeModel.findAll(limit, offset);

            // Define columns
            const allColumns = [
                { field: 'staffId', header: 'Staff ID', width: 100, align: 'left' },
                { field: 'name', header: 'Name', width: 120, align: 'left' },
                { field: 'role', header: 'Role', width: 100, align: 'left' },
                { field: 'designation_name', header: 'Designation', width: 100, align: 'left' },
                { field: 'department_name', header: 'Department', width: 120, align: 'left' },
                { field: 'mobile_number', header: 'Mobile No', width: 100, align: 'left' },
                { field: 'email', header: 'Email', width: 150, align: 'left' },
                { field: 'branch_name', header: 'Branch', width: 120, align: 'left' },
            ];


            // Get visible/hidden columns
            const { visibleColumns, hiddenColumns } = super.getColumnsConfig(req, allColumns);

            return res.status(200).json({
                success: true,
                data: employees,
                columns: {
                    all: allColumns,
                    visible: visibleColumns,
                    hidden: hiddenColumns
                },
                page: page,
                limit: limit
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }


    static async ajaxEmployee(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const search = req.query.search || '';
            const sortBy = req.query.sortBy || 'id';
            const sortDir = req.query.sortDir || 'DESC';

            const offset = (page - 1) * limit;

            const employees = await EmployeeModel.findAll(
                limit,
                offset,
                search,
                sortBy,
                sortDir
            );

            const total = await EmployeeModel.getTotalCount(search);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: employees,
                pagination: { page, limit, total, totalPages },
                sort: { sortBy, sortDir }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }


    /* =========================
      LIST EMPLOYEES
   ========================== */
    static async renderEmployeeList(req, res) {
        try {
            const sortBy = req.query.sortBy || "id";
            const sortDir = req.query.sortDir || "ASC";

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 25;
            const offset = (page - 1) * limit;
            const search = req.query.search || "";

            // Roles (can later come from DB)
            const roles = [
                "Admin",
                "Teacher",
                "Accountant",
                "Librarian",
                "Receptionist"
            ];

            // Current role from URL
            let currentRole = req.params.role || roles[0];

            // Safety check
            if (!roles.includes(currentRole)) {
                currentRole = roles[0];
            }

            const employee = await EmployeeModel.findAll(
                limit,
                offset,
                search,
                sortBy,
                sortDir,
                [currentRole]
            );


            const total = await EmployeeModel.getTotalCount(search, [currentRole]);
            const totalPages = Math.ceil(total / limit);

            const viewPath = path.join(process.cwd(), "views", "employee", "view.ejs");

            const html = await ejs.renderFile(viewPath, {
                employee,
                pagination: { page, limit, total, totalPages },
                search,
                roles,
                currentRole
            });

            res.render("dashboard", {
                pageTitle: "Employees List",
                pageIcon: "fas fa-users",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Employee", url: "/employee/view" },
                    { title: currentRole }
                ],
                body: html
            });

        } catch (err) {
            console.error("Employee List Error:", err);
            res.status(500).send("Error rendering employee list");
        }
    }


    /* =========================
       DEACTIVATED EMPLOYEES
    ========================== */
    static async renderDeactiveEmployeeList(req, res) {
        try {
            const sortBy = req.query.sortBy || "id";
            const sortDir = req.query.sortDir || "ASC";

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 25;
            const offset = (page - 1) * limit;
            const search = req.query.search || "";

            const roles = [
                "Admin",
                "Teacher",
                "Accountant",
                "Librarian",
                "Receptionist"
            ];

            let currentRole = req.params.role || roles[0];

            if (!roles.includes(currentRole)) {
                currentRole = roles[0];
            }

            const employee = await EmployeeModel.findDeactive(
                limit,
                offset,
                search,
                sortBy,
                sortDir,
                [currentRole]
            );

            const total = await EmployeeModel.getDeactiveTotalCount(search, [currentRole]);
            const totalPages = Math.ceil(total / limit);

            const viewPath = path.join(
                process.cwd(),
                "views",
                "employee",
                "disable_authentication.ejs"
            );

            const html = await ejs.renderFile(viewPath, {
                employee,
                pagination: { page, limit, total, totalPages },
                search,
                search,
                roles,
                currentRole
            });

            res.render("dashboard", {
                pageTitle: "Deactivated Employees",
                pageIcon: "fas fa-user-slash",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Employee", url: "/employees" },
                    { title: "Deactivated" }
                ],
                body: html
            });
        } catch (err) {
            console.error("Deactivated List Error:", err);
            res.status(500).send("Error rendering deactivated employees");
        }
    }



    //Get All Employees
    static async getAllEmployees(req, res) {
        try {

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const offset = (page - 1) * limit;

            const employees = await EmployeeModel.findAll(limit, offset);

            return res.status(200).json({
                success: true,
                data: employees,
                page: page,
                limit: limit
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    /* =========================
    GET SINGLE EMPLOYEE
 ========================== */
    static async getEmployeeById(req, res) {
        try {
            const employee = await EmployeeModel.findById(req.params.id);

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            delete employee.password;

            res.status(200).json({ success: true, data: employee });
        } catch (error) {
            console.error("Get Employee Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    /* =========================
     UPDATE EMPLOYEE
  ========================== */
    static async updateEmployee(req, res) {
        try {
            const id = req.params.id;
            const data = { ...req.body };

            if (req.file) {
                data.profile_picture = req.file.path;
            }

            const updated = await EmployeeModel.update(id, data);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found or no changes"
                });
            }

            res.redirect(`/employee/profile/${id}`);
        } catch (error) {
            console.error("Update Employee Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    /* =========================
       UPDATE PASSWORD ONLY
    ========================== */
    static async updateEmployeePassword(req, res) {
        try {
            const { password } = req.body;
            const { id } = req.params;

            if (!password || password.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Password is required"
                });
            }

            const hashed = await bcrypt.hash(password, 10);
            const updated = await EmployeeModel.updatePassword(id, hashed);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });

        } catch (error) {
            console.error("Password Update Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    //Update Status In Bulk
    static async activateBulk(req, res) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No employees selected"
                });
            }

            await EmployeeModel.activateBulk(ids);

            res.json({
                success: true,
                message: "Employees activated successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /* =========================
         SOFT DELETE
      ========================== */
    static async deleteEmployee(req, res) {
        try {
            const deleted = await EmployeeModel.delete(req.params.id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Employee deactivated successfully"
            });
        } catch (error) {
            console.error("Delete Employee Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }


    /* =========================
       RESTORE EMPLOYEE
    ========================== */
    static async restoreEmployee(req, res) {
        try {
            const restored = await EmployeeModel.update(req.params.id, {
                deleted_at: null
            });

            if (!restored) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Employee reactivated successfully"
            });
        } catch (error) {
            console.error("Restore Employee Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }


    //Render Profile of employee

    static async renderEmployeeProfile(req, res) {
        try {
            const roles = [
                "Admin",
                "Accountant",
                "Teacher",
                "Librarian",
                "Receptionist"
            ];

            const designations = await DesignationModel.findAll();
            const departments = await DepartmentModel.findAll();


            const employeeId = req.params.id;
            const employee = await EmployeeModel.findById(employeeId);

            if (!employee) {
                return res.status(404).send("Employee not found");
            }

            delete employee.password;

            const viewPath = path.join(
                process.cwd(),
                "views",
                "employee",
                "profile.ejs"
            );

            // Generate modal HTML with current status
            const modalHtml = getUpdatePasswordModal(employeeId, employee.status);

            const html = await ejs.renderFile(viewPath, {
                employee,
                roles,
                designations,
                departments,
                modalHtml
            });

            res.render("dashboard", {
                pageTitle: "Employee Profile",
                pageIcon: "fa-user",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Employee", url: "/employee/view" },
                    { title: employee.name }
                ],
                body: html
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error loading employee profile");
        }
    }

}


