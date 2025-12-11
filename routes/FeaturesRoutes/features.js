import express from "express";
import { renderFeature, FeaturesController, getall } from "../../controllers/FeaturesController/features.js";

const router = express.Router();

//Render Feature UI
router.get("/features", renderFeature);
router.get("/featires/getall",getall);
router.get("/features/featuresList", FeaturesController.list);
router.get("/features/featuresUI", (req, res) => res.render("frontend/features/featuresUI", { feature: {} }));
router.get("/features/edit/:id", FeaturesController.update);
router.post("/features/save", FeaturesController.save);
router.delete("/features/delete/:id", FeaturesController.delete);

export default router;