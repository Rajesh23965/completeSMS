import pool from "../../../config/database.js";

export class AboutUsCta {

    static async get() {
        const [rows] = await pool.query("SELECT * FROM about_us_call_to_action_section LIMIT 1");
        return rows[0] || null
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE about_us_call_to_action_section 
                 SET cta_title=?, button_text=?, button_url=? WHERE id=?`,
                [data.cta_title, data.button_text, data.button_url, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO about_us_call_to_action_section (cta_title, button_text, button_url) 
                 VALUES (?, ?, ?)`,
                [data.cta_title, data.button_text, data.button_url]
            );
        }
    }
}
