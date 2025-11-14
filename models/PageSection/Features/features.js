import pool from "../../../config/database.js";

export class FeaturesSection {
   static async save(data) {
    if (data.id) {
        // UPDATE existing record
        await pool.query(
            `UPDATE features 
             SET title = ?, 
                 button_text = ?, 
                 button_url = ?, 
                 description = ?, 
                 icon = ?, 
                 updated_at = NOW()
             WHERE id = ?`,
            [data.title, data.button_text, data.button_url, data.description, data.icon, data.id]
        );
    } else {
        // INSERT new record
        await pool.query(
            `INSERT INTO features 
                (title, button_text, button_url, description, icon, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [data.title, data.button_text, data.button_url, data.description, data.icon]
        );
    }
}

   static async getAll(page = 1, limit = 10, search = "") {
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM features";
    let countQuery = "SELECT COUNT(*) AS count FROM features";
    const values = [];

    if (search) {
        query += " WHERE title LIKE ? OR description LIKE ? OR button_text LIKE ?";
        countQuery += " WHERE title LIKE ? OR description LIKE ? OR button_text LIKE ?";
        const searchValue = `%${search}%`;
        values.push(searchValue, searchValue, searchValue);
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
        features: rows,
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
        const [rows] = await pool.query("SELECT * FROM features WHERE id  = ?", [id]);
        return rows[0] || null;
    }

    static async delete(id) {
        await pool.query("DELETE FROM features WHERE id = ?", [id]);
    }

}