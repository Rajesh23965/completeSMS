import pool from "../../config/database.js";


export class GalleryUpload {
    static async getAll(page = 1, limit = 10, search = "") {
        try {
            limit = parseInt(limit) || 10;
            const offset = parseInt(page - 1) * limit;

            // Prepare the WHERE clause for searching
            let whereClause = "";
            const queryParams = [limit, offset]; // Default parameters for LIMIT and OFFSET

            if (search) {
                // Adjust parameters for the search term
                whereClause = "WHERE type LIKE ?"; // Assuming 'type' is a good column to search
                queryParams.unshift(`%${search}%`); // Add search term to the beginning
            }

            // Re-order parameters for the main query: [search?, LIMIT, OFFSET]
            const mainQueryParams = whereClause ? [queryParams[0], limit, offset] : [limit, offset];


            // 1. Get the total count of records (with search filter if applicable)
            const [countRows] = await pool.query(`
                SELECT COUNT(*) as total
                FROM gallery_upload
                ${whereClause}
            `, whereClause ? [queryParams[0]] : []);

            const totalRecords = countRows[0].total;
            const totalPages = Math.ceil(totalRecords / limit);

            // 2. Get the paginated data (with search filter if applicable)
            const [rows] = await pool.query(`
                SELECT *
                FROM gallery_upload
                ${whereClause}
                ORDER BY id DESC
                LIMIT ?
                OFFSET ?
            `, mainQueryParams);

            return {
                data: rows,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: limit,
                }
            };

        } catch (error) {
            console.error("Error fetching gallery data", error);
            // Re-throw or return an empty structure on error
            return {
                data: [],
                pagination: {
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: parseInt(page),
                    limit: parseInt(limit) || 10,
                }
            };
        }
    }

    static async getById(id) {
        const [rows] = await pool.query(`SELECT * FROM gallery_upload WHERE id = ?`, [id]);

        return rows[0] || null;
    }

    static async save(data) {
        if (data.id) {
            await pool.query(`
        UPDATE gallery_upload
        SET thumbimage = ?, type = ?, url = ? WHERE id  = ?
        `, [data.thumbimage, data.type, data.url, data.id]);
        } else {
            await pool.query(`
            INSERT INTO gallery_upload (thumbimage, type, url) VALUES (?,?,?)
            `, [data.thumbimage, data.type, data.url])
        }
    }

    static async delete(id) {
        await pool.query("DELETE FROM gallery_upload WHERE id = ?", [id])
    }
}