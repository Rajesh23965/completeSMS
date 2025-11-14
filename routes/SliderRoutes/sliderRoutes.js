import express from "express";
import { renderSlider, SliderController } from "../../controllers/SliderController/sliderController.js";
import { slider } from "../../config/upload.js";

const router = express.Router();

// Render Slider UI Page 
router.get("/slider", renderSlider);

const uploadSlider = slider.fields([{ name: 'photo', maxCount: 1 }]);

// AJAX routes
router.get("/slider/sliderList", SliderController.list);
router.get("/slider/sliderUI", (req, res) => res.render("frontend/slider/sliderUI", { slider: {} }));
router.get("/slider/edit/:id", SliderController.edit);
router.post("/slider/save",uploadSlider, SliderController.save);
router.delete("/slider/delete/:id", SliderController.delete);
router.put("/slider/toggle/:id", SliderController.toggle);

export default router;
