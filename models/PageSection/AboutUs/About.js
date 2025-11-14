import pool from "../../../config/database.js";


export class AboutUsSectionAbout {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM about_us_sec_about LIMIT 1");
        return rows[0] || null
    }

    static async save(data) {
        if (data.id) {
            // FIX: Added missing comma after 'photo=?' in the UPDATE statement
            await pool.query(
                `UPDATE about_us_sec_about 
                 SET title=?, subtitle=?, description=?, photo=? WHERE id=?`,
                [data.title, data.subtitle, data.description, data.photo, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO about_us_sec_about (title, subtitle, description, photo) 
                 VALUES (?, ?, ?, ?)`,
                [data.title, data.subtitle, data.description, data.photo]
            );
        }
    }
}
