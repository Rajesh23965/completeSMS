import pool from "../../../config/database.js";


export class TeacherSection {

    static async get() {
        const [rows] = await pool.query("SELECT * FROM teacher_section LIMIT 1");
        return rows[0] || null
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE teacher_section 
       SET page_title = ?, photo = ?, meta_keyword = ?, meta_description = ? 
       WHERE id = ?`,
                [data.page_title, data.photo, data.meta_keyword, data.meta_description, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO teacher_section (page_title, photo, meta_keyword, meta_description)
       VALUES (?, ?, ?, ?)`,
                [data.page_title, data.photo, data.meta_keyword, data.meta_description]
            );
        }
    }

}

