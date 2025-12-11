import ParentModel from "../../models/Parents/parents.model.js";
import bcrypt from "bcrypt";
import ejs from "ejs";
import path from "path";


export default class ParentController {

      static async renderAddParentForm(req, res) {
        try {
            // 1. Locate the partial view
            const formPath = path.join(process.cwd(), "views", "parents", "add.ejs");

            // 2. Render the partial (the form) into a string
            // We pass empty object {} if no data is needed initially
            const formHtml = await ejs.renderFile(formPath, {});

            // 3. Render the main 'dashboard' layout and inject the formHtml into 'body'
            res.render("dashboard", {
                pageTitle: "Add Parent",
                pageIcon: "fa-user-plus", // Changed icon to match context
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Parent", url: "/parents" },
                    { title: "Add Parent" }
                ],
                body: formHtml // This injects your add.ejs content into the dashboard
            });

        } catch (err) {
            console.error("Error rendering add parent ui:", err);
            res.status(500).send("Error rendering add parent ui");
        }
    }

    // 1. Create Parent
    static async addParent(req, res) {
        try {
            const { password, username } = req.body;

            // Basic Validation
            if (!username || !password) {
                return res.status(400).json({ success: false, message: "Username and Password are required" });
            }

            // Check for duplicate username
            const existingUser = await ParentModel.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({ success: false, message: "Username already exists" });
            }

            // Hash Password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Prepare data (Handle file upload path if multer is used)
            const parentData = {
                ...req.body,
                password: hashedPassword,
                profile_image: req.file ? req.file.path : null 
            };

            const newId = await ParentModel.create(parentData);

            return res.status(201).json({
                success: true,
                message: "Parent created successfully",
                data: { id: newId }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 2. Get All Parents
    static async getAllParents(req, res) {
        try {
            // Pagination logic
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const parents = await ParentModel.findAll(limit, offset);

            return res.status(200).json({
                success: true,
                data: parents,
                page: page,
                limit: limit
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 3. Get Single Parent
    static async getParentById(req, res) {
        try {
            const parent = await ParentModel.findById(req.params.id);

            if (!parent) {
                return res.status(404).json({ success: false, message: "Parent not found" });
            }

            // Remove password from response for security
            delete parent.password;

            return res.status(200).json({ success: true, data: parent });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 4. Update Parent
    static async updateParent(req, res) {
        try {
            const id = req.params.id;
            const updateData = { ...req.body };

            // If updating password, hash it first
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            // Handle file update
            if (req.file) {
                updateData.profile_image = req.file.path;
            }

            const isUpdated = await ParentModel.update(id, updateData);

            if (!isUpdated) {
                return res.status(404).json({ success: false, message: "Parent not found or no changes made" });
            }

            return res.status(200).json({ success: true, message: "Parent updated successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 5. Delete Parent
    static async deleteParent(req, res) {
        try {
            const isDeleted = await ParentModel.delete(req.params.id);

            if (!isDeleted) {
                return res.status(404).json({ success: false, message: "Parent not found" });
            }

            return res.status(200).json({ success: true, message: "Parent deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error" });
        }
    }
}


/* Render Service */
export const renderGalleryUI = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Add Parent",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Add Parent" }
            ],
            body: `
        <div class="-tabs gallery-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="galleryListTab" class="section-title active-tab"><i class="fa fa-list"></i> Gallery List</a>
          <a href="#" id="galleryCreateTab" class="section-title"><i class="far fa-edit"></i> Add Gallery/ Edit Gallery</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="galleryListContainer" class="content-container"></div>
        <div id="galleryFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering gallery form:", err);
        res.status(500).send("Error rendering gallery form");
    }
};
