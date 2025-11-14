import pool from "../../config/database.js";

function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}


export default class MenuModel {

    static async save(menuData) {
        if (menuData.external_link) {
            const isValidLink = menuData.external_link.startsWith('/') ||
                menuData.external_link.startsWith('http://') ||
                menuData.external_link.startsWith('https://');

            if (!isValidLink) {
                throw new Error("External link must start with / for relative paths or http:///https:// for full URLs");
            }
        }
        if (menuData.title) {
            menuData.slug = generateSlug(menuData.title);
        }

        const columns = [
            "title", "slug", "position", "publish",
            "target_new_window", "external_url",
            "external_link", "sub_menu"
        ];

        const placeholders = columns.map(() => "?").join(", ");
        const updateClause = columns.map(col => `${col}=VALUES(${col})`).join(", ");

        const query = `
            INSERT INTO menus (${columns.join(", ")})
            VALUES (${placeholders})
            ON DUPLICATE KEY UPDATE ${updateClause}
        `;

        const values = columns.map(col => menuData[col] ?? null);

        try {
            const [result] = await pool.query(query, values);
            return result;
        } catch (error) {
            console.error("Error saving menu:", error);
            throw error;
        }
    }

    static async update(id, menuData) {
        if (menuData.title) {
            menuData.slug = generateSlug(menuData.title);
        }

        const columns = [
            "title", "slug", "position", "publish",
            "target_new_window", "external_url",
            "external_link", "sub_menu"
        ];


        const setClause = columns.map(col => `${col} = ?`).join(", ");
        const values = columns.map(col => menuData[col] ?? null);
        values.push(id);

        const query = `
            UPDATE menus
            SET ${setClause}
            WHERE id = ?
        `;

        try {
            const [result] = await pool.query(query, values);
            return result;
        } catch (error) {
            console.error("Error updating menu:", error);
            throw error;
        }
    }

    static async togglePublish(id) {
        const query = `
        UPDATE menus
        SET publish = CASE
            WHEN publish = 'Enable' THEN 'Disable'
            ELSE 'Enable'
        END
        WHERE id = ?
        `;

        try {
            const [result] = await pool.query(query, [id]);
            return result;
        } catch (error) {
            console.error("Error toggling publish : ", error);
            throw error;
        }
    }

    // Get all menus with parent names
    static async getAllWithParentNames(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const countQuery = `SELECT COUNT(*) as total FROM menus`;
        const [countResult] = await pool.query(countQuery);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const query = `
            SELECT m.*, p.title as sub_menu_name 
            FROM menus m 
            LEFT JOIN menus p ON m.sub_menu = p.id 
            ORDER BY m.position ASC 
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query(query, [limit, offset]);

        return {
            rows,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }

    // Search with parent names
    static async searchWithParentNames(searchQuery, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const searchTerm = `%${searchQuery}%`;

        const countQuery = `SELECT COUNT(*) as total FROM menus WHERE title LIKE ?`;
        const [countResult] = await pool.query(countQuery, [searchTerm]);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const query = `
            SELECT m.*, p.title as sub_menu_name 
            FROM menus m 
            LEFT JOIN menus p ON m.sub_menu = p.id 
            WHERE m.title LIKE ? 
            ORDER BY m.position ASC 
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query(query, [searchTerm, limit, offset]);

        return {
            rows,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }

    // Get menus for dropdown (only id and title)
    static async getAllForDropdown(excludeId = null) {
        let query = `SELECT id, title FROM menus ORDER BY position ASC`;
        let params = [];

        if (excludeId) {
            query = `SELECT id, title FROM menus WHERE id != ? ORDER BY position ASC`;
            params.push(excludeId);
        }

        const [rows] = await pool.query(query, params);
        return rows;
    }
    // Get hierarchical menus (parents + children)
    static async getAllHierarchical(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // Count only root menus
        const countQuery = `SELECT COUNT(*) as count FROM menus WHERE sub_menu IS NULL`;
        const [[{ count }]] = await pool.query(countQuery);

        // Fetch root menus with pagination
        const rootQuery = `
        SELECT m.*, p.title as sub_menu_name
        FROM menus m
        LEFT JOIN menus p ON m.sub_menu = p.id
        WHERE m.sub_menu IS NULL
        ORDER BY m.position ASC
        LIMIT ? OFFSET ?
    `;
        const [rootRows] = await pool.query(rootQuery, [limit, offset]);

        // Fetch all children (we attach them later)
        const childrenQuery = `
        SELECT m.*, p.title as sub_menu_name
        FROM menus m
        LEFT JOIN menus p ON m.sub_menu = p.id
        WHERE m.sub_menu IS NOT NULL
        ORDER BY m.sub_menu, m.position ASC
    `;
        const [childRows] = await pool.query(childrenQuery);

        // Map all rows
        const menuMap = {};
        [...rootRows, ...childRows].forEach(row => {
            menuMap[row.id] = { ...row, children: [] };
        });

        // Attach children
        childRows.forEach(row => {
            if (row.sub_menu) {
                menuMap[row.sub_menu]?.children.push(menuMap[row.id]);
            }
        });

        // Final paginated roots
        const rootMenus = rootRows.map(r => menuMap[r.id]);

        return {
            rows: rootMenus,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
    }

    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const query = `
        SELECT m.*,
               pm.title AS sub_menu_name
        FROM menus m
        LEFT JOIN menus pm ON m.sub_menu = pm.id
        ORDER BY m.position ASC
        LIMIT ? OFFSET ?
    `;

        const countQuery = `SELECT COUNT(*) as count FROM menus`;

        const [[{ count }]] = await pool.query(countQuery);
        const [rows] = await pool.query(query, [limit, offset]);

        return {
            rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
    }


    static async search(searchQuery, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const searchTerm = `%${searchQuery}%`;


        // Count only root menus
        const countQuery = `SELECT COUNT(*) as count FROM menus WHERE sub_menu IS NULL AND title LIKE ?`;
        const [[{ count }]] = await pool.query(countQuery, [searchTerm]);

        // Fetch root menus with pagination
        const rootQuery = `
        SELECT m.*, p.title as sub_menu_name
        FROM menus m
        LEFT JOIN menus p ON m.sub_menu = p.id
        WHERE m.sub_menu IS NULL
        AND m.title LIKE ?
        ORDER BY m.position ASC
        LIMIT ? OFFSET ?
    `;
        const [rootRows] = await pool.query(rootQuery, [searchTerm, limit, offset]);

        // Fetch all children (we attach them later)
        const childrenQuery = `
        SELECT m.*, p.title as sub_menu_name
        FROM menus m
        LEFT JOIN menus p ON m.sub_menu = p.id
        WHERE m.sub_menu IS NOT NULL
        ORDER BY m.sub_menu, m.position ASC
    `;
        const [childRows] = await pool.query(childrenQuery);

        // Map all rows
        const menuMap = {};
        [...rootRows, ...childRows].forEach(row => {
            menuMap[row.id] = { ...row, children: [] };
        });

        // Attach children
        childRows.forEach(row => {
            if (row.sub_menu) {
                menuMap[row.sub_menu]?.children.push(menuMap[row.id]);
            }
        });

        // Final paginated roots
        const rootMenus = rootRows.map(r => menuMap[r.id]);

        return {
            rows: rootMenus,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(count / limit),
            hasPreviousPage: page > 1
        };
    }

    static async getById(id) {
        const query = "SELECT * FROM menus WHERE id = ?";
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    static async delete(id) {
        const query = "DELETE FROM menus WHERE id = ?";
        const [result] = await pool.query(query, [id]);
        return result;
    }

    static async getMenusForSection(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const query = `
        SELECT m.*,
               pm.title AS sub_menu_name
        FROM menus m
        LEFT JOIN menus pm ON m.sub_menu = pm.id
        ORDER BY m.position ASC
        LIMIT ? OFFSET ?
    `;

        const countQuery = `SELECT COUNT(*) as count FROM menus`;

        const [[{ count }]] = await pool.query(countQuery);
        const [rows] = await pool.query(query, [limit, offset]);

        return {
            rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
    }

    // Get menu by slug 
    static async getMenuBySlug(slug) {
        try {
            console.log("Searching for menu with slug:", slug);

            // Use the correct column name 'publish' with value 'Enable'
            const query = `SELECT * FROM menus WHERE slug = ? AND publish = 'Enable'`;
            const values = [slug];

            console.log("Executing query:", query);
            console.log("With values:", values);

            const result = await pool.query(query, values);

            if (!result) {
                console.error("Query returned undefined result");
                return null;
            }

            console.log("Query successful, found rows:", result.rows.length);
            return result.rows[0] || null;

        } catch (error) {
            console.error("Database error in getMenuBySlug:", error);
            throw new Error(`Error fetching menu by slug: ${error.message}`);
        }
    }


}