import { GalleryCatModel } from "../../models/PageSection/Gallery/GalleryCategory.js";


/* Render Gallery Category UI */
export const renderGalleryCatUI = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Frontend",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="gallery-cat-tabs gallery_cat-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="galleryCatListTab" class="section-title active-tab"><i class="fa fa-list"></i> Category List</a>
          <a href="#" id="galleryCatCreateTab" class="section-title"><i class="far fa-edit"></i> Add Category/ Edit Category</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="galleryCatListContainer" class="content-container"></div>
        <div id="galleryCatFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering gallery category form:", err);
        res.status(500).send("Error rendering gallery category form");
    }
};


export const GalleryCatController = {
    async save(req, res) {

        try {
            const data = req.body;

            await GalleryCatModel.save(data);

            res.status(201).json({ success: true, message: "Gallery category saved successfully" });
        } catch (error) {
            console.error("Error saving gallery category", error);
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            const {
                galleryCate,
                totalPages,
                currentPage,
                currentLimit,
                currentSearch,
                hasNextPage,
                hasPreviousPage
            } = await GalleryCatModel.getPaginated(page, limit, search);

            res.render("frontend/gallery/category/galleryCatList.ejs", {
                galleryCate,
                search: currentSearch,
                currentLimit,
                pagination: {
                    page: currentPage,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            });

        } catch (error) {
            console.error("Error fetching gallery category list:", error);
            res.status(500).send("Error fetching list");
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const galleryCat = await GalleryCatModel.getById(id);
            res.render("frontend/gallery/category/galleryCatUI", {
                galleryCat
            });
        } catch (error) {
            console.error("Error loading gallery category update form:", error);
            res.status(500).send("Error loading gallery category update form");
        }
    },


    async delete(req, res) {
        try {
            const id = req.params.id;
            await GalleryCatModel.delete(id);
            res.json({ success: true, message: "Gallery category deleted successfully" });
        } catch (error) {
            console.error("Error deleting gallery category", error);
            res.status(500).json({ success: false, message: "Error deleting Gallery category" });
        }
    },
}
