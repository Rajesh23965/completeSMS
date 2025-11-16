import express from "express";
import { renderGalleryUploadUI, GalleryUploadController } from "../../controllers/GalleryController/GalleryUploadController.js";
import { galleryUpload } from "../../config/upload.js";

const router = express.Router();

const uploadGalleryAlbum = galleryUpload.fields([{ name: 'thumbimage', maxCount: 1 }]);

router.post("/gallery/album", uploadGalleryAlbum, GalleryUploadController.save);

router.post("/gallery/album/content/:albumId", uploadGalleryAlbum, GalleryUploadController.save);


router.get('/gallery/album', renderGalleryUploadUI);

router.get("/gallery/album/galleryList", GalleryUploadController.list);

router.get("/gallery/album/galleryUploadUI", (req, res) => res.render("frontend/gallery/album/galleryUI", { gallery: {} }));


router.get('/gallery/album/edit/:id', GalleryUploadController.update);

router.delete("/gallery/album/:id", GalleryUploadController.delete);
router.delete("/gallery/album/content/:id", GalleryUploadController.delete); 

router.get('/gallery/album/:albumId', GalleryUploadController.renderAlbumContentUI);
router.get("/gallery/album/content/:albumId", GalleryUploadController.listAlbumContent); 
export default router;