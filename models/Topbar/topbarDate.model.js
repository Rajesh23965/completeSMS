import pool from "../../config/database.js";

export class TopbarDate {

    static async save({ showDate, language }) {

        const [rows] = await pool.query("SELECT * FROM topbar_date LIMIT 1");

        if (rows.length === 0) {

            return pool.query(
                "INSERT INTO topbar_date (showDate, language) VALUES (?, ?)",
                [showDate, language]
            );

        } else {

            return pool.query(
                "UPDATE topbar_date SET showDate=?, language=? WHERE id=?",
                [showDate, language, rows[0].id]
            );
        }
    }

    static async get() {
        const [rows] = await pool.query("SELECT * FROM topbar_date LIMIT 1");

        if (rows.length === 0) {

            await pool.query(
                "INSERT INTO topbar_date (showDate, language) VALUES (1, 'english')"
            );

            return {
                showDate: 1,
                language: "english",
            };
        }

        return rows[0];
    }
}
