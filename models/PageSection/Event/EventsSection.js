import pool from "../../../config/database.js";


export class EventsSection {

    static async get() {
        const [rows] = await pool.query("SELECT * FROM events LIMIT 1");
        return rows[0] || null
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE events 
       SET title = ?, description = ? 
       WHERE id = ?`,
                [data.title, data.description, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO events (title, description)
       VALUES (?, ?)`,
                [data.title, data.description]
            );
        }
    }

}

