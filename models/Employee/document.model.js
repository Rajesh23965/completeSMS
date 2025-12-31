import pool from "../../config/database.js";

export default class DocumentModel {

    // Create new document
    static async create(data) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const query = `
                INSERT INTO employee_documents (
                    employee_id, title, category,
                    document_type, document_file, remarks
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const values = [
                data.employee_id,
                data.title,
                data.category,
                data.document_type || null,
                data.document_file,
                data.remarks || null
            ];

            const [result] = await connection.execute(query, values);

            await connection.commit();
            return result.insertId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update document
    static async update(id, data) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const query = `
                UPDATE employee_documents 
                SET title = ?, category = ?, document_type = ?,
                    document_file = ?, remarks = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND deleted_at IS NULL
            `;

            const values = [
                data.title,
                data.category,
                data.document_type || null,
                data.document_file || null, // Handle cases where file might not be updated
                data.remarks || null,
                id
            ];

            const [result] = await connection.execute(query, values);

            await connection.commit();
            return result.affectedRows;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Delete employee documents (soft delete)
    static async delete(id) {
        const query = `
            UPDATE employee_documents 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows;
    }

    // Get all documents for an employee
    static async getDocuments(employeeId) {
        const query = `
            SELECT id, title, category, document_type, 
                   document_file, remarks,
                   created_at, updated_at
            FROM employee_documents
            WHERE employee_id = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.execute(query, [employeeId]);
        return rows;
    }

    // Get document by ID
    static async getById(id) {
        const query = `
            SELECT id, employee_id, title, category, document_type,
                   document_file, remarks,
                   created_at, updated_at
            FROM employee_documents
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    }

    // Get documents by employee ID (alias for getDocuments)
    static async getByEmployeeId(employeeId) {
        return await this.getDocuments(employeeId);
    }

    // Count documents by employee ID
    static async countByEmployeeId(employeeId) {
        const query = `
            SELECT COUNT(*) as count
            FROM employee_documents
            WHERE employee_id = ? AND deleted_at IS NULL
        `;
        const [[result]] = await pool.execute(query, [employeeId]);
        return result.count;
    }

    // Get document by file name (for duplicate check)
    static async getByFileName(documentFile) {
        const query = `
            SELECT id, employee_id, title
            FROM employee_documents
            WHERE document_file = ? AND deleted_at IS NULL
        `;
        const [rows] = await pool.execute(query, [documentFile]);
        return rows[0] || null;
    }

    // Get documents by category
    static async getByCategory(employeeId, category) {
        const query = `
            SELECT id, title, category, document_type,
                   document_file, remarks, created_at
            FROM employee_documents
            WHERE employee_id = ? AND category = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.execute(query, [employeeId, category]);
        return rows;
    }

    // Restore soft-deleted document
    static async restore(id) {
        const query = `
            UPDATE employee_documents 
            SET deleted_at = NULL
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows;
    }
}