import express from "express";
import {
    getSettings,
    renderSettingsForm,
    saveSettingsForm,
    saveSettingsAPI,
    removeLogo,
    removeFavicon
} from "../../controllers/SettingController/settingController.js";
import { uploadFiles } from "../../config/upload.js";

const router = express.Router();

/* Display setting form */
router.get("/setting", renderSettingsForm);

/* Save or update settings (form submission with file upload) */
router.post("/save", uploadFiles, saveSettingsForm);

/* API endpoint to save settings (with file upload) */
router.post("/api/save", uploadFiles, saveSettingsAPI);

/* Get Settings (API endpoint) */
router.get("/api", getSettings);

/* Remove logo (API endpoint) */
router.delete("/api/remove-logo", removeLogo);

/* Remove favicon (API endpoint) */
router.delete("/api/remove-favicon", removeFavicon);


export default router;