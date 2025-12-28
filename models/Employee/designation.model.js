import pool from "../../config/database.js";

const CURRENT_SCHOOL_ID = 1;

export default class DesignationModel {

    /* ---------------------------------
       Create Designation
    --------------------------------- */
    static async create(data) {
        // Fetch branch_name from school_settings
        const [settings] = await pool.query(
            `SELECT setting_value 
             FROM school_settings 
             WHERE school_id = ? AND setting_key = 'branch_name'
             LIMIT 1`,
            [CURRENT_SCHOOL_ID]
        );

        if (!settings.length) {
            throw new Error("Branch name not found in school settings");
        }

        const branchName = settings[0].setting_value;

        const query = `
            INSERT INTO designations 
                (designation_name, branch_name)
            VALUES (?, ?)
        `;

        const [result] = await pool.execute(query, [
            data.designation_name,
            branchName
        ]);

        return result.insertId;
    }

    /* ---------------------------------
       Get All Designation
    --------------------------------- */
    static async findAll() {
        const query = `
            SELECT 
                id,
                designation_name,
                branch_name,
                created_at,
                updated_at
            FROM designations
            WHERE deleted_at IS NULL
            ORDER BY id DESC
        `;

        const [rows] = await pool.query(query);
        return rows;
    }

    /* ---------------------------------
       Find Designation By ID
    --------------------------------- */
    static async findById(id) {
        const query = `
            SELECT *
            FROM designations
            WHERE id = ? AND deleted_at IS NULL
            LIMIT 1
        `;

        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    }

    /* ---------------------------------
       Update Designation
    --------------------------------- */
    static async update(id, data) {
        const fields = [];
        const values = [];

        if (data.designation_name) {
            fields.push("designation_name = ?");
            values.push(data.designation_name);
        }

        if (!fields.length) {
            return false;
        }

        const query = `
            UPDATE designations
            SET ${fields.join(", ")}
            WHERE id = ? AND deleted_at IS NULL
        `;

        values.push(id);

        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    /* ---------------------------------
       Soft Delete Designation
    --------------------------------- */
    static async delete(id) {
        const query = `
            UPDATE designations
            SET deleted_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        `;

        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
}
