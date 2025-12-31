import pool from "../../config/database.js";

// Allowed sortable columns
const ALLOWED_SORT_COLUMNS = {
    id: "e.id",
    staffId: "e.staffId",
    name: "e.name",
    role: "e.role",
    joining_date: "e.joining_date",
    status: "e.status",
    created_at: "e.created_at"
};

const CURRENT_SCHOOL_ID = 1;

export default class EmployeeModel {

    static generateStaffId(length = 7) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static async generateUniqueStaffId() {
        let staffId;
        let exists = true;

        while (exists) {
            staffId = this.generateStaffId(7);
            const [rows] = await pool.query(
                `SELECT id FROM employees WHERE staffId = ? LIMIT 1`,
                [staffId]
            );
            exists = rows.length > 0;
        }

        return staffId;
    }

    /* =========================
       CREATE EMPLOYEE
    ========================== */
    static async create(data) {
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
        const staffId = await this.generateUniqueStaffId();

        // Corrected query - now has 25 placeholders
        const query = `
        INSERT INTO employees (
            staffId, name, role, gender, date_of_birth,
            religion, blood_group,
            mobile_number, e_email,
            present_address, permanent_address,
            joining_date, designation_id, department_id,
            qualification, experience_details, total_experience,
            profile_picture,
            username, password,
            e_facebook_url, e_twitter_url, e_linkedin_url,
            branch_name, status
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

        const values = [
            staffId,
            data.name,
            data.role,
            data.gender,
            data.date_of_birth,
            data.religion || null,
            data.blood_group || null,
            data.mobile_number,
            data.e_email || null,
            data.present_address || null,
            data.permanent_address || null,
            data.joining_date,
            data.designation_id,
            data.department_id,
            data.qualification || null,
            data.experience_details || null,
            data.total_experience || 0,
            data.profile_picture || null,
            data.username,
            data.password,
            data.e_facebook_url || null,
            data.e_twitter_url || null,
            data.e_linkedin_url || null,
            branchName,
            1
        ];



        const [result] = await pool.execute(query, values);

        return {
            id: result.insertId,
            staffId: staffId
        };
    }

    static async findByEmail(e_email, excludeId = null) {
        let query = `SELECT * FROM employees WHERE e_email = ? AND deleted_at IS NULL`;
        const params = [e_email];

        if (excludeId) {
            query += ` AND id != ?`;
            params.push(excludeId);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0];
    }


    /* =========================
       FIND ALL (ACTIVE)
    ========================== */

    static async findAll(limit = 25, offset = 0, search = "", sortBy = "id", sortDir = "ASC", roles = [], status = 1) {
        const column = ALLOWED_SORT_COLUMNS[sortBy] || "e.id";
        const direction = sortDir === "DESC" ? "DESC" : "ASC";

        let query = `
        SELECT 
            e.id,
            e.staffId,
            e.name,
            e.role,
            e.status,
            e.mobile_number,
            e.e_email,
            e.branch_name,
            d.designation_name,
            dp.department_name,
            e.joining_date,
            e.profile_picture,
            (
                SELECT COUNT(*)
                FROM employee_bank_accounts b
                WHERE b.employee_id = e.id AND b.deleted_at IS NULL
            ) as bank_account_count
        FROM employees e
        JOIN designations d ON e.designation_id = d.id
        JOIN departments dp ON e.department_id = dp.id
        WHERE e.deleted_at IS NULL
        AND e.status = ?
    `;

        const params = [status];

        if (roles && roles.length > 0) {
            query += ` AND e.role IN (${roles.map(() => '?').join(',')})`;
            params.push(...roles);
        }

        if (search) {
            query += `
            AND (
                e.staffId LIKE CONCAT(?, '%')
                OR e.name LIKE CONCAT('%', ?, '%')
                OR e.mobile_number LIKE CONCAT(?, '%')
                OR e.e_email LIKE CONCAT('%', ?, '%')
            )
        `;
            params.push(search, search, search, search);
        }

        query += ` ORDER BY ${column} ${direction} LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }



    /* =========================
       FIND DEACTIVATED
    ========================== */
    static async findDeactive(limit = 25, offset = 0, search = "") {
        let query = `
            SELECT id, staffId, name, mobile_number, e_email
            FROM employees
            WHERE deleted_at IS NOT NULL
        `;

        const params = [];

        if (search) {
            query += `
                AND (
                    staffId LIKE ?
                    OR name LIKE ?
                    OR mobile_number LIKE ?
                    OR e_email LIKE ?
                )
            `;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        query += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    /* =========================
       COUNTS
    ========================== */
    static async getTotalCount(search = "", roles = [], status = 1) {
        let query = `SELECT COUNT(*) AS total FROM employees e WHERE e.deleted_at IS NULL AND e.status = ?`;
        const params = [status];

        if (roles && roles.length > 0) {
            query += ` AND e.role IN (${roles.map(() => '?').join(',')})`;
            params.push(...roles);
        }

        if (search) {
            query += `
            AND (
                e.staffId LIKE ?
                OR e.name LIKE ?
                OR e.mobile_number LIKE ?
                OR e.e_email LIKE ?
            )
        `;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        const [[row]] = await pool.query(query, params);
        return row.total;
    }

    static async getDeactiveTotalCount(search = "") {
        let query = `
            SELECT COUNT(*) AS total
            FROM employees
            WHERE deleted_at IS NOT NULL
        `;

        const params = [];

        if (search) {
            query += `
                AND (
                    staffId LIKE ?
                    OR name LIKE ?
                    OR mobile_number LIKE ?
                    OR e_email LIKE ?
                )
            `;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        const [[row]] = await pool.query(query, params);
        return row.total;
    }


    /* =========================
       FIND BY ID / USERNAME
    ========================== */
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT 
                e.*,
                d.designation_name,
                dp.department_name
             FROM employees e
             LEFT JOIN designations d ON e.designation_id = d.id
             LEFT JOIN departments dp ON e.department_id = dp.id
             WHERE e.id = ? AND e.deleted_at IS NULL`,
            [id]
        );
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await pool.execute(
            `SELECT * FROM employees WHERE username = ? AND deleted_at IS NULL`,
            [username]
        );
        return rows[0];
    }

    /* =========================
       UPDATE EMPLOYEE
    ========================== */
    static async update(id, data) {
        const fields = [];
        const values = [];

        const allowedColumns = [
            "name", "role", "gender", "date_of_birth",
            "religion", "blood_group",
            "mobile_number", "e_email",
            "present_address", "permanent_address",
            "joining_date", "designation_id", "department_id",
            "qualification", "experience_details", "total_experience",
            "profile_picture",
            "e_facebook_url", "e_twitter_url", "e_linkedin_url",
            "status"
        ];

        for (const [key, val] of Object.entries(data)) {
            if (allowedColumns.includes(key) && val !== undefined && val !== null) {
                // Handle empty string for optional fields
                if (val === '') {
                    values.push(null);
                } else {
                    values.push(val);
                }
                fields.push(`${key} = ?`);
            }
        }

        if (fields.length === 0) return false;

        values.push(id);

        const query = `UPDATE employees SET ${fields.join(", ")} WHERE id = ?`;

        try {
            const [result] = await pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /* =========================
       UPDATE PASSWORD
    ========================== */
    static async updatePassword(id, password) {
        const [result] = await pool.execute(
            `UPDATE employees SET password = ? WHERE id = ? AND deleted_at IS NULL`,
            [password, id]
        );
        return result.affectedRows > 0;
    }

    /* =========================
       SOFT DELETE
    ========================== */
    static async delete(id) {
        const [result] = await pool.execute(
            `UPDATE employees SET deleted_at = NOW() WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    /* =========================
   STATUS TOGGLE
========================== */
    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            `UPDATE employees SET status = ? WHERE id = ? AND deleted_at IS NULL`,
            [status, id]
        );
        return result.affectedRows > 0;
    }


    
}
