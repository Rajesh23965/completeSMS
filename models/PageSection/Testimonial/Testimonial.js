import pool from "../../../config/database.js";

export class TestimonialModel {
    static async getPaginated(page = 1, limit = 10, search = "") {
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM testimonial";
        let countQuery = "SELECT COUNT(*) as count FROM testimonial";
        const values = [];

        if (search) {
            query += " WHERE name LIKE ? OR surname LIKE ? OR `rank` LIKE ? OR description LIKE ?";
            countQuery += " WHERE name LIKE ? OR surname LIKE ? OR `rank` LIKE ? OR description LIKE ?";

            // Add the search term for EACH placeholder (?) in the query
            const searchValue = `%${search}%`;
            values.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
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
            testimonials: rows,
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
        const [rows] = await pool.query("SELECT * FROM testimonial WHERE id = ?", [id]);
        return rows[0] || null;
    }

    static async save(data) {
        if (data.id) {
            await pool.query(
                `UPDATE testimonial SET name=?, surname=?, \`rank\`=?, description=?, photo=? WHERE id=?`,
                [data.name, data.surname, data.rank, data.description, data.photo, data.id]
            );
        } else {
            await pool.query(
                `INSERT INTO testimonial (name, surname, \`rank\`, description, photo)
   VALUES (?, ?, ?, ?, ?)`,
                [data.name, data.surname, data.rank, data.description, data.photo]
            );


        }
    }
    static async delete(id) {
        await pool.query("DELETE FROM testimonial WHERE id = ?", [id]);
    }
}
