import { ServiceModel } from "../../models/PageSection/Service/Service.js";

/* Render Service */
export const renderServiceUI = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Service",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="service-tabs service-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="serviceListTab" class="section-title active-tab"><i class="fa fa-list"></i> Service List</a>
          <a href="#" id="serviceCreateTab" class="section-title"><i class="far fa-edit"></i> Add Service/ Edit Service</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="serviceListContainer" class="content-container"></div>
        <div id="serviceFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering service form:", err);
        res.status(500).send("Error rendering service form");
    }
};


export const ServiceController = {
    async save(req, res) {

        try {
            const data = req.body;

            await ServiceModel.save(data);

            res.status(201).json({ success: true, message: "Service saved successfully" });
        } catch (error) {
            console.error("Error saving service", error);
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            const {
                services,
                totalPages,
                currentPage,
                currentLimit,
                currentSearch,
                hasNextPage,
                hasPreviousPage
            } = await ServiceModel.getAll(page, limit, search);

            res.render("frontend/services/serviceList.ejs", {
                service:services,
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
            console.error("Error fetching service list:", error);
            res.status(500).send("Error fetching list");
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const service = await ServiceModel.getById(id);
            res.render("frontend/services/serviceUI", {
                service
            });
        } catch (error) {
            console.error("Error loading service update from: ", error);
            res.status(500).send("Error loading service update form");
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await ServiceModel.delete(id);
            res.json({ success: true, message: "service deleted successfully" });
        } catch (error) {
            console.error("Error deleting service", error);
            res.status(500).json({ success: false, message: "Error deleting service" });
        }
    },
}
