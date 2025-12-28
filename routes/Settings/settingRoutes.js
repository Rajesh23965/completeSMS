import express from "express";
import { renderSchoolSetting, updateFeesSettings, updateGeneralSettings, updateLogoSettings, updateRegistrationSettings, updateToggleSetting } from "../../controllers/SettingsSection/settingSection.js";
import { settingsLogoUpload } from "../../config/upload.js"; 


const router = express.Router();
router.get("/", renderSchoolSetting);

// --- ROUTER DEFINITION ---
router.get("/", renderSchoolSetting);


router.post("/general", updateGeneralSettings);
router.post("/registration", updateRegistrationSettings);
router.post("/fees", updateFeesSettings);

// Use the upload middleware for logo file uploads
router.post("/logo", settingsLogoUpload, updateLogoSettings);
router.post("/toggle", updateToggleSetting);

export default router;

