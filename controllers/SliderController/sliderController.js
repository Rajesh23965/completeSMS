import { SliderSection } from "../../models/Slider/slider.js";
// ejs and path imports are usually not needed in the controller if you are using Express's res.render

export const SliderController = {

  async save(req, res) {
    try {
      const data = req.body;

      if (Array.isArray(data.show_website)) {
        data.show_website = data.show_website[data.show_website.length - 1];
      }
      //handle uploaded photo
      if (req.files && req.files.photo && req.files.photo.length > 0) {
        data.photo = req.files.photo[0].filename;
      } else {
        data.photo = req.body.current_photo || null;
      }

      if (!data.title) {
        return res.status(400).json({ success: false, message: "Title is required." });
      }

      await SliderSection.save(data);

      res.status(200).json({ success: true, message: "Slider saved successfully" });

    } catch (error) {
      console.error("Error saving slider:", error);
      res.status(500).json({ success: false, message: "Error saving slider" });
    }
  },
 async list(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search ? req.query.search.trim() : "";

    const {
      sliders,
      totalPages,
      currentPage,
      currentLimit,
      currentSearch,
      hasNextPage,
      hasPreviousPage
    } = await SliderSection.getPaginated(page, limit, search);

    res.render("frontend/slider/sliderList", {
      sliders,
      search: currentSearch,
      currentLimit,
      pagination: {
        page: currentPage,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error("Error fetching slider list:", error);
    res.status(500).send("Error fetching slider list");
  }
},



  async edit(req, res) {
    try {
      const id = req.params.id;
      const slider = await SliderSection.getById(id);
      res.render("frontend/slider/sliderUI", { slider });
    } catch (error) {
      console.error("Error loading slider edit form:", error);
      res.status(500).send("Error loading slider edit form");
    }
  },

  async delete(req, res) {
    try {
      const id = req.params.id;
      await SliderSection.delete(id);
      res.json({ success: true, message: "Slider deleted successfully" });
    } catch (error) {
      console.error("Error deleting slider:", error);
      res.status(500).json({ success: false, message: "Error deleting slider" });
    }
  },

  async toggle(req, res) {
    try {
      const id = req.params.id;
      const newStatus = await SliderSection.toggleShow(id);
      res.json({ success: true, status: newStatus });
    } catch (error) {
      console.error("Error toggling slider:", error);
      res.status(500).json({ success: false, message: "Error toggling slider" });
    }
  },
}

/* Render Slider  */
export const renderSlider = async (req, res) => {
  try {

    res.render("dashboard", {
      pageTitle: "Slider",
      pageIcon: "fa-bars",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Frontend" }
      ],
      body: `
        <div class="slider-tabs slider-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="sliderListTab" class="section-title active-tab"><i class="fa fa-list"></i> Slider List</a>
          <a href="#" id="sliderCreateTab" class="section-title"><i class="far fa-edit"></i> Add Slider/ Edit Slider</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="sliderListContainer" class="content-container"></div>
        <div id="sliderFormContainer" class="content-container hidden"></div>
      `
    });
  } catch (err) {
    console.error("Error rendering slider form:", err);
    res.status(500).send("Error rendering slider form");
  }
};
