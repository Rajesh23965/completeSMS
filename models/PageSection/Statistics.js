import pool from "../../config/database.js";

export class HomeStatistics {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM home_statistics LIMIT 1");
        const homeStats = rows[0] || null;

        if (homeStats) {
            const [widgets] = await pool.query(
                "SELECT * FROM home_statistics_widgets WHERE home_statistics_id = ? ORDER BY id ASC",
                [homeStats.id]
            );
            homeStats.widgets = widgets;
        }

        return homeStats;
    }

    static async save(data) {
        let showWebsiteValue = Array.isArray(data.show_website)
            ? data.show_website.pop()
            : data.show_website;

        let homeStatsId = data.id;

        if (homeStatsId) {
            await pool.query(
                `UPDATE home_statistics 
         SET title=?, description=?, photo=?, title_text_color=?, description_text_color=?, show_website=? 
         WHERE id=?`,
                [
                    data.title,
                    data.description,
                    data.photo,
                    data.title_text_color,
                    data.description_text_color,
                    showWebsiteValue,
                    homeStatsId
                ]
            );
        } else {
            const [result] = await pool.query(
                `INSERT INTO home_statistics (title, description, photo, title_text_color, description_text_color, show_website) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    data.title,
                    data.description,
                    data.photo,
                    data.title_text_color,
                    data.description_text_color,
                    showWebsiteValue
                ]
            );
            homeStatsId = result.insertId;
        }

        // Manage widgets
        await HomeStatistics.saveWidgets(homeStatsId, data.widgets);

        return homeStatsId;
    }

    static async saveWidgets(homeStatsId, widgets = []) {
        // Clear old widgets
        await pool.query("DELETE FROM home_statistics_widgets WHERE home_statistics_id = ?", [homeStatsId]);

        // Insert new ones
        for (const w of widgets) {
            await pool.query(
                `INSERT INTO home_statistics_widgets (home_statistics_id, widget_title, widget_icon, statistics_type) 
         VALUES (?, ?, ?, ?)`,
                [homeStatsId, w.widget_title, w.widget_icon, w.statistics_type]
            );
        }
    }
}
