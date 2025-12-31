import express from "express";
import EmployeeController from "../../controllers/Employee/employee.controller.js";
import { uploadEmployees, uploadDocuments } from "../../config/upload.js";
import BankAccountController from "../../controllers/Employee/employeeBank.controller.js";
import DocumentController from "../../controllers/Employee/document.controller.js";

const router = express.Router();

// Employee Routes
router.get("/add", EmployeeController.renderAddEmployeeForm);
router.post("/add", uploadEmployees.single('profile_picture'), EmployeeController.addEmployee);
router.get("/view", EmployeeController.renderEmployeeList);
router.get("/view/:role", EmployeeController.renderEmployeeList);
router.get("/profile/:id", EmployeeController.renderEmployeeProfile);
router.get("/api/:id", EmployeeController.getEmployeeWithAccounts); 
router.post("/profile/:id", uploadEmployees.single('profile_picture'), EmployeeController.updateEmployee);

// Bank Account Routes
router.get("/:id/bank", BankAccountController.getEmployeeBankAccounts);
router.post("/:id/bank", BankAccountController.createBankAccount);
router.put("/:id/bank/:accountId", BankAccountController.updateBankAccount);
router.delete("/:id/bank/:accountId", BankAccountController.deleteBankAccount);
router.put("/:id/bank/:accountId/primary", BankAccountController.setPrimaryAccount);

//Document Routes
router.get('/documents/:docId/download', DocumentController.downloadDocument);

router.get('/documents/:docId', DocumentController.getDocument);
router.get('/documents/:docId/download', DocumentController.downloadDocument);
router.get('/:id/documents', DocumentController.getEmployeeDocuments);

router.post('/:id/documents', uploadDocuments.single('document_file'), DocumentController.createDocument);
router.put('/:id/documents/:docId', uploadDocuments.single('document_file'), DocumentController.updateDocument);
router.delete('/:id/documents/:docId', DocumentController.deleteDocument);


// Other existing routes
router.get("/ajax/list", EmployeeController.ajaxEmployee);
router.get("/disable_authentication", EmployeeController.renderDeactiveEmployeeList);
router.post('/activate-bulk', EmployeeController.activateBulk);
router.get("/export", EmployeeController.exportEmployees);
router.get("/api/employee", EmployeeController.getAllEmployees);
router.get("/:id", EmployeeController.getEmployeeById);
router.put("/password/:id", EmployeeController.updateEmployeePassword);
router.delete("/:id", EmployeeController.deleteEmployee);

export default router;