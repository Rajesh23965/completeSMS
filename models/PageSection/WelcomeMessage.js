
import pool from "../../config/database.js";

export class WelcomeMessage {
  static async get() {
    const [rows] = await pool.query("SELECT * FROM welcome_message LIMIT 1");
    return rows[0] || null;
  }

  static async save(data) {
    if (data.id) {
      await pool.query(
        `UPDATE welcome_message 
         SET title=?, subtitle=?, description=?, photo=?, title_text_color=?, show_website=?
         WHERE id=?`,
        [data.title, data.subtitle, data.description, data.photo, data.title_text_color, data.show_website, data.id]
      );
    } else {
      await pool.query(
        `INSERT INTO welcome_message (title, subtitle, description, photo, title_text_color, show_website) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.title, data.subtitle, data.description, data.photo, data.title_text_color, data.show_website]
      );
    }
  }
}
