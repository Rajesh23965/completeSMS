import pool from "../../config/database.js";

export class Teachers {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM teachers LIMIT 1");
        return rows[0] || null;
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE teachers 
         SET title=?, start_no_of_teacher=?, description=?, photo=?, title_text_color=?,description_text_color=?, show_website=?
         WHERE id=?`,
                [data.title, data.start_no_of_teacher, data.description, data.photo, data.title_text_color, data.description_text_color, data.show_website, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO teachers (title, start_no_of_teacher, description, photo, title_text_color, description_text_color, show_website) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [data.title, data.start_no_of_teacher, data.description, data.photo, data.title_text_color, data.description_text_color, data.show_website]
            );
        }
    }
}

