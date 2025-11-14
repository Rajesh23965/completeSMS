import express from "express";
import { deleteCategory, getAll, getAllCatHierarchical, getByMenu, getMenuForm, MenuController, renderMenuForm, saveMenuCategory, saveMenuForm, toggleStatus, updateMenuCategory } from "../../controllers/MenueController/menueController.js";

import MenuModel from "../../models/Menue/menue.js";
import pool from "../../config/database.js";

const router = express.Router();

// Form Pages
router.get("/menue", renderMenuForm);
router.post("/menus/save", saveMenuForm);
router.get("/partials/menuForm", getMenuForm);

// API Endpoints
router.post("/menus", MenuController.save);
router.get("/menus", MenuController.getAllHierarchical);
router.get("/menus/:id", MenuController.getById);
router.put("/menus/:id", MenuController.update);
router.delete("/menus/:id", MenuController.delete);
router.get('/search', MenuController.search);
router.patch("/menus/:id/toggle-publish", MenuController.togglePublish);

// Partials for AJAX/Frontend rendering
router.get("/partials/menuForm", async (req, res) => {
    const menus = await MenuModel.getAll();
    res.render("frontend/partials/menuForm", { menu: {}, menus });
});
router.get("/menus-hierarchical", MenuController.getAllHierarchical);

// Partials for AJAX/Frontend rendering
router.get("/partials/menuForm", async (req, res) => {
    try {
        const id = req.query.id;
        let menu = {};
        let editing = false;

        if (id) {
            menu = await MenuModel.getById(id);
            editing = true;
        }

        const menus = await MenuModel.getAllForDropdown(id);
        res.render("frontend/partials/menuForm", { menu, menus, editing });
    } catch (error) {
        console.error("Error getting menu form:", error);
        res.status(500).send("Error loading menu form");
    }
});

router.get("/partials/menuList", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const menus = await MenuModel.getAllWithParentNames(page, limit);
        res.render("frontend/partials/menuList", {
            menus: menus.rows,
            pagination: {
                page: menus.currentPage,
                totalPages: menus.totalPages,
                hasNextPage: menus.currentPage < menus.totalPages,
                hasPreviousPage: menus.currentPage > 1
            }
        });
    } catch (error) {
        console.error("Error getting menu list:", error);
        res.status(500).send("Error loading menu list");
    }
});

// Save or update menu category
router.post("/menu-category", saveMenuCategory);

// Get categories for a specific menu
router.get("/menu-category/:menuId", getByMenu);

// Show Menu Category Form (Add / Edit)
router.get("/partials/menuCategoryForm", async (req, res) => {
  try {
    const id = req.query.id;
    let category = {};
    let editing = false;

    if (id) {
      // fetch single category for editing
      const [rows] = await pool.query("SELECT * FROM menu_categories WHERE id = ?", [id]);
      if (rows.length > 0) {
        category = rows[0];
        editing = true;
      }
    }

    // Fetch menus for dropdown
    const [menus] = await pool.query("SELECT id, title FROM menus ORDER BY title ASC");

    // Render form like menuForm does
    res.render("frontend/partials/menuCategoryForm", { category, menus, editing });
  } catch (error) {
    console.error("Error loading category form:", error);
    res.status(500).send("Error loading menu category form");
  }
});

// routes/frontend/menuRoutes.js
router.get("/menus-simple", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, title FROM menus ORDER BY title ASC");
        res.json({ success: true, result: rows });
    } catch (error) {
        console.error("Error fetching simple menu list:", error);
        res.status(500).json({ success: false, message: "Error fetching menus" });
    }
});

router.patch("/menu-category/:id/toggle-status", toggleStatus);
router.get("/menu-category", getAll);
router.get("/menu/category", getAllCatHierarchical);
router.put("/menu-category/:id", updateMenuCategory);
router.delete("/menu-category/:id", deleteCategory);
export default router;
