import pool from "../../../config/database.js";


export class AboutUsSectionSection {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM about_us_sec_service LIMIT 1");
        return rows[0] || null
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE about_us_sec_service 
                 SET title=?, subtitle=?, photo=? WHERE id=?`,
                [data.title, data.subtitle, data.photo, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO about_us_sec_service (title, subtitle, photo) 
                 VALUES (?, ?, ?)`,
                [data.title, data.subtitle, data.photo]
            );
        }
    }
}
