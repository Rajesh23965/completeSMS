import BankAccountModel from "../../models/Employee/bankAccount.model.js";


export default class BankAccountController {

    /* =========================
       GET ALL BANK ACCOUNTS
    ========================== */
    static async getEmployeeBankAccounts(req, res) {
        try {
            const { id } = req.params;
            const bankAccounts = await BankAccountModel.getByEmployeeId(id);

            return res.status(200).json({
                success: true,
                data: bankAccounts
            });
        } catch (error) {
            console.error("Get Bank Accounts Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       CREATE BANK ACCOUNT
    ========================== */
    static async createBankAccount(req, res) {
        try {
            const { id } = req.params;
            const data = {
                ...req.body,
                employee_id: parseInt(id)
            };

            // Validate required fields
            const requiredFields = ['bank_name', 'account_holder_name', 'account_no', 'ifsc_code'];
            const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            // If no bank accounts exist, this becomes primary
            const accountCount = await BankAccountModel.countByEmployeeId(id);
            if (accountCount === 0) {
                data.is_primary = true;
            }

            const accountId = await BankAccountModel.create(data);

            return res.status(201).json({
                success: true,
                message: "Bank account added successfully",
                data: { id: accountId }
            });
        } catch (error) {
            console.error("Create Bank Account Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       UPDATE BANK ACCOUNT
    ========================== */
    static async updateBankAccount(req, res) {
        try {
            const { id, accountId } = req.params;
            const data = req.body;

            // Verify account belongs to employee
            const account = await BankAccountModel.getByEmployeeId(accountId, id);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: "Bank account not found"
                });
            }

            data.employee_id = parseInt(id);
            const updated = await BankAccountModel.update(accountId, data);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to update bank account"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Bank account updated successfully"
            });
        } catch (error) {
            console.error("Update Bank Account Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       DELETE BANK ACCOUNT
    ========================== */
    static async deleteBankAccount(req, res) {
        try {
            const { id, accountId } = req.params;

            // Verify account belongs to employee
            const account = await BankAccountModel.getByEmployeeId(accountId, id);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: "Bank account not found"
                });
            }

            // Check if it's primary
            if (account.is_primary) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete primary bank account. Set another as primary first."
                });
            }

            const deleted = await BankAccountModel.delete(accountId);

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to delete bank account"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Bank account deleted successfully"
            });
        } catch (error) {
            console.error("Delete Bank Account Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       SET AS PRIMARY ACCOUNT
    ========================== */
    static async setPrimaryAccount(req, res) {
        try {
            const { id, accountId } = req.params;

            // Verify account belongs to employee
            const account = await BankAccountModel.getByEmployeeId(accountId, id);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: "Bank account not found"
                });
            }

            await BankAccountModel.setAsPrimary(accountId, id);

            return res.status(200).json({
                success: true,
                message: "Primary bank account updated successfully"
            });
        } catch (error) {
            console.error("Set Primary Account Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }
}