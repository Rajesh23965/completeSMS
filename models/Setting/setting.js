import pool from "../../config/database.js";

export class Settings {
    /**
     * Insert or update CMS settings
     */
    static async save(settingData) {
        const columns = [
            "cms_title", "cms_url_alias", "cms_frontend", "online_admission",
            "receive_email_to", "captcha_status", "working_hours", "right_logo", "left_logo", "fav_icon",
            "address", "google_analytics", "theme_primary_color", "theme_menu_bg_color",
            "theme_button_hover_color", "theme_text_color", "theme_text_secondary_color",
            "theme_footer_bg_color", "theme_footer_text_color", "theme_copyright_bg_color",
            "theme_copyright_text_color", "theme_border_radius",
            "mobile_no", "email", "fax", "footer_about_text", "copyright_text",
            "facebook_url", "twitter_url", "youtube_url", "google_plus",
            "linkedin_url", "pinterest_url", "instagram_url"
        ];

        const placeholders = columns.map(() => "?").join(", ");
        const updateClause = columns.map(col => `${col} = VALUES(${col})`).join(", ");

        const query = `INSERT INTO settings (id, ${columns.join(", ")})
        VALUES (1, ${placeholders})
        ON DUPLICATE KEY UPDATE ${updateClause}`;

        // Ensure all values are defined, using null for undefined properties
        const values = columns.map(col => settingData[col] !== undefined ? settingData[col] : null);

        try {
            const [result] = await pool.query(query, values);
            return result;
        } catch (error) {
            console.error("Error saving setting:", error);
            throw error;
        }
    }

    /*Get settings*/
    static async get() {
        const query = `SELECT * FROM settings WHERE id = 1`;
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching settings:", error);
            throw error;
        }
    }

    //Remove Logo
    static async removeLogo() {
        const query = `UPDATE settings SET right_logo = NULL, left_logo = NULL  WHERE id = 1`;
        try {
            const [result] = await pool.query(query);
            return result;
        } catch (error) {
            console.error("Error removing logos", error);
            throw error;
        }
    }
    //Remove Favicon
    static async removeFavicon() {
        const query = `UPDATE settings SET fav_icon = NULL WHERE id = 1`;
        try {
            const [result] = await pool.query(query);
            return result;
        } catch (error) {
            console.error("Error removing favicon", error);
            throw error;
        }
    }

}