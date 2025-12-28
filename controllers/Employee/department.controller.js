import DepartmentModel from "../../models/Employee/department.model.js";
import ejs from "ejs";
import path from "path";

export default class DepartmentController {

    /* ---------------------------------
       Render Department Page
    --------------------------------- */
    static async renderDepartment(req, res) {
        try {
            const departments = await DepartmentModel.findAll();

            const formPath = path.join(
                process.cwd(),
                "views",
                "employee",
                "department.ejs"
            );


            const formHtml = await ejs.renderFile(formPath, {
                departments
            });

            res.render("dashboard", {
                pageTitle: "Department",
                pageIcon: "fa-building",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Department" }
                ],
                body: formHtml
            });

        } catch (err) {
            console.error("Error rendering department UI:", err);
            res.status(500).send("Error rendering department UI");
        }
    }

    /* ---------------------------------
       Create Department
    --------------------------------- */
    static async addDepartment(req, res) {
        try {
            const { department_name } = req.body;

            if (!department_name) {
                return res.json({
                    success: false,
                    message: "Department name is required"
                });
            }

            await DepartmentModel.create({ department_name });

            return res.json({
                success: true,
                message: "Department added successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    /* ---------------------------------
       Update Department
    --------------------------------- */
    static async updateDepartment(req, res) {
        try {
            const { id, department_name } = req.body;

            if (!id || !department_name) {
                return res.json({
                    success: false,
                    message: "Invalid request"
                });
            }

            const updated = await DepartmentModel.update(id, {
                department_name
            });

            if (!updated) {
                return res.json({
                    success: false,
                    message: "Update failed"
                });
            }

            return res.json({
                success: true,
                message: "Department updated successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    /* ---------------------------------
       Delete Department (Soft Delete)
    --------------------------------- */
    static async deleteDepartment(req, res) {
        try {
            const { id } = req.params;

            await DepartmentModel.delete(id);

            return res.json({
                success: true,
                message: "Department deleted successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
}
