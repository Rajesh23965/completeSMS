import pool from "../../config/database.js";

export class HomeOptions {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM home_options LIMIT 1");
        return rows[0] || null
    }

    static async save(data) {
        // Corrected the update logic.
        // 1. Added a comma between 'meta_keyword = ?' and 'meta_description = ?' in the query string.
        // 2. Corrected the parameters array: using data.meta_description and data.id.
        if (data.id) {
            await pool.query(
                `UPDATE home_options SET page_title = ?, meta_keyword = ?, meta_description = ? WHERE id = ?`,
                [data.page_title, data.meta_keyword, data.meta_description, data.id]
            );
        }
        else {
            await pool.query(
                `INSERT INTO home_options (page_title, meta_keyword, meta_description) VALUES(?, ?, ?)`,
                [data.page_title, data.meta_keyword, data.meta_description]
            );
        }
    }
}
