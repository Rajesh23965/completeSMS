import path from "path";
import ejs from "ejs";
import fs from "fs";
import { SettingMainModel } from "../../models/SettingMainModel/SettingMainModel.js";


const CURRENT_SCHOOL_ID = 1;


export const renderSchoolSetting = async (req, res) => {
    try {
        // 1. Fetch all settings data from the database
        const settings = await SettingMainModel.getSettings(CURRENT_SCHOOL_ID);

        // 2. Render the EJS form partial, passing the settings data
        const formPath = path.join(process.cwd(), "views/school_settings/partials/settings.ejs");
        const formHtml = await ejs.renderFile(formPath, {
            settings: settings,
            schoolId: CURRENT_SCHOOL_ID
        });

        // 3. Render the main dashboard page with the settings content
        res.render("dashboard", {
            pageTitle: "School Settings",
            pageIcon: "fa-cog",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "School Settings" }
            ],
            body: formHtml
        });
    } catch (err) {
        console.error("Error rendering school setting:", err);
        res.status(500).send("Error rendering School Settings");
    }
};


export const updateGeneralSettings = async (req, res) => {
    try {
        // Extract and filter settings from the request body
        const settingsToUpdate = req.body;

        // Update the database
        await SettingMainModel.updateSettings(settingsToUpdate);

        res.status(200).json({ success: true, message: "General Settings updated successfully." });
    } catch (err) {
        console.error("Error updating general settings:", err);
        res.status(500).json({ success: false, message: "Failed to update settings due to a server error." });
    }
};


export const updateLogoSettings = async (req, res) => {
    try {
        const { files } = req;
        const body = req.body;
        const updates = [];

        // Handle file uploads and update database paths
        if (files) {
            const fileKeys = {
                system_logo: 'logo_system_path',
                text_logo: 'logo_text_path',
                print_logo: 'logo_printing_path',
                report_card: 'logo_report_card_path'
            };


            for (const [fieldName, settingKey] of Object.entries(fileKeys)) {
                if (files[fieldName] && files[fieldName].length > 0) {
                    const newPath = `/uploads/settings/${files[fieldName][0].filename}`;

                    // Optional: Get old path to delete old file
                    const oldPath = body[`old_${settingKey}`];
                    if (oldPath && oldPath !== newPath) {
                        const fullOldPath = path.join(process.cwd(), 'public', oldPath);
                        if (fs.existsSync(fullOldPath)) {
                            fs.unlinkSync(fullOldPath); // Delete old file
                        }
                    }

                    // Update the path in the database
                    updates.push(SettingMainModel.updateLogoPath(settingKey, newPath));
                }
            }
        }

        await Promise.all(updates);

        res.status(200).json({ success: true, message: "Logo Settings updated successfully." });
    } catch (err) {
        console.error("Error updating logo settings:", err);
        res.status(500).json({ success: false, message: "Failed to update logo settings." });
    }
};


export const updateToggleSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || typeof value === 'undefined') {
            return res.status(400).json({ success: false, message: "Missing key or value for toggle update." });
        }

        // Update the database (reuse updateLogoPath as it performs a simple single key update)
        await SettingMainModel.updateLogoPath(key, value.toString());

        res.status(200).json({ success: true, message: `${key} updated successfully.` });
    } catch (err) {
        console.error(`Error updating toggle ${key}:`, err);
        res.status(500).json({ success: false, message: "Failed to update toggle setting." });
    }
};



export const updateRegistrationSettings = async (req, res) => {
    try {
        await SettingMainModel.updateSettings(req.body);
        res.json({ success: true, message: "Registration settings saved" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
};


export const updateFeesSettings = async (req, res) => {
    try {
        await SettingMainModel.updateSettings(req.body);
        res.json({ success: true, message: "Fees settings saved" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
};
