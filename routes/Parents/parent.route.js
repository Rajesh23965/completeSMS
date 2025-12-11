import express from "express";
import ParentController from "../../controllers/Parents/parents.controller.js";
import { uploadParents } from "../../config/upload.js";
const router = express.Router();

router.get("/add", ParentController.renderAddParentForm);
router.post("/add", uploadParents.single('profile_image'), ParentController.addParent);

export default router;
