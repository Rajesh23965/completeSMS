import { json } from "express";
import { FeaturesSection } from "../../models/PageSection/Features/features.js";


/* Render Feature */
export const renderFeature = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Features",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="slider-tabs feature-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="featureListTab" class="section-title active-tab"><i class="fa fa-list"></i> Features List</a>
          <a href="#" id="featureCreateTab" class="section-title"><i class="far fa-edit"></i> Add Features/ Edit Features</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="featureListContainer" class="content-container"></div>
        <div id="featureFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering features form:", err);
        res.status(500).send("Error rendering features form");
    }
};


export const FeaturesController = {
    async save(req, res) {

        try {
            const data = req.body;

            await FeaturesSection.save(data);

            res.status(201).json({ success: true, message: "Features saved successfully" });
        } catch (error) {
            console.error("Error saving features", error);
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            const {
                features,
                totalPages,
                currentPage,
                currentLimit,
                currentSearch,
                hasNextPage,
                hasPreviousPage
            } = await FeaturesSection.getAll(page, limit, search);

            res.render("frontend/features/featuresList.ejs", {
                features,
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
            console.error("Error fetching features list:", error);
            res.status(500).send("Error fetching list");
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const feature = await FeaturesSection.getById(id);
            res.render("frontend/features/featuresUI", {
                feature
            });
        } catch (error) {
            console.error("Error loading features update from: ", error);
            res.status(500).send("Error loading features update form");
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await FeaturesSection.delete(id);
            res.json({ success: true, message: "Feature deleted successfully" });
        } catch (error) {
            console.error("Error deleting features", error);
            res.status(500).json({ success: false, message: "Error deleting features" });
        }
    },
}

