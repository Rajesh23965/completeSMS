import pool from "../../config/database.js";

export class HomeTestimonial {

    static async get() {
        // Query the new table name
        const [rows] = await pool.query("SELECT * FROM home_testimonial LIMIT 1");
        return rows[0] || null;
    }


    static async save(data) {
        // Handle multiple values for checkbox
        let showWebsiteValue = data.show_website;
        if (Array.isArray(showWebsiteValue)) {
            // If checkbox was checked, pick the last one ('Enable')
            showWebsiteValue = showWebsiteValue.pop();
        }

        if (data.id) {
            await pool.query(
                `UPDATE home_testimonial SET 
                title = ?, 
                description = ?, 
                show_website = ? 
             WHERE id = ?`,
                [
                    data.title,
                    data.description,
                    showWebsiteValue,
                    data.id
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO home_testimonial 
                (title, description, show_website) 
             VALUES(?, ?, ?)`,
                [
                    data.title,
                    data.description,
                    showWebsiteValue
                ]
            );
        }
    }

}
