import { GalleryUpload } from "../../models/Gallery/galleryUpload.js";



/* Render Gallery Upload UI */
export const renderGalleryUploadUI = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Frontend",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="gallery-upload-tabs gallery_upload-form ">
          <a href="#" id="galleryUploadListTab" class="section-title active-tab"><i class="fa fa-list"></i> Category List</a>
          <a href="#" id="galleryUploadCreateTab" class="section-title"><i class="far fa-edit"></i> Add Category/ Edit Category</a>
        </div>

        <div id="galleryUploadListContainer" class="content-container"></div>
        <div id="galleryUploadFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering gallery form:", err);
        res.status(500).send("Error rendering gallery form");
    }
};


export const GalleryUploadController = {
    async save(req, res) {

        try {
            const data = req.body;
            //handle uploaded photo
            if (req.files && req.files.thumbimage && req.files.thumbimage.length > 0) {
                data.thumbimage = req.files.thumbimage[0].filename;
            } else {
                data.thumbimage = req.body.current_thumbimage || null;
            }

            await GalleryUpload.save(data);

            res.status(201).json({ success: true, message: "Gallery  saved successfully" });
        } catch (error) {
            console.error("Error saving gallery", error);
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    },
    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            // 1. Call the consistent getAll method
            const { data: gallery, pagination } = await GalleryUpload.getAll(page, limit, search);

            // 2. Calculate pagination values for the view
            const hasNextPage = pagination.currentPage < pagination.totalPages;
            const hasPreviousPage = pagination.currentPage > 1;

            res.render("frontend/gallery/album/galleryCatList.ejs", {
                gallery,
                search: search, // Pass back the search term for the view
                currentLimit: limit,
                pagination: {
                    page: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            });

        } catch (error) {
            console.error("Error fetching gallery album list:", error);
            res.status(500).send("Error fetching list");
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const galleryUpload = await GalleryUpload.getById(id);

            if (!galleryUpload) {
                return res.status(404).json({ success: false, message: "Gallery item not found" });
            }
            res.json({ success: true, data: galleryUpload });

        } catch (error) {
            console.error("Error fetching gallery item by ID:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const galleryUpload = await GalleryUpload.getById(id);
            // The `galleryUploadUI` view likely expects a single object.
            res.render("frontend/gallery/album/galleryUploadUI", {
                galleryUpload
            });
        } catch (error) {
            console.error("Error loading gallery album update form:", error);
            res.status(500).send("Error loading gallery album update form");
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await GalleryUpload.delete(id);
            res.json({ success: true, message: "Gallery item deleted successfully" });
        } catch (error) {
            console.error("Error deleting gallery album", error);
            res.status(500).json({ success: false, message: "Error deleting Gallery item" });
        }
    },
}
