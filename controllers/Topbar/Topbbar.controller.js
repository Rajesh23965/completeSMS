import { Topbar } from "../../models/Topbar/topbar.model.js";
import { TopbarDate } from "../../models/Topbar/topbarDate.model.js";
import ejs from "ejs";
import path from "path";



export const renderTopbarUI = async (req, res) => {
    try {
        const topbarData = await Topbar.getAllAdmin();
        const topbarDateSettings = await TopbarDate.get(); // <--- Fetch date settings
        const formPath = path.join(process.cwd(), "views/frontend/partials/topbarUI.ejs");

        // Pass both sets of data to the EJS template
        const formHtml = await ejs.renderFile(formPath, {
            topbar: topbarData[0] || [],
            topbarDate: topbarDateSettings // <--- Pass date settings
        });

        res.render("dashboard", {
            pageTitle: "Topbar",
            pageIcon: "fa-cog",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Topbar" }
            ],
            body: formHtml
        });

    } catch (err) {
        console.error("Error rendering topbar:", err);
        res.status(500).send("Error rendering topbar");
    }
};

export const saveTopbar = async (req, res) => {
    try {
        const { id, type, section, position, order_no, visibility, device, text, icon, url, border, radius } = req.body;

        if (!text || !Array.isArray(text)) {
            return res.status(400).json({
                success: false,
                message: "No topbar items provided"
            });
        }



        for (let i = 0; i < text.length; i++) {
            if (!text[i]) continue;

            await Topbar.save({
                id: id && id[i] ? id[i] : null,
                type: type && type[i] ? type[i] : "custom",
                section: section && section[i] ? section[i] : 12,
                position: position && position[i] ? position[i] : "start",
                order_no: order_no && order_no[i] ? order_no[i] : 0,
                visibility: visibility && visibility[i] ? 1 : 0,
                device: device && device[i] ? device[i] : "both",
                text: text[i],
                icon: icon && icon[i] ? icon[i] : "",
                url: url && url[i] ? url[i] : "",
                border: border && border[i] ? border[i] : "",
                radius: radius && radius[i] ? radius[i] : ""
            });
        }

        return res.redirect("/frontend/topbar");

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to save topbar",
            error: err.message
        });
    }
};

export const getTopbarAdmin = async (req, res) => {
    try {
        const topbar = await Topbar.getAllAdmin();
        res.status(200).json({
            success: true,
            message: "Topbar successfully fetched",
            topbar: topbar
        })

    } catch (error) {
        console.error("Error fetching topbar", error);
        res.status(500).json({
            success: false,
            message: "Failed to get topbar",
            error: error.message
        })
    }
}

export const getTopbarWebSite = async (req, res) => {
    try {
        const topbar = await Topbar.getAllWebsite();
        res.status(200).json({
            success: true,
            message: "Topbar successfully fetched",
            topbar: topbar
        })

    } catch (error) {
        console.error("Error fetching topbar", error);
        res.status(500).json({
            success: false,
            message: "Failed to get topbar",
            error: error.message
        })
    }
}

export const deleteTopbar = async (req, res) => {
    try {
        const id = req.params.id;
        await Topbar.delete(id);
        res.status(200).json({ success: true, message: "Topbar item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete topbar", error: err.message });
    }
};

export const restore = async (req, res) => {
    try {
        const { id } = req.params;

        await Topbar.restore(id);

        res.json({
            success: true,
            message: "Topbar restored successfully"
        });

    } catch (error) {
        console.log("Restore Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export const getDeleted = async (req, res) => {
    try {
        const [data] = await Topbar.getDeleted();

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.log("GetDeleted Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export const updateVisibility = async (req, res) => {
    try {
        const { id, visibility } = req.body;

        // Validation
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required"
            });
        }

        // Convert true/false to 1/0
        const visibleValue = visibility ? 1 : 0;

        const result = await Topbar.updateVisibility(id, visibleValue);

        // If no rows updated → invalid ID
        if (result[0].affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Topbar item not found"
            });
        }

        res.json({ 
            success: true, 
            message: "Visibility updated successfully" 
        });

    } catch (err) {
        console.error("Visibility Update Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error updating visibility"
        });
    }
};


export class TopbarDateController {

    static async save(req, res) {
        try {
            await TopbarDate.save(req.body);
            res.redirect("/frontend/topbar");

        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Failed to save settings",
                error: err.message
            });
        }
    }

    static async get(req, res) {
        try {
            const settings = await TopbarDate.get();

            res.json({
                success: true,
                message: "Topbar date settings fetched",
                settings
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch settings",
                error: err.message
            });
        }
    }
}



