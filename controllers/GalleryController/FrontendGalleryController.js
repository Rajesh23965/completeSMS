import { GalleryModel } from "../../models/Gallery/galleryModel.js";
import { GalleryCatModel } from "../../models/PageSection/Gallery/GalleryCategory.js";



/* Render Service */
export const renderGalleryUI = async (req, res) => {
    try {
  const categories = await GalleryCatModel.getAll(); // Fetch categories
        
        res.render("dashboard", {
            pageTitle: "Frontend",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="gallery-tabs gallery-form ">
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


export const FrontendGalleryController = {
    async save(req, res) {

        try {
            const data = req.body;

                if (Array.isArray(data.show_website)) {
            // If it's an array, it means the checkbox was checked, sending ['Disable', 'Enable']
            data.show_website = data.show_website[1]; // Use 'Enable'
        } else if (data.show_website === 'Disable') {
            // If it's just 'Disable', it means the checkbox was unchecked
            // This is already the correct final value.
        } else {
            // Fallback for cases where it's missing (shouldn't happen with the hidden field)
            data.show_website = 'Disable'; 
        }
            if (req.files && req.files.thumbimage && req.files.thumbimage.length > 0) {
                data.thumbimage = req.files.thumbimage[0].filename;
            } else {
                data.thumbimage = req.body.current_thumbimage || null;
            }
            await GalleryModel.save(data);

            res.status(201).json({ success: true, message: "Gallery saved successfully" });
        } catch (error) {
            console.error("Error saving gallery ", error);
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            const {
                gallery,
                totalPages,
                currentPage,
                currentLimit,
                currentSearch,
                hasNextPage,
                hasPreviousPage
            } = await GalleryModel.getPaginated(page, limit, search);

            res.render("frontend/gallery/galleryList.ejs", {
                gallery,
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
            console.error("Error fetching gallery  list:", error);
            res.status(500).send("Error fetching list");
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const gallery = await GalleryModel.getById(id);
            const categories = await GalleryCatModel.getAll(); // Fetch categories
            res.render("frontend/gallery/galleryUI", {
                gallery,
                categories
            });
            
        } catch (error) {
            console.error("Error loading gallery  update form:", error);
            res.status(500).send("Error loading gallery  update form");
        }
    },


    async delete(req, res) {
        try {
            const id = req.params.id;
            await GalleryModel.delete(id);
            res.json({ success: true, message: "Gallery  deleted successfully" });
        } catch (error) {
            console.error("Error deleting gallery ", error);
            res.status(500).json({ success: false, message: "Error deleting Gallery " });
        }
    },


    async toggle(req, res) {
        try {
            const id = req.params.id;
            const newStatus = await GalleryModel.toggleShow(id);
            res.json({ success: true, status: newStatus });
        } catch (error) {
            console.error("Error toggling gallery:", error);
            res.status(500).json({ success: false, message: "Error toggling gallery" });
        }
    },
}
