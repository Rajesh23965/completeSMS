import express from "express";
import { getTestimonal, renderTestimonial, TestimonialController } from "../../controllers/Testimonial/testimonial.js";
import { testimonial } from "../../config/upload.js";

const router = express.Router();


// Render Testimonial 
router.get("/testimonial", renderTestimonial);

const uploadTestimonial = testimonial.fields([{ name: 'photo', maxCount: 1 }]);

// AJAX routes
router.get("/testimonial/testimonialList", TestimonialController.list);
router.get("/testimonial-data", getTestimonal);
router.get("/testimonial/testimonialUI", (req, res) => res.render("frontend/testimonial/testimonialUI", { testimonial: {} }));
router.get("/testimonial/edit/:id", TestimonialController.edit);
router.post("/testimonial/save", uploadTestimonial, TestimonialController.save);
router.delete("/testimonial/delete/:id", TestimonialController.delete);


export default router;
