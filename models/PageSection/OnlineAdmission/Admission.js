import pool from "../../../config/database.js";


export class OnlineAdmission {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM online_admission LIMIT 1");
        const onAdmission = rows[0] || null;

        if (onAdmission) {
            const [admissionFee] = await pool.query(
                "SELECT * FROM online_admission_fee WHERE online_admission_id = ? ORDER BY id ASC",
                [onAdmission.id]
            );
            onAdmission.admissionFee = admissionFee;
        }

        return onAdmission;
    }

    static async save(data) {

        let onAdId = data.id;

        if (onAdId) {
            await pool.query(
                `UPDATE online_admission SET title = ?, description = ?, terms_con_title = ?, terms_con_description = ? WHERE id = ?`,
                [data.title, data.description, data.terms_con_title, data.terms_con_description, onAdId]
            );
        } else {
            const [result] = await pool.query(
                `INSERT INTO online_admission (title, description, terms_con_title, terms_con_description) VALUES(?,?,?,?)`,
                [data.title, data.description, data.terms_con_title, data.terms_con_description]
            );
            onAdId = result.insertId;
        }

        await OnlineAdmission.saveOnAdFee(onAdId, data.admissionFee);

        return onAdId;
    }

    static async saveOnAdmissionFee(onAdId, admissionFee = []) {
        await pool.query("DELETE FROM online_admission_fee  WHERE online_admission_id = ?", [onAdId]);

        //Insert new ones
        for (const fee of admissionFee) {
            await pool.query(
                `INSERT INTO online_admission_fee (online_admission_id, status, class, amount) VALUES (?,?,?,?)`,
                [onAdId, fee.status, fee.class, fee.amount]
            );
        }
    }
}