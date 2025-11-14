import pool from "../../../config/database.js";

export class ExamResultSection {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM page_exam_result LIMIT 1");
        return rows[0] || null;
    }

    static async save(data) {
        if (data.id) {
            await pool.query(`
                UPDATE page_exam_result SET page_title = ?, description = ?, photo = ?, meta_keyword = ?, meta_description = ?,  print_attendance = ?, print_gradescale = ? WHERE id = ?`,
                [data.page_title, data.description, data.photo, data.meta_keyword, data.meta_description, data.print_attendance,
                data.print_gradescale, data.id]
            );
        } else {
            await pool.query(`
                INSERT INTO page_exam_result (page_title, description, photo, meta_keyword, meta_description, print_attendance, print_gradescale) VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [data.page_title, data.description, data.photo, data.meta_keyword, data.meta_description, data.print_attendance,
                data.print_gradescale]
            );
        }
    }
}

