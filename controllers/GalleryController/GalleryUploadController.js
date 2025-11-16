import { GalleryUpload } from "../../models/Gallery/galleryUpload.js";
const getUploadModalHTML = (albumId) => `
    <div class="modal fade" id="uploadMediaModal" tabindex="-1" aria-labelledby="uploadMediaModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="uploadMediaModalLabel">Upload Media to Album</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                
                <div class="modal-body">
                <form id="mediaUploadForm" action="/frontend/gallery/album/content/${albumId}" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="album_id" value="${albumId}">
                <input type="hidden" name="id" id="mediaItemId">
                
                <div class="mb-3">
                <label for="mediaType" class="form-label fw-bold">Type <span class="text-danger">*</span></label>
                <select class="form-select" id="mediaType" name="type" required>
                <option value="Photo">Photo</option>
                <option value="Video URL">Video URL</option>
                </select>
                </div>
                
                <div id="videoUrlSection" class="mb-3 hidden">
                           <label for="videoUrl" class="form-label fw-bold">Video Url <span class="text-danger">*</span></label>
                           <input type="url" class="form-control" id="videoUrl" name="url" placeholder="eg: https://www.youtube.com/watch?v=xxxx-xx">
                       </div>
                       
                        <div id="thumbUploadSection" class="mb-3">
                            <label for="thumbImageInput" class="form-label fw-bold">Thumb Image <span class="text-danger">*</span></label>
                            <div id="thumbDropArea" class="border rounded p-4 text-center mb-3" style="border-style: dashed!important; background-color: #f8f9fa;">
                                <div id="thumbImagePreview" class="mb-2">
                                    <i class="fas fa-cloud-upload-alt fa-3x text-secondary mb-2"></i>
                                    <p class="mb-1 text-secondary">Drag and drop a file here or click</p>
                                </div>
                                <input type="file" id="thumbImageInput" name="thumbimage" accept="image/*" required class="d-none">
                            </div>
                            <input type="hidden" name="current_thumbimage" id="currentThumbImage">
                        </div>


                        
                        <div class="text-end">
                            <button type="submit" class="btn btn-primary" id="uploadMediaBtn">
                                <i class="fas fa-upload me-2"></i> Upload
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
`;

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
    async renderAlbumContentUI(req, res) {
        try {
            const albumId = req.params.albumId;
            // Fetch album details to display in the header
            const albumDetails = await GalleryUpload.getById(albumId);

            res.render("dashboard", {
                // Renaming pageTitle to show Album Title (assuming GalleryUpload.getById returns album details in this context)
                pageTitle: `Album: ${albumDetails ? albumDetails.title || albumDetails.id : 'Content'}`,
                pageIcon: "fa-camera-retro",
                breadcrumbs: [
                    { title: "Dashboard", url: "/" },
                    { title: "Gallery", url: "/frontend/gallery/album" },
                    { title: "Album Content" }
                ],
                body: `
                      <div class="album-content-header mb-4 d-flex justify-content-between align-items-center">
                          <h3 class="m-0"><i class="fas fa-image me-2"></i> Album: ${albumDetails ? albumDetails.title || 'Content' : 'Content'}</h3>
                          <button id="addMediaBtn" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadMediaModal">
                              <i class="fas fa-plus me-2"></i> Upload
                          </button>
                      </div>
  
                      <div id="albumContentListContainer" class="content-container"></div>
  
                      ${getUploadModalHTML(albumId)}
                  `
            });
        } catch (err) {
            console.error("Error rendering album content UI:", err);
            res.status(500).send("Error rendering album content UI");
        }
    },

    async listAlbumContent(req, res) {
        try {
            const albumId = req.params.albumId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search ? req.query.search.trim() : "";

            // 1. Call the new method
            const { data: content, pagination } = await GalleryUpload.getContentByAlbumId(albumId, page, limit, search);

            // 2. Calculate pagination values for the view
            const hasNextPage = pagination.currentPage < pagination.totalPages;
            const hasPreviousPage = pagination.currentPage > 1;

            res.render("frontend/gallery/album/albumContentList.ejs", {
                content,
                albumId,
                search: search,
                currentLimit: limit,
                pagination: {
                    page: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            });
        } catch (error) {
            console.error("Error fetching album content list:", error);
            res.status(500).send("Error fetching album content list");
        }
    },




    async save(req, res) {
        try {
            const data = req.body;
            // Handle uploaded photo
            if (req.files && req.files.thumbimage && req.files.thumbimage.length > 0) {
                data.thumbimage = req.files.thumbimage[0].filename;
            } else {
                data.thumbimage = req.body.current_thumbimage || null;
            }

            // Ensure 'type' and 'url' are handled correctly (passed from the modal)
            if (data.type === 'Photo') {
                data.url = null; // Clear URL if photo is selected
            }

            await GalleryUpload.save(data);

            res.status(201).json({ success: true, message: "Gallery item saved successfully" });
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

            res.render("frontend/gallery/album/galleryList.ejs", {
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
