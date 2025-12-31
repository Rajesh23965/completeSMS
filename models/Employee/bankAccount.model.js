
import pool from "../../config/database.js";

export default class BankAccountModel {

    // Create new bank account
    static async create(data) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // If this is being set as primary, unset existing primary
            if (data.is_primary) {
                await connection.execute(
                    `UPDATE employee_bank_accounts 
                     SET is_primary = 0 
                     WHERE employee_id = ? AND deleted_at IS NULL`,
                    [data.employee_id]
                );
            }

            const query = `
                INSERT INTO employee_bank_accounts (
                    employee_id, bank_name, account_holder_name,
                    bank_branch, bank_address, ifsc_code,
                    account_no, is_primary
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                data.employee_id,
                data.bank_name,
                data.account_holder_name,
                data.bank_branch || null,
                data.bank_address || null,
                data.ifsc_code,
                data.account_no,
                data.is_primary ? 1 : 0
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

    // Update bank account
    static async update(id, data) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // If setting as primary, unset other primaries
            if (data.is_primary) {
                await connection.execute(
                    `UPDATE employee_bank_accounts 
                     SET is_primary = 0 
                     WHERE employee_id = ? AND id != ? AND deleted_at IS NULL`,
                    [data.employee_id, id]
                );
            }

            const fields = [];
            const values = [];

            const allowedFields = [
                'bank_name', 'account_holder_name', 'bank_branch',
                'bank_address', 'ifsc_code', 'account_no', 'is_primary'
            ];

            for (const [key, val] of Object.entries(data)) {
                if (allowedFields.includes(key) && val !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(val);
                }
            }

            if (fields.length === 0) {
                await connection.rollback();
                return false;
            }

            values.push(id);

            const query = `
                UPDATE employee_bank_accounts 
                SET ${fields.join(', ')} 
                WHERE id = ? AND deleted_at IS NULL
            `;

            const [result] = await connection.execute(query, values);

            await connection.commit();
            return result.affectedRows > 0;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Delete bank account (soft delete)
    static async delete(id) {
        const query = `
            UPDATE employee_bank_accounts 
            SET deleted_at = NOW() 
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    static async getBankAccounts(employeeId) {
        const query = `
        SELECT *
        FROM employee_bank_accounts
        WHERE employee_id = ? AND deleted_at IS NULL
        ORDER BY is_primary DESC, id ASC
    `;
        const [rows] = await pool.execute(query, [employeeId]);
        return rows;
    }

    static async getByEmployeeId(employeeId) {
        const query = `
            SELECT *
            FROM employee_bank_accounts
            WHERE employee_id = ? AND deleted_at IS NULL
            ORDER BY is_primary DESC, created_at DESC
        `;
        const [rows] = await pool.execute(query, [employeeId]);
        return rows;
    }

    static async getPrimaryAccount(employeeId) {
        const query = `
            SELECT *
            FROM employee_bank_accounts
            WHERE employee_id = ? AND is_primary = 1 AND deleted_at IS NULL
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [employeeId]);
        return rows[0];
    }

    // Set as primary account
    static async setAsPrimary(accountId, employeeId) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Unset all primary accounts for this employee
            await connection.execute(
                `UPDATE employee_bank_accounts 
                 SET is_primary = 0 
                 WHERE employee_id = ? AND deleted_at IS NULL`,
                [employeeId]
            );

            // Set this account as primary
            await connection.execute(
                `UPDATE employee_bank_accounts 
                 SET is_primary = 1 
                 WHERE id = ? AND employee_id = ? AND deleted_at IS NULL`,
                [accountId, employeeId]
            );

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Count bank accounts for employee
    static async countByEmployeeId(employeeId) {
        const query = `
            SELECT COUNT(*) as count
            FROM employee_bank_accounts
            WHERE employee_id = ? AND deleted_at IS NULL
        `;
        const [[result]] = await pool.execute(query, [employeeId]);
        return result.count;
    }
}