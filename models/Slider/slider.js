import pool from "../../config/database.js";

export class SliderSection {
    static async getPaginated(page = 1, limit = 10, search = "") {
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM slider";
        let countQuery = "SELECT COUNT(*) as count FROM slider";
        const values = [];

        if (search) {
            // Build the WHERE clause to check ALL searchable fields with OR
            query += " WHERE title LIKE ? OR description LIKE ? OR button_text_one LIKE ? OR button_url_one LIKE ? OR button_text_two LIKE ? OR button_url_two LIKE ? OR position LIKE ?";
            countQuery += " WHERE title LIKE ? OR description LIKE ? OR button_text_one LIKE ? OR button_url_one LIKE ? OR button_text_two LIKE ? OR button_url_two LIKE ? OR position LIKE ?";

            // Add the search term for EACH placeholder (?) in the query
            const searchValue = `%${search}%`;
            values.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        const countValues = [...values];

        query += " ORDER BY id ASC LIMIT ? OFFSET ?";
        values.push(limit, offset);

        const [rows] = await pool.query(query, values);
        const [[{ count }]] = await pool.query(countQuery, countValues);


        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            sliders: rows,
            total: count,
            totalPages,
            currentPage: page,
            currentLimit: limit,
            currentSearch: search,
            hasNextPage,
            hasPreviousPage
        };
    }

    static async getById(id) {
        const [rows] = await pool.query("SELECT * FROM slider WHERE id = ?", [id]);
        return rows[0] || null;
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE slider SET 
                    title=?, button_text_one=?, button_url_one=?, 
                    button_text_two=?, button_url_two=?, description=?, 
                    position=?, photo=?, show_website=? WHERE id=?`,
                [data.title, data.button_text_one, data.button_url_one, data.button_text_two, data.button_url_two,
                data.description, data.position, data.photo, data.show_website, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO slider 
                (title, button_text_one, button_url_one, button_text_two, button_url_two, 
                 description, position, photo, show_website) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.title, data.button_text_one, data.button_url_one, data.button_text_two, data.button_url_two,
                data.description, data.position, data.photo, data.show_website]
            );
        }
    }
    static async delete(id) {
        await pool.query("DELETE FROM slider WHERE id = ?", [id]);
    }

    static async toggleShow(id) {
        const [rows] = await pool.query("SELECT show_website FROM slider WHERE id = ?", [id]);
        if (rows.length) {
            const newStatus = rows[0].show_website === "Enable" ? "Disable" : "Enable";
            await pool.query("UPDATE slider SET show_website = ? WHERE id = ?", [newStatus, id]);
            return newStatus;
        }
        return null;
    }
}
