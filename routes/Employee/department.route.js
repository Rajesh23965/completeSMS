import express from "express";
import DepartmentController from "../../controllers/Employee/department.controller.js";

const router = express.Router();

router.get("/department",DepartmentController.renderDepartment);

router.post("/department", DepartmentController.addDepartment);
router.put("/department", DepartmentController.updateDepartment);
router.delete("/department/:id", DepartmentController.deleteDepartment);


export default router;