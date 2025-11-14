import express from "express";
import { renderFrontendFaqUI,FrontendFaqController } from "../../controllers/FrontendFaq/FrontendFaq.js";

const router = express.Router();


// Render Faq 
router.get("/faq", renderFrontendFaqUI);

// AJAX routes
router.get("/faq/faqList", FrontendFaqController.list);
router.get("/faq/faqUI", (req, res) => res.render("frontend/faq/faqUI", { faq: {} }));
router.get("/faq/edit/:id", FrontendFaqController.update);
router.post("/faq/save", FrontendFaqController.save);
router.delete("/faq/delete/:id", FrontendFaqController.delete);


export default router;
