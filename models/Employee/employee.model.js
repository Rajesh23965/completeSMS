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

        // Fetch branch_name
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

        //  AUTO GENERATE STAFF ID
        const staffId = await this.generateUniqueStaffId();

        const query = `
        INSERT INTO employees (
            staffId, name, role, gender, date_of_birth,
            religion, blood_group,
            mobile_number, email,
            present_address, permanent_address,
            joining_date, designation_id, department_id,
            qualification, experience_details, total_experience,
            profile_picture,
            username, password,
            facebook_url, twitter_url, linkedin_url,
            bank_name, account_holder_name, bank_branch,
            bank_address, ifsc_code, account_no,
            branch_name, status
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
            data.email || null,
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
            data.facebook_url || null,
            data.twitter_url || null,
            data.linkedin_url || null,
            data.bank_name || null,
            data.account_holder_name || null,
            data.bank_branch || null,
            data.bank_address || null,
            data.ifsc_code || null,
            data.account_no || null,
            branchName,
            1 // status active
        ];

        const [result] = await pool.execute(query, values);

        return {
            id: result.insertId,
            staffId
        };
    }


    /* =========================
       FIND ALL (ACTIVE)
    ========================== */

    static async findAll(
        limit = 25,
        offset = 0,
        search = "",
        sortBy = "id",
        sortDir = "ASC",
        roles = []
    ) {
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
            e.email,
            e.branch_name,
            d.designation_name,
            dp.department_name,
            e.joining_date,
            e.profile_picture
        FROM employees e
        JOIN designations d ON e.designation_id = d.id
        JOIN departments dp ON e.department_id = dp.id
        WHERE e.deleted_at IS NULL
    `;

        const params = [];

        // Role filtering
        if (roles && roles.length > 0) {
            query += ` AND e.role IN (${roles.map(() => '?').join(',')})`;
            params.push(...roles);
        }

        // Search filtering
        if (search) {
            query += `
        AND (
            e.staffId LIKE CONCAT(?, '%')
            OR e.name LIKE CONCAT('%', ?, '%')
            OR e.mobile_number LIKE CONCAT(?, '%')
            OR e.email LIKE CONCAT('%', ?, '%')
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
       GET TOTAL COUNT with Role Filtering
    ========================== */
    static async getTotalCount(search = "", roles = []) {
        let query = `
        SELECT COUNT(*) AS total
        FROM employees e
        WHERE e.deleted_at IS NULL
    `;

        const params = [];

        // Role filtering
        if (roles && roles.length > 0) {
            query += ` AND e.role IN (${roles.map(() => '?').join(',')})`;
            params.push(...roles);
        }

        // Search filtering
        if (search) {
            query += `
            AND (
                e.staffId LIKE ?
                OR e.name LIKE ?
                OR e.mobile_number LIKE ?
                OR e.email LIKE ?
            )
        `;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        const [[row]] = await pool.query(query, params);
        return row.total;
    }


    /* =========================
       FIND DEACTIVATED
    ========================== */
    static async findDeactive(limit = 25, offset = 0, search = "") {
        let query = `
            SELECT id, staffId, name, mobile_number, email
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
                    OR email LIKE ?
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
    static async getTotalCount(search = "") {
        let query = `
            SELECT COUNT(*) AS total
            FROM employees
            WHERE deleted_at IS NULL
        `;

        const params = [];

        if (search) {
            query += `
                AND (
                    staffId LIKE ?
                    OR name LIKE ?
                    OR mobile_number LIKE ?
                    OR email LIKE ?
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
                    OR email LIKE ?
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
            `SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL`,
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
            "staffId",
            "name", "role", "gender", "date_of_birth",
            "religion", "blood_group",
            "mobile_number", "email",
            "present_address", "permanent_address",
            "joining_date", "designation_id", "department_id",
            "qualification", "experience_details", "total_experience",
            "profile_picture",
            "facebook_url", "twitter_url", "linkedin_url",
            "bank_name", "account_holder_name",
            "bank_branch", "bank_address",
            "ifsc_code", "account_no",
            "branch_name",
            "status"
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedColumns.includes(key) && value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (!fields.length) return false;

        values.push(id);

        const [result] = await pool.execute(
            `UPDATE employees SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        return result.affectedRows > 0;
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
