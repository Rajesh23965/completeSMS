import pool from "../../config/database.js";

// Placeholder for the current school ID. In a real app, this would come from req.user
const CURRENT_SCHOOL_ID = 1;

export class SettingMainModel {
 
    static async getSettings() {
        const query = `
            SELECT setting_key, setting_value 
            FROM school_settings 
            WHERE school_id = ?;
        `;

        try {
            const [rows] = await pool.query(query, [CURRENT_SCHOOL_ID]);

            // Transform the array of rows into a single key-value object for easy access in EJS
            const settings = rows.reduce((acc, row) => {
                acc[row.setting_key] = row.setting_value;
                return acc;
            }, {});

            return settings;
        } catch (error) {
            console.error("Error fetching settings:", error);
            throw new Error("Database error while fetching settings.");
        }
    }


    static async updateSettings(settingsData) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const updates = [];
            for (const key in settingsData) {
                if (Object.hasOwnProperty.call(settingsData, key)) {
                    const value = settingsData[key];
                    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both inserts and updates safely
                    const sql = `
                        INSERT INTO school_settings (school_id, setting_key, setting_value)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
                    `;
                    updates.push(connection.query(sql, [CURRENT_SCHOOL_ID, key, value]));
                }
            }

            await Promise.all(updates);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error("Error updating settings:", error);
            throw new Error("Database transaction failed during settings update.");
        } finally {
            connection.release();
        }
    }

    /**
     * Updates a single setting, typically used for file paths (logos).
     * @param {string} key - The setting key (e.g., 'logo_system_path').
     * @param {string} path - The new file path/URL.
     */
    static async updateLogoPath(key, path) {
        const query = `
            INSERT INTO school_settings (school_id, setting_key, setting_value)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
        `;
        try {
            await pool.query(query, [CURRENT_SCHOOL_ID, key, path]);
        } catch (error) {
            console.error(`Error updating logo path for key ${key}:`, error);
            throw new Error("Database error while updating logo path.");
        }
    }
}