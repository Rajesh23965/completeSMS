import express from "express";
import DesignationController from "../../controllers/Employee/designation.controller.js";

const router = express.Router();

router.get("/designation",DesignationController.renderDesignation);

router.post("/designation", DesignationController.addDesignation);
router.put("/designation", DesignationController.updateDesignation);
router.delete("/designation/:id", DesignationController.deleteDesignation);


export default router;