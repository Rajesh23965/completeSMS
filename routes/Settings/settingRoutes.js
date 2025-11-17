import express from "express";
import { renderSchoolSetting, updateGeneralSettings, updateLogoSettings, updateToggleSetting } from "../../controllers/SettingsSection/settingSection.js";
import { settingsLogoUpload } from "../../config/upload.js"; 


const router = express.Router();
router.get("/", renderSchoolSetting);

// --- ROUTER DEFINITION ---
router.get("/", renderSchoolSetting);
router.post("/", updateGeneralSettings);

router.post("/fees", updateGeneralSettings);

// Use the upload middleware for logo file uploads
router.post("/logo", settingsLogoUpload, updateLogoSettings);
router.post("/toggle", updateToggleSetting);

export default router;