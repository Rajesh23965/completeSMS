import pool from "../../config/database.js";

function generateSlug(menu_category_title) {
    return menu_category_title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}


export class MenuCategory {
    /**
     * Insert or update menu category
     */
    static async save(menuCategoryData) {

        if (menuCategoryData.menu_category_title) {
            menuCategoryData.menu_category_slug = generateSlug(menuCategoryData.menu_category_title);
        }

        const columns = [
            "menu_id",
            "menu_category_title",
            "menu_category_slug",
            "menu_category_url",
            "position",
            "status"
        ];

        const placeholders = columns.map(() => "?").join(", ");
        const updateClause = columns.map(col => `${col} = VALUES(${col})`).join(", ");

        const query = `
            INSERT INTO menu_categories (${columns.join(", ")})
            VALUES (${placeholders})
            ON DUPLICATE KEY UPDATE ${updateClause}
        `;

        // Values mapping
        const values = columns.map(col =>
            menuCategoryData[col] !== undefined ? menuCategoryData[col] : null
        );

        try {
            const [result] = await pool.query(query, values);
            return result;
        } catch (error) {
            console.error("Error saving menu category:", error);
            throw error;
        }
    }


    /**
     * Toggle publish status
     */
    static async togglePublish(id) {
        const query = `
            UPDATE menu_categories
            SET status = CASE
                WHEN status = 'Enable' THEN 'Disable'
                ELSE 'Enable'
            END
            WHERE id = ?
        `;
        try {
            const [result] = await pool.query(query, [id]);
            return result;
        } catch (error) {
            console.error("Error toggling status:", error);
            throw error;
        }
    }

    /**
     * Get all categories with pagination + join with menus
     */
    static async getAll() {


        const query = `
            SELECT mc.*, m.title AS menu_title
            FROM menu_categories mc
            LEFT JOIN menus m ON mc.menu_id = m.id
            ORDER BY mc.position ASC
        `;

        const countQuery = `SELECT COUNT(*) as count FROM menu_categories`;

        try {
            const [[{ count }]] = await pool.query(countQuery);
            const [rows] = await pool.query(query,);

            return {
                rows,

            };
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }

    // Update
static async update(id, menuCategoryData) {
    // fetch existing row first
    const [rows] = await pool.query(`SELECT * FROM menu_categories WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw new Error("Category not found");
    }
    const existingData = rows[0];

    // merge old + new (new values override old)
    const finalData = {
        ...existingData,
        ...menuCategoryData
    };

    // regenerate slug if title changed
    if (menuCategoryData.menu_category_title) {
        finalData.menu_category_slug = generateSlug(menuCategoryData.menu_category_title);
    }

    const columns = [
        "menu_id",
        "menu_category_title",
        "menu_category_slug",
        "menu_category_url",
        "position",
        "status"
    ];

    const query = `
        UPDATE menu_categories
        SET ${columns.map(col => `${col} = ?`).join(", ")}
        WHERE id = ?
    `;

    const values = columns.map(col => finalData[col] !== undefined ? finalData[col] : null);
    values.push(id);

    const [result] = await pool.query(query, values);
    return result;
}


    static async getAllCatHierarchical(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const countQuery = `SELECT COUNT(*) as count FROM menu_categories`;

        const query = `
        SELECT mc.*, m.title AS menu_title
        FROM menu_categories mc
        LEFT JOIN menus m ON mc.menu_id = m.id
        ORDER BY mc.position ASC
        LIMIT ? OFFSET ?
    `;

        try {
            // Get total count
            const [[{ count }]] = await pool.query(countQuery);

            // Get paginated rows
            const [rows] = await pool.query(query, [limit, offset]);

            return {
                rows,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }





    /**
     * Get categories by menu_id
     */
    static async getByMenu(menu_id) {
        const query = `
            SELECT * FROM menu_categories 
            WHERE menu_id = ? AND status = 'Enable'
            ORDER BY position ASC
        `;
        try {
            const [rows] = await pool.query(query, [menu_id]);
            return rows;
        } catch (error) {
            console.error("Error fetching menu categories:", error);
            throw error;
        }
    }

    //Delete
static async delete(id) {
    const query = `DELETE FROM menu_categories WHERE id = ?`;

    try {
        const [result] = await pool.query(query, [id]);
        return result;
    } catch (error) {
        console.error("Error deleting menu category:", error);
        throw error;
    }
}

}
