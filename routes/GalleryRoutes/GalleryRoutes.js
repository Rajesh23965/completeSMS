import express from "express";
import { renderGalleryUI, FrontendGalleryController } from "../../controllers/GalleryController/FrontendGalleryController.js";
import { frontgallery } from "../../config/upload.js";
import { GalleryCatModel } from "../../models/PageSection/Gallery/GalleryCategory.js";

const router = express.Router();

//render Gallery UI
router.get("/gallery",renderGalleryUI);

const uploadGallery = frontgallery.fields([{name:'thumbimage', maxCount: 1}]);

router.get("/gallery/galleryList",FrontendGalleryController.list)
router.get("/gallery/galleryUI", async (req, res) => {
    const categories = await GalleryCatModel.getAll();
    res.render("frontend/gallery/galleryUI", { gallery: {}, categories });
});
router.post("/gallery",uploadGallery, FrontendGalleryController.save);

router.get('/gallery/edit/:id', FrontendGalleryController.update);

router.delete("/gallery/:id", FrontendGalleryController.delete);

router.put("/gallery/toggle/:id", FrontendGalleryController.toggle);

export default router;