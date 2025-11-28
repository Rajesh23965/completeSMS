import pool from "../../config/database.js";

export class Topbar {

    // SAVE (Create or Update)
    static async save(data) {
        const {
            id,
            type,
            section,
            position,
            order_no,
            visibility,
            device,
            text,
            icon,
            url,
            border,
            radius,
        } = data;

        // UPDATE
        if (id) {
            const query = `
                UPDATE topbar
                SET
                    type = ?, 
                    section = ?, 
                    position = ?, 
                    order_no = ?, 
                    visibility = ?, 
                    device = ?, 
                    text = ?, 
                    icon = ?, 
                    url = ?, 
                    border = ?, 
                    radius = ?, 
                    updated_at = NOW()
                WHERE id = ? AND deleted_at IS NULL
            `;

            const values = [
                type, section, position, order_no, visibility, device,
                text, icon, url, border, radius, id
            ];

            return pool.query(query, values);
        }

        // INSERT
        const query = `
            INSERT INTO topbar
            (type, section, position, order_no, visibility, device, text, icon, url, border, radius, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            type, section, position, order_no, visibility, device,
            text, icon, url, border, radius
        ];

        return pool.query(query, values);
    }

    // NEW: UPDATE ONLY VISIBILITY
    static async updateVisibility(id, visibility) {
        const query = `
            UPDATE topbar
            SET visibility = ?, updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        `;
        return pool.query(query, [visibility, id]);
    }

    // Soft delete
    static async delete(id) {
        return pool.query(
            `UPDATE topbar SET deleted_at = NOW() WHERE id = ?`,
            [id]
        );
    }

    // Get deleted items
    static async getDeleted() {
        return pool.query(`
            SELECT * FROM topbar 
            WHERE deleted_at IS NOT NULL 
            ORDER BY deleted_at DESC
        `);
    }

    // Restore deleted
    static async restore(id) {
        return pool.query(`
            UPDATE topbar SET deleted_at = NULL WHERE id = ?
        `, [id]);
    }

    // Admin list
    static async getAllAdmin() {
        return pool.query(`
            SELECT * FROM topbar 
            WHERE deleted_at IS NULL
            ORDER BY section ASC, order_no ASC, id ASC
        `);
    }

    // Website list
    static async getAllWebsite() {
        const [rows] = await pool.query(`
            SELECT * FROM topbar 
            WHERE deleted_at IS NULL AND visibility = 1
            ORDER BY section ASC, order_no ASC, id ASC
        `);
        return rows || null;
    }
}
