import pool from "../../config/database.js";

export class GalleryModel {
    static async getPaginated(page = 1, limit = 10, search = "") {
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let query = `
            SELECT g.*, c.cate_name AS category_name  /* FIX: Removed trailing comma here */
            FROM front_gallery g 
            LEFT JOIN gallery_cate c ON g.category_id = c.id
        `;
        let countQuery = "SELECT COUNT(*) AS count FROM front_gallery g LEFT JOIN gallery_cate c ON g.category_id = c.id";
        const values = [];

        if (search) {
            query += " WHERE g.title LIKE ? OR g.description LIKE ? OR c.cate_name LIKE ?";
            countQuery += " WHERE g.title LIKE ? OR g.description LIKE ? OR c.cate_name LIKE ?";
            const searchValue = `%${search}%`;
            values.push(searchValue, searchValue, searchValue);
        }

        const countValues = [...values];
        query += " ORDER BY g.id ASC LIMIT ? OFFSET ?";
        values.push(limit, offset);

        const [rows] = await pool.query(query, values);
        const [[{ count }]] = await pool.query(countQuery, countValues);

        const totalPages = Math.ceil(count / limit);

        return {
            gallery: rows,
            total: count,
            totalPages,
            currentPage: page,
            currentLimit: limit,
            currentSearch: search,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    // ================================
    // GET BY ID
    // ================================
    static async getById(id) {
        const [rows] = await pool.query(
            `
            SELECT g.*, c.cate_name AS category_name 
            FROM front_gallery g 
            LEFT JOIN gallery_cate c ON g.category_id = c.id 
            WHERE g.id = ?
            `,
            [id]
        );
        return rows[0] || null;
    }

    //  Insert or update record
    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE front_gallery 
                 SET title = ?, description = ?, thumbimage = ?, show_website = ?, category_id = ?
                 WHERE id = ?`,
                // You must have an extra value in your 'data' object or the way it's constructed.
                // Assuming 'data' contains { title, description, thumbimage, show_website, category_id, id }
                [data.title, data.description, data.thumbimage, data.show_website, data.category_id, data.id]
                // The parameters look correct here: 5 SET values + 1 WHERE value = 6 parameters.
                // The error means data.show_website contains TWO separate values being interpolated.

                // If you are using the hidden input for 'Disable' AND the checkbox for 'Enable',
                // the data object might contain an array or concatenated string for 'show_website'.
            );
        } else {
            // INSERT new record
            await pool.query(
                `INSERT INTO front_gallery (title, description, thumbimage, show_website, category_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [data.title, data.description, data.thumbimage, data.show_website, data.category_id]
            );
        }
    }

    //  Delete record
    static async delete(id) {
        await pool.query("DELETE FROM front_gallery WHERE id = ?", [id]);
    }


    static async toggleShow(id) {
        const [rows] = await pool.query("SELECT show_website FROM front_gallery WHERE id = ?", [id]);
        if (rows.length) {
            const newStatus = rows[0].show_website === "Enable" ? "Disable" : "Enable";
            await pool.query("UPDATE front_gallery SET show_website = ? WHERE id = ?", [newStatus, id]);
            return newStatus;
        }
        return null;
    }
}
