import express from "express";
import EmployeeController from "../../controllers/Employee/employee.controller.js";
import { uploadEmployees } from "../../config/upload.js";
const router = express.Router();

router.get("/ajax/list", EmployeeController.ajaxEmployee);

router.get("/add", EmployeeController.renderAddEmployeeForm);
router.post("/add", uploadEmployees.single('profile_picture'), EmployeeController.addEmployee);

router.get("/view", EmployeeController.renderEmployeeList);
router.get("/view/:role", EmployeeController.renderEmployeeList);
router.get("/disable_authentication", EmployeeController.renderDeactiveEmployeeList);

router.post('/activate-bulk', EmployeeController.activateBulk);

router.get("/export", EmployeeController.exportEmployees);
router.get("/api/employee", EmployeeController.getAllEmployees);

router.get("/profile/:id", EmployeeController.renderEmployeeProfile);
router.post("/profile/:id", uploadEmployees.single('profile_picture'), EmployeeController.updateEmployee);

router.get("/:id", EmployeeController.getEmployeeById);
router.put("/password/:id", EmployeeController.updateEmployeePassword);
router.delete("/:id", EmployeeController.deleteEmployee);

export default router;


