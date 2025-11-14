import { Settings } from "../../models/Setting/setting.js";
import ejs from "ejs";
import path from "path";


/*Save CMS settings*/
export const saveSettings = async (req, res) => {
  try {
    const settingData = req.body;

    if (req.files) {
      if (req.files["logo"]) {
        settingData.logo = "/uploads/" + req.files["logo"][0].filename;
      }
      if (req.files["fav_icon"]) {
        settingData.fav_icon = "/uploads/" + req.files["fav_icon"][0].filename;
      }
    }

    const result = await Settings.save(settingData);

    res.status(201).json({
      success: true,
      message: "Setting Saved Successfully",
      data: result
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save settings",
      error: error.message
    });
  }
};



/*Render settings form page*/
export const renderSettingsForm = async (req, res) => {
  try {
    const formPath = path.join(process.cwd(), "views/frontend/partials/settingsForm.ejs");
    const formHtml = await ejs.renderFile(formPath, { settings: req.settings || {} });

    res.render("dashboard", {
      pageTitle: "Settings",
      pageIcon: "fa-cog",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Settings" }
      ],
      body: formHtml
    });

  } catch (err) {
    console.error("Error rendering settings form:", err);
    res.status(500).send("Error rendering settings form");
  }
};

/*Handle form submission with file uploads*/
export const saveSettingsForm = async (req, res) => {
  try {
    let settingData = req.body;

    // Handle uploaded files
    if (req.files) {
      if (req.files["logo"]) {
        settingData.logo = "/uploads/" + req.files["logo"][0].filename;
      }
      if (req.files["fav_icon"]) {
        settingData.fav_icon = "/uploads/" + req.files["fav_icon"][0].filename;
      }
    }

    // Save data
    await Settings.save(settingData);

    // Fetch fresh settings after save
    const rows = await Settings.get();
    const settings = rows[0] || {};

    // Render the form again with updated values
    res.render("dashboard", {
      pageTitle: "Settings",
      pageIcon: "fa-cog",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Settings" }
      ],
      body: await ejs.renderFile(
        path.join(process.cwd(), "views/frontend/partials/settingsForm.ejs"),
        { settings }
      ),
      message: "Settings saved successfully!"
    });

  } catch (error) {
    console.error("Error saving settings:", error);

    // Re-render form with old values + error message
    res.status(500).render("dashboard", {
      pageTitle: "Settings",
      pageIcon: "fa-cog",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Settings" }
      ],
      body: await ejs.renderFile(
        path.join(process.cwd(), "views/frontend/partials/settingsForm.ejs"),
        { settings: req.body } // repopulate form with user input
      ),
      message: "Error saving settings: " + error.message
    });
  }
};


/*Handle form submission with file uploads */
export const saveSettingsAPI = async (req, res) => {
  try {
    const rows = await Settings.get();
    const current = rows[0] || {};

    // Start with current settings
    let settingData = { ...current, ...req.body };

    // Handle uploaded files
    if (req.files) {
      if (req.files["logo"]) {
        settingData.logo = "/uploads/settings/" + req.files["logo"][0].filename;
      }
      if (req.files["fav_icon"]) {
        settingData.fav_icon = "/uploads/settings/" + req.files["fav_icon"][0].filename;
      }
    }

    // Save data
    const result = await Settings.save(settingData);

    res.status(201).json({
      success: true,
      message: "Setting Saved Successfully",
      data: result
    });

  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save settings",
      error: error.message
    });
  }
};


/* Get CMS settings  */
export const getSettings = async (req, res) => {
  try {
    const rows = await Settings.get();
    const settings = rows[0] || {};
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message
    });
  }
};


/*Remove logo*/
export const removeLogo = async (req, res) => {
  try {
    // First get current settings to find the logo path
    const [rows] = await Settings.get();
    const currentSettings = rows[0];

    // Delete the physical file if it exists
    if (currentSettings && currentSettings.logo) {
      const filePath = path.join(process.cwd(), 'public', currentSettings.logo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove logo from database
    const result = await Settings.removeLogo();

    res.status(200).json({
      success: true,
      message: "Logo removed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error removing logo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove logo",
      error: error.message
    });
  }
};

/*Remove favicon*/
export const removeFavicon = async (req, res) => {
  try {
    // First get current settings to find the favicon path
    const [rows] = await Settings.get();
    const currentSettings = rows[0];

    // Delete the physical file if it exists
    if (currentSettings && currentSettings.fav_icon) {
      const filePath = path.join(process.cwd(), 'public', currentSettings.fav_icon);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove favicon from database
    const result = await Settings.removeFavicon();

    res.status(200).json({
      success: true,
      message: "Favicon removed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error removing favicon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove favicon",
      error: error.message
    });
  }
};
