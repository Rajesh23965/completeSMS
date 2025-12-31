import pool from "../../config/database.js";

//To sort by these ASC / DESC
const ALLOWED_SORT_COLUMNS = {
    id: 'id',
    name: 'name',
    occupation: 'occupation',
    mobile_no: 'mobile_num',
    email: 'parent_email'
};

export default class ParentModel {

    //Create Parent
    static async create(data) {
        const query = `
      INSERT INTO parents (
        name, relation, father_name, mother_name, occupation, 
        income, education, city, state, mobile_num, parent_email, p_address, 
        profile_image, username, password, 
        p_facebook_url, p_twitter_url, p_linkedin_url
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Ensure optional fields send NULL if they are undefined or empty
        const values = [
            data.name,
            data.relation,
            data.father_name || null,
            data.mother_name || null,
            data.occupation,
            data.income || 0,
            data.education || null,
            data.city || null,
            data.state || null,
            data.mobile_num,
            data.parent_email || null,
            data.p_address || null,
            data.profile_image || null,
            data.username,
            data.password,
            data.p_facebook_url || null,
            data.p_twitter_url || null,
            data.p_linkedin_url || null
        ];


        const [result] = await pool.execute(query, values);
        return result.insertId;

    }

    // Find Parent
    static async findAll(
        limit = 25,
        offset = 0,
        search = '',
        sortBy = 'id',
        sortDir = 'ASC'
    ) {
        const column = ALLOWED_SORT_COLUMNS[sortBy] || 'id';
        const direction = sortDir === 'ASC' ? 'ASC' : 'DESC';

        let query = `
        SELECT id, name, relation, occupation, mobile_num, parent_email, city
        FROM parents
        WHERE status = 1
    `;

        const params = [];

        if (search) {
            query += `
            WHERE name LIKE ?
               OR mobile_num LIKE ?
               OR parent_email LIKE ?
        `;
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        query += ` ORDER BY ${column} ${direction} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    //Find Parent With Deactive ststud
    static async findDeactive(
        limit = 25,
        offset = 0,
        search = '',
        sortBy = 'id',
        sortDir = 'ASC'
    ) {
        const column = ALLOWED_SORT_COLUMNS[sortBy] || 'id';
        const direction = sortDir === 'ASC' ? 'ASC' : 'DESC';

        let query = `
    SELECT id, name, relation, occupation, mobile_num, parent_email, city
    FROM parents
    WHERE status = 0
`;

        const params = [];

        if (search) {
            query += `
        AND (
            name LIKE ?
            OR mobile_num LIKE ?
            OR parent_email LIKE ?
        )
    `;
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        query += ` ORDER BY ${column} ${direction} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    // Add count method for deactivated parents
    static async getDeactiveTotalCount(search = '') {
        let query = `
    SELECT COUNT(*) as total 
    FROM parents 
    WHERE status = 0
`;

        const params = [];

        if (search) {
            query += `
        AND (
            name LIKE ?
            OR mobile_num LIKE ?
            OR parent_email LIKE ?
        )
    `;
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        const [rows] = await pool.query(query, params);
        return rows[0].total;
    }

    // Count Number Of Parent 
    static async getTotalCount(search = '') {
        let query = `SELECT COUNT(*) as total FROM parents`;
        const params = [];

        if (search) {
            query += `
            WHERE name LIKE ?
               OR mobile_num LIKE ?
               OR parent_email LIKE ?
        `;
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        const [[result]] = await pool.query(query, params);
        return result.total;
    }

    //FInd By Id 
    static async findById(id) {
        const query = "SELECT * FROM parents WHERE id = ?";
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Find By Username
    static async findByUsername(username) {
        const query = " SELECT * FROM parents WHERE username = ?";
        const [rows] = await pool.execute(query, [username]);
        return rows[0];
    }

    //Update Parent Data
    static async update(id, data) {
        const fields = [];
        const values = [];

        const allowedColumns = [
            'name', 'relation', 'father_name', 'mother_name', 'occupation',
            'income', 'education', 'city', 'state', 'mobile_num', 'parent_email', 'p_address',
            'profile_image', 'username', 'p_facebook_url', 'p_twitter_url', 'p_linkedin_url', 'status'
        ];

        for (const [key, val] of Object.entries(data)) {
            if (
                allowedColumns.includes(key) &&
                val !== undefined &&
                val !== null
            ) {
                if (key === 'status') {
                    values.push(val ? 1 : 0);
                } else {
                    values.push(val);
                }
                fields.push(`${key} = ?`);
            }
        }

        if (fields.length === 0) return false;

        values.push(id);
        const query = `UPDATE parents SET ${fields.join(', ')} WHERE id = ?`;

        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    //Update Only Password with login active deactive 
    static async updatePassword(id, password, status = 1) {
        // If password is null/undefined for deactivated users, we need to handle it
        if (password === null || password === undefined) {
            // For deactivated users, we can set a placeholder or keep existing
            // Let's update only the status if no password is provided
            const query = `
        UPDATE parents
        SET status = ? 
        WHERE id = ?
        `;

            const [result] = await pool.execute(query, [
                status ? 1 : 0,
                id
            ]);

            return result.affectedRows > 0;
        } else {
            const query = `
        UPDATE parents
        SET password = ?, status = ? 
        WHERE id = ?
        `;

            const [result] = await pool.execute(query, [
                password,
                status ? 1 : 0,
                id
            ]);

            return result.affectedRows > 0;
        }
    }

    //Update Status In Bulk
    static async activateBulk(ids) {
        const placeholders = ids.map(() => '?').join(',');

        const query = `
        UPDATE parents
        SET status = 1
        WHERE id IN (${placeholders})
    `;

        await pool.execute(query, ids);
    }

    //Delete Parent Data
    static async delete(id) {
        const query = "DELETE FROM parents WHERE id = ?";
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

}
