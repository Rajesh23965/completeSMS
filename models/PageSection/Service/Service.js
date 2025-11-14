import pool from "../../../config/database.js";

export class ServiceModel {
    static async save(data) {
        if (data.id) {
            // UPDATE existing record
            await pool.query(
                `UPDATE service 
             SET title = ?, 
                 icon = ?, 
                 description = ?
             WHERE id = ?`,
                [data.title, data.icon, data.description, data.id]
            );
        } else {
            // INSERT new record
            await pool.query(
                `INSERT INTO service (title, icon, description)
             VALUES (?, ?, ?)`,
                [data.title, data.icon, data.description]
            );
        }
    }


    static async getAll(page = 1, limit = 10, search = "") {
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM service";
        let countQuery = "SELECT COUNT(*) AS count FROM service";
        const values = [];

        if (search) {
            query += " WHERE title LIKE ? OR description LIKE ?";
            countQuery += " WHERE title LIKE ? OR description LIKE ?";
            const searchValue = `%${search}%`;
            // FIX: Only push the search value twice, once for title and once for description
            values.push(searchValue, searchValue);
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
            services: rows,
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
        const [rows] = await pool.query("SELECT * FROM service WHERE id  = ?", [id]);
        return rows[0] || null;
    }

    static async delete(id) {
        await pool.query("DELETE FROM service WHERE id = ?", [id]);
    }

}