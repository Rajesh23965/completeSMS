import pool from "../../../config/database.js";

export class FrontendFaq {
    static async save(data) {
        if (data.id) {
            // UPDATE
            await pool.query(
                `UPDATE frontend_faq 
         SET title = ?, description = ?
         WHERE id = ?`,
                [data.title, data.description, data.id]
            );
        } else {
            // INSERT
            await pool.query(
                `INSERT INTO frontend_faq (title, description, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
                [data.title, data.description]
            );
        }
    }

    static async getAll(page = 1, limit = 10, search = "") {
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM frontend_faq";
        let countQuery = "SELECT COUNT(*) AS count FROM frontend_faq";
        const values = [];

        if (search) {
            query += " WHERE title LIKE ? OR description LIKE ?";
            countQuery += " WHERE title LIKE ? OR description LIKE ?";
            const searchValue = `%${search}%`;
            values.push(searchValue, searchValue);
        }

        const countValues = [...values];
        query += " ORDER BY id ASC LIMIT ? OFFSET ?";
        values.push(limit, offset);

        const [rows] = await pool.query(query, values);
        const [countRows] = await pool.query(countQuery, countValues);
        const count = countRows[0]?.count || 0;

        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            faq: rows,
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
        const [rows] = await pool.query("SELECT * FROM frontend_faq WHERE id = ?", [id]);
        return rows[0] || null;
    }

    static async delete(id) {
        await pool.query("DELETE FROM frontend_faq WHERE id = ?", [id]);
    }
}
