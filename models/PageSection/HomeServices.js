import pool from "../../config/database.js";


export class HomeServices {

    static async get() {
        // Query the new table name
        const [rows] = await pool.query("SELECT * FROM home_services LIMIT 1");
        return rows[0] || null;
    }

    static async save(data) {

        let showWebsiteValue = data.show_website;
        if (Array.isArray(showWebsiteValue)) {

            showWebsiteValue = showWebsiteValue.pop();
        }

        if (data.id) {
            await pool.query(
                `UPDATE home_services SET 
                title = ?, 
                description = ?, 
                title_text_color = ?, 
                background_color = ?, 
                show_website = ? 
             WHERE id = ?`,
                [
                    data.title,
                    data.description,
                    data.title_text_color,
                    data.background_color,
                    showWebsiteValue,
                    data.id
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO home_services 
                (title, description, title_text_color, background_color, show_website) 
             VALUES(?, ?, ?, ?, ?)`,
                [
                    data.title,
                    data.description,
                    data.title_text_color,
                    data.background_color,
                    showWebsiteValue
                ]
            );
        }
    }
}
