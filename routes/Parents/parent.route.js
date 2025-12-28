import express from "express";
import ParentController from "../../controllers/Parents/parents.controller.js";
import { uploadParents } from "../../config/upload.js";
const router = express.Router();

router.get("/ajax/list", ParentController.ajaxParents);

router.get("/add", ParentController.renderAddParentForm);
router.post("/add", uploadParents.single('profile_image'), ParentController.addParent);

router.get("/view", ParentController.renderParentList);
router.get("/disable_authentication", ParentController.renderDeactiveParentList);

router.post('/activate-bulk', ParentController.activateBulk);

router.get("/export", ParentController.exportParents);
router.get("/api/parents", ParentController.getAllParents);

router.get("/profile/:id", ParentController.renderParentProfile);
router.post("/profile/:id", uploadParents.single('profile_image'), ParentController.updateParent);

router.get("/:id", ParentController.getParentById);
router.put("/password/:id", ParentController.updateParentPassword);
router.delete("/:id", ParentController.deleteParent);

export default router;
