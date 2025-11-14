import MenuModel from "../../models/Menue/menue.js";
import path from "path";
import ejs from "ejs";
import { MenuCategory } from "../../models/Menue/menuCategory.js";


export const MenuController = {

  // Create or Update menu
  async save(req, res) {
    try {
      const menuData = req.body;
      let result;

      if (menuData.id) {
        // Update existing menu
        result = await MenuModel.update(menuData.id, menuData);
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Menu not found" });
        }
      } else {
        // Create new menu
        result = await MenuModel.save(menuData);
      }

      res.json({ success: true, message: "Menu saved successfully", result });
    } catch (error) {
      console.error("Save menu error:", error);
      res.status(500).json({ success: false, message: "Failed to save menu" });
    }
  },


  async update(req, res) {
    try {
      const id = req.params.id;
      const menuData = req.body;

      const result = await MenuModel.update(id, menuData);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Menu not found" });
      }

      res.json({ success: true, message: "Menu updated successfully", result });
    } catch (error) {
      console.error("Update menu error:", error);
      res.status(500).json({ success: false, message: "Failed to update menu" });
    }
  },

  async togglePublish(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "Menu ID is required" });
      }

      await MenuModel.togglePublish(id);

      res.json({
        success: true,
        message: `Menu publish status toggled successfully for ID ${id}`
      });
    } catch (error) {
      console.error("Toggle publish error:", error);
      res.status(500).json({ success: false, message: "Failed to toggle publish status" });
    }
  }
  ,

  // Get all menus
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const menus = await MenuModel.getAll(page, limit);
      res.json({
        success: true,
        message: "Menue found",
        result: menus.rows,
        pagination: {
          page: menus.currentPage,
          totalPages: menus.totalPages,
          hasNextPage: menus.currentPage < menus.totalPages,
          hasPreviousPage: menus.currentPage > 1
        }
      });
    } catch (error) {
      console.error("Get all menus error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch menus" });
    }
  },
  // controllers/MenueController/menueController.js
  async getAllHierarchical(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const menus = await MenuModel.getAllHierarchical(page, limit);

      res.json({
        success: true,
        result: menus.rows,
        pagination: {
          page: menus.currentPage,
          totalPages: menus.totalPages,
          hasNextPage: menus.currentPage < menus.totalPages,
          hasPreviousPage: menus.currentPage > 1
        }
      });
    } catch (error) {
      console.error("Get hierarchical menus error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch hierarchical menus" });
    }
  },


  //Search
  async search(req, res) {
    try {
      const searchQuery = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!searchQuery) {
        return res.status(400).json({ success: false, message: "Search query is required." });
      }

      const menus = await MenuModel.search(searchQuery, page, limit);

      res.json({
        success: true,
        message: `Menus found for search: '${searchQuery}'`,
        result: menus.rows,
        pagination: {
          page: menus.currentPage,
          totalPages: menus.totalPages,
          hasNextPage: menus.currentPage < menus.totalPages,
          hasPreviousPage: menus.currentPage > 1
        }
      });
    } catch (error) {
      console.error("Search menus error:", error);
      res.status(500).json({ success: false, message: "Failed to search menus" });
    }
  },

  // Get menu by ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      const menu = await MenuModel.getById(id);

      if (!menu) {
        return res.status(404).json({ success: false, message: "Menu not found" });
      }

      res.json({ success: true, data: menu });
    } catch (error) {
      console.error("Get menu by ID error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch menu" });
    }
  },

  // Delete menu
  async delete(req, res) {
    try {
      const id = req.params.id;
      const result = await MenuModel.delete(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Menu not found" });
      }

      res.json({ success: true, message: "Menu deleted successfully" });
    } catch (error) {
      console.error("Delete menu error:", error);
      res.status(500).json({ success: false, message: "Failed to delete menu" });
    }
  }
};

/* Render Menu Form */
export const renderMenuForm = async (req, res) => {
  try {
    res.render("dashboard", {
      pageTitle: "Menu",
      pageIcon: "fa-bars",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Menu" }
      ],
      body: `
        <div class="menu-tabs menue-form ">
          <a href="#/list" id="menuListTab" class="section-title"><i class="fa fa-list"></i> Menu List</a>
          <a href="#/create" id="menuCreateTab" class="section-title"><i class="fa fa-plus"></i> Add Menu</a>
          <a href="#/category-create" id="menuCategoryCreateTab" class="section-title"><i class="fa fa-tags"></i> Add Menu Category</a>
          <a href="#/cate-list" id="menuCatListTab" class="section-title"><i class="fa fa-list"></i> Menu Category List</a>
        </div>

        <!-- Containers -->
        <div id="menuListContainer" class="hidden"></div>
        <div id="menuFormContainer" class="hidden"></div>
        <div id="menuCateListContainer" class="hidden"></div>
        <div id="menuCategoryFormContainer" class="hidden"></div>

        <script src="/js/mainMenue.js"></script>
      `
    });
  } catch (err) {
    console.error("Error rendering menu form:", err);
    res.status(500).send("Error rendering menu form");
  }
};


/* Save Menu Form */
export const saveMenuForm = async (req, res) => {
  try {
    let menuData = req.body;

    // Convert checkboxes/toggles properly
    menuData.publish = menuData.publish ? "Enable" : "Disable";
    menuData.target_new_window = menuData.target_new_window ? 1 : 0;
    menuData.external_url = menuData.external_url ? 1 : 0;

    // Save to DB
    await MenuModel.save(menuData);

    // Fetch fresh list for parent menu dropdown
    const menus = await MenuModel.getAll();

    res.render("dashboard", {
      pageTitle: "Menu",
      pageIcon: "fa-bars",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Menu" }
      ],
      body: await ejs.renderFile(
        path.join(process.cwd(), "views/frontend/partials/menuForm.ejs"),
        { menu: {}, menus }
      ),
      message: "Menu saved successfully!"
    });
  } catch (error) {
    console.error("Error saving menu:", error);

    const menus = await MenuModel.getAll();

    // Re-render with user input + error message
    res.status(500).render("dashboard", {
      pageTitle: "Menu",
      pageIcon: "fa-bars",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Menu" }
      ],
      body: await ejs.renderFile(
        path.join(process.cwd(), "views/frontend/partials/menuForm.ejs"),
        { menu: req.body, menus }
      ),
      message: "Error saving menu: " + error.message
    });
  }
};


/* Get Menu Form Partial */
export const getMenuForm = async (req, res) => {
  try {
    const id = req.query.id;
    let menu = {};
    let editing = false;

    if (id) {
      menu = await MenuModel.getById(id);
      editing = true;
    }

    const menus = await MenuModel.getAllForDropdown();

    res.render("frontend/partials/menuForm", { menu, menus, editing });
  } catch (error) {
    console.error("Error getting menu form:", error);
    res.status(500).send("Error loading menu form");
  }
};


//Menu Category



/**
 * Save or update menu category
 */
export const saveMenuCategory = async (req, res) => {
  try {
    const { menu_id, menu_category_title, menu_category_slug, menu_category_url, position, status } = req.body;

    const result = await MenuCategory.save({
      menu_id,
      menu_category_title,
      menu_category_slug,
      menu_category_url,
      position,
      status
    });

    res.json({
      success: true,
      message: "Menu category saved successfully",
      result
    });
  } catch (error) {
    console.error("Error saving menu category:", error);
    res.status(500).json({ success: false, message: "Error saving menu category" });
  }
}

//Update Menu Category
export const updateMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_id, menu_category_title, menu_category_url, position, status } = req.body;

    const result = await MenuCategory.update(id, {
      menu_id,
      menu_category_title,
      menu_category_url,
      position,
      status
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Menu category not found" });
    }

    res.json({
      success: true,
      message: "Menu category updated successfully",
      result
    });
  } catch (error) {
    console.error("Error updating menu category:", error);
    res.status(500).json({ success: false, message: "Error updating menu category" });
  }
};



export const toggleStatus = async (req, res) => {

  try {
    const { id } = req.params;
    const result = await MenuCategory.togglePublish(id);
    res.json({ success: true, message: "Category status updated", result });
  } catch (err) {
    console.error("Toggle publish error:", err);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
}


export const getAll = async (req, res) => {
  try {
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;

    const data = await MenuCategory.getAll();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error("GetAll error:", err);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
}

// 
export const getAllCatHierarchical = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const menus = await MenuCategory.getAllCatHierarchical(page, limit);

    res.json({
      success: true,
      result: menus.rows,
      pagination: {
        page: menus.currentPage,
        totalPages: menus.totalPages,
        hasNextPage: menus.currentPage < menus.totalPages,
        hasPreviousPage: menus.currentPage > 1
      }
    });
  } catch (error) {
    console.error("Get hierarchical menus error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hierarchical menus" });
  }
}

/**
 * Get all categories for a menu
 */
export const getByMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    const categories = await MenuCategory.getByMenu(menuId);

    res.json({
      success: true,
      result: categories
    });
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    res.status(500).json({ success: false, message: "Error fetching menu categories" });
  }
}


export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await MenuCategory.delete(id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

