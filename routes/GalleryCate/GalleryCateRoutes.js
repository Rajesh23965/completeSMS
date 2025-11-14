import express from "express";
import { renderGalleryCatUI, GalleryCatController } from "../../controllers/GalleryController/GalleryController.js";

const router = express.Router();


// Render Testimonial 
router.get("/gallery/category", renderGalleryCatUI);


// AJAX routes
router.get("/gallery/category/galleryCatList", GalleryCatController.list);
router.get("/gallery/category/galleryCatUI", (req, res) => res.render("frontend/gallery/category/galleryCatUI", { galleryCat: {} }));
router.get("/gallery/category/edit/:id", GalleryCatController.update);
router.post("/gallery/category/save",  GalleryCatController.save);
router.delete("/gallery/category/delete/:id", GalleryCatController.delete);


export default router;
