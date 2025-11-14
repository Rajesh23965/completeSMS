import pool from "../../../config/database.js";

export class FaqOptions {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM faq_options LIMIT 1");
        return rows[0] || null;
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE faq_options SET page_title = ?, photo = ?, meta_keyword = ?, meta_description = ? WHERE id = ?`,
                [data.page_title, data.photo, data.meta_keyword, data.meta_description, data.id]
            );
        } else {
            await pool.query(`
            INSERT INTO faq_options (page_title, photo, meta_keyword, meta_description) VALUES(?,?,?,?)`,
                [data.page_title, data.photo, data.meta_keyword, data.meta_description]
            );
        }
    }
}