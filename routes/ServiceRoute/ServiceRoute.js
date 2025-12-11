import express from "express";
import { getMainService, renderServiceUI, ServiceController } from "../../controllers/ServiceController/ServiceController.js";

const router = express.Router();

//Render Service UI
router.get("/services", renderServiceUI);


router.get("/services/serviceList", ServiceController.list);
router.get("/services/serviceUI", (req, res) => res.render("frontend/services/serviceUI", { service: {} }));
router.get("/services/edit/:id", ServiceController.update);
router.post("/services/save", ServiceController.save);
router.delete("/services/delete/:id", ServiceController.delete);
router.get("/service/getdata",getMainService);

export default router;