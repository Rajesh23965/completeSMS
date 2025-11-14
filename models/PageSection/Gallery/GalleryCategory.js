import pool from "../../../config/database.js";

function generateSlug(cate_name) {
    return cate_name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export class GalleryCatModel {
    //  Pagination with optional search
    static async getPaginated(page = 1, limit = 10, search = "") {
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        //  Use correct table name for both queries
        let query = "SELECT * FROM gallery_cate";
        let countQuery = "SELECT COUNT(*) AS count FROM gallery_cate";
        const values = [];

        if (search) {
            query += " WHERE cate_name LIKE ?";
            countQuery += " WHERE cate_name LIKE ?";
            const searchValue = `%${search}%`;
            values.push(searchValue);
        }

        const countValues = [...values];

        query += " ORDER BY id ASC LIMIT ? OFFSET ?";
        values.push(limit, offset);

        const [rows] = await pool.query(query, values);
        const [[{ count }]] = await pool.query(countQuery, countValues);

        const totalPages = Math.ceil(count / limit);

        return {
            galleryCate: rows,
            total: count,
            totalPages,
            currentPage: page,
            currentLimit: limit,
            currentSearch: search,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }

    //  Get by ID
    static async getById(id) {
        const [rows] = await pool.query(
            "SELECT * FROM gallery_cate WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    //  Insert or update record
    static async save(data) {
        const slug = generateSlug(data.cate_name);

        if (data.id) {
            //  Correct number of placeholders
            await pool.query(
                `UPDATE gallery_cate SET cate_name = ?, slug = ? WHERE id = ?`,
                [data.cate_name, slug, data.id]
            );
        } else {
            //  Correct number of placeholders and fields
            await pool.query(
                `INSERT INTO gallery_cate (cate_name, slug) VALUES (?, ?)`,
                [data.cate_name, slug]
            );
        }
    }

    //  Delete record
    static async delete(id) {
        await pool.query("DELETE FROM gallery_cate WHERE id = ?", [id]);
    }

    static async getAll() {
        // Fetches all categories for use in a dropdown menu
        const [rows] = await pool.query("SELECT id, cate_name FROM gallery_cate ORDER BY cate_name ASC");
        return rows;
    }
}
