
import DesignationModel from "../../models/Employee/designation.model.js";
import ejs from "ejs";
import path from "path";

export default class DesignationController {

    /* ---------------------------------
       Render Designation Page
    --------------------------------- */
    static async renderDesignation(req, res) {
        try {
            const designations = await DesignationModel.findAll();

            const formPath = path.join(
                process.cwd(),
                "views",
                "employee",
                "designation.ejs"
            );


            const formHtml = await ejs.renderFile(formPath, {
                designations
            });

            res.render("dashboard", {
                pageTitle: "Employee",
                pageIcon: "fa-building",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Designation" }
                ],
                body: formHtml
            });

        } catch (err) {
            console.error("Error rendering designation UI:", err);
            res.status(500).send("Error rendering designation UI");
        }
    }

    /* ---------------------------------
       Create Designation
    --------------------------------- */
    static async addDesignation(req, res) {
        try {
            const { designation_name } = req.body;

            if (!designation_name) {
                return res.json({
                    success: false,
                    message: "Designation name is required"
                });
            }

            await DesignationModel.create({ designation_name });

            return res.json({
                success: true,
                message: "Designation added successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    /* ---------------------------------
       Update Designation
    --------------------------------- */
    static async updateDesignation(req, res) {
        try {
            const { id, designation_name } = req.body;

            if (!id || !designation_name) {
                return res.json({
                    success: false,
                    message: "Invalid request"
                });
            }

            const updated = await DesignationModel.update(id, {
                designation_name
            });

            if (!updated) {
                return res.json({
                    success: false,
                    message: "Update failed"
                });
            }

            return res.json({
                success: true,
                message: "Designation updated successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    /* ---------------------------------
       Delete Designation (Soft Delete)
    --------------------------------- */
    static async deleteDesignation(req, res) {
        try {
            const { id } = req.params;

            await DesignationModel.delete(id);

            return res.json({
                success: true,
                message: "Designation deleted successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
}
