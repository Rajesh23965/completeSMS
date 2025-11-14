import pool from "../../../config/database.js";

export class FaqSectionFaq {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM faq_sec_faq LIMIT 1");
        return rows[0] || null;
    }

    // Corrected Code:
    static async save(data) {
        if (!data) throw new Error("Data is undefined in FaqSectionFaq.save()");

        if (data.id) {
            await pool.query(
                "UPDATE faq_sec_faq SET title = ?, description = ? WHERE id = ?",
                [data.title, data.description, data.id]
            );
        } else {
            await pool.query(`
                INSERT INTO faq_sec_faq (title, description) VALUES (?, ?)`,
                [data.title, data.description]
            );
        }
    }

}