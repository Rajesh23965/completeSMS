import express from "express";
import { deleteTopbar, getDeleted, getTopbarAdmin, getTopbarWebSite, renderTopbarUI, restore, saveTopbar, TopbarDateController, updateVisibility } from "../../controllers/Topbar/Topbbar.controller.js";

const router = express.Router();

router.get("/topbar", renderTopbarUI)

router.post("/save", saveTopbar);

router.get("/get/topbar", getTopbarAdmin);

router.get("/topbar/get", getTopbarWebSite);

router.delete("/topbar/delete/:id", deleteTopbar);

router.get("/deleted", getDeleted);

router.put("/restore/:id", restore);

router.patch("/topbar/visibility/update", updateVisibility)

router.post("/save-date-settings", TopbarDateController.save); 
router.get("/topbar/date/get", TopbarDateController.get);
export default router;


