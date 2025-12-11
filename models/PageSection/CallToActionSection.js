import pool from "../../config/database.js";

export class HomeCta {

    static async get() {
        // Query the new table name
        const [rows] = await pool.query("SELECT * FROM home_call_to_action_section LIMIT 1");
        return rows[0] || null;
    }


    static async save(data) {
        // Handle multiple values for checkbox
        let showWebsiteValue = data.show_website;
        if (Array.isArray(showWebsiteValue)) {
            // If checkbox was checked, pick the last one ('Enable')
            showWebsiteValue = showWebsiteValue.pop();
        }

        if (data.id) {
            await pool.query(
                `UPDATE home_call_to_action_section SET 
                cta_title = ?, 
                mobile_no = ?, 
                button_text = ?, 
                button_url = ?, 
                background_color = ?, 
                text_color = ?, 
                show_website = ? 
             WHERE id = ?`,
                [
                    data.cta_title,
                    data.mobile_no,
                    data.button_text,
                    data.button_url,
                    data.background_color,
                    data.text_color,
                    showWebsiteValue, 
                    data.id
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO home_call_to_action_section 
                (cta_title, mobile_no, button_text, button_url, background_color, text_color, show_website) 
             VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.cta_title,
                    data.mobile_no,
                    data.button_text,
                    data.button_url,
                    data.background_color,
                    data.text_color,
                    showWebsiteValue
                ]
            );
        }
    }

}
