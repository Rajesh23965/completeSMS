import pool from "../../config/database.js";

export default class ParentModel {


    static async create(data) {
        const query = `
      INSERT INTO parents (
        name, relation, father_name, mother_name, occupation, 
        income, education, city, state, mobile_no, email, address, 
        profile_image, username, password, 
        facebook_url, twitter_url, linkedin_url
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Map the incoming data to the query values
        // Ensure optional fields send NULL if they are undefined or empty
        const values = [
            data.name,
            data.relation,
            data.father_name || null,
            data.mother_name || null,
            data.occupation,
            data.income || 0, // Default to 0 if empty
            data.education || null,
            data.city || null,
            data.state || null,
            data.mobile_no,
            data.email || null,
            data.address || null,
            data.profile_image || null,
            data.username,
            data.password,
            data.facebook_url || null,
            data.twitter_url || null,
            data.linkedin_url || null
        ];


        const [result] = await pool.execute(query, values);
        return result.insertId;

    }

    static async findAll(limit = 10, offset = 0) {
        const query = `
        SELECT id, name, relation, occupation, mobile_no, email, city, profile_image, status
        FROM parents
        ORDER BY id DESC
        LIMIT ? OFFSET ?`;

        const [rows] = await pool.query(query, [parseInt(limit), parseInt(offset)]);
        return rows;
    }

    static async findById(id) {
        const query = "SELECT * FROM parents WHERE id = ?";
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    static async findByUsername(username) {
        const query = " SELECT * FROM parents WHERE username = ?";
        const [rows] = await pool.execute(query, [username]);
        return rows[0];
    }

    static async update(id, data) {
        const fields = [];
        const value = [];

        const allowedColumns = [
            'name', 'relation', 'father_name', 'mother_name', 'occupation',
            'income', 'education', 'city', 'state', 'mobile_no', 'email', 'address',
            'profile_image', 'username', 'password', 'facebook_url', 'twitter_url', 'linkedin_url', 'status'
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedColumns.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return false;

        value.push(id);
        const query = `UPDATE parents SET ${fields.join(', ')} WHERE id = ?`;

        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const query = "DELETE FROM parents WHERE id = ?";
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

}
