import path from "path";
import ejs from "ejs";
import express from "express";

// Assuming upload.js is outside controllers/
import fs from "fs"; // For deleting old files
import { SettingMainModel } from "../../models/SettingMainModel/SettingMainModel.js";


// Placeholder for the current school ID.
const CURRENT_SCHOOL_ID = 1; 

/**
 * Renders the main School Settings dashboard page.
 */
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

/**
 * Handles submission for General Settings (text inputs).
 */
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

/**
 * Handles submission for Logo Settings (file uploads).
 */
export const updateLogoSettings = async (req, res) => {
    try {
        const { files } = req;
        const body = req.body; // Contains logo types and paths
        const updates = [];

        // 1. Handle file uploads and update database paths
        if (files) {
            const fileKeys = {
                logo: 'logo_system_path',
                fav_icon: 'logo_text_path' // Mapping 'fav_icon' field to 'logo_text_path' for simplicity
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

/**
 * Handles submission for single setting toggles (like Enable Fine).
 */
export const updateToggleSetting = async (req, res) => {
    try {
        const { key, value } = req.body; // key is setting_key, value is '1' or '0'
        
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

