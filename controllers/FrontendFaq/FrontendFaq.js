import { FrontendFaq } from "../../models/PageSection/FrontendFaq/FrontendFaq.js";

/* Render FrontendFaq */
export const renderFrontendFaqUI = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Faq",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="faq-tabs faq-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="faqListTab" class="section-title active-tab"><i class="fa fa-list"></i> Faq List</a>
          <a href="#" id="faqCreateTab" class="section-title"><i class="far fa-edit"></i> Add Faq/ Edit Faq</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="faqListContainer" class="content-container"></div>
        <div id="faqFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering faq form:", err);
        res.status(500).send("Error rendering faq form");
    }
};


export const FrontendFaqController = {
    async save(req, res) {

        try {
            const data = req.body;

            await FrontendFaq.save(data);

            res.status(201).json({ success: true, message: "Faq saved successfully" });
        } catch (error) {
            console.error("Error saving faq", error);
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            const {
                faq,
                totalPages,
                currentPage,
                currentLimit,
                currentSearch,
                hasNextPage,
                hasPreviousPage
            } = await FrontendFaq.getAll(page, limit, search);

            res.render("frontend/faq/faqList.ejs", {
                faq,
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
            console.error("Error fetching faq list:", error);
            res.status(500).send("Error fetching list");
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const faq = await FrontendFaq.getById(id);
            res.render("frontend/faq/faqUI", {
                faq
            });
        } catch (error) {
            console.error("Error loading faq update from: ", error);
            res.status(500).send("Error loading faq update form");
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await FrontendFaq.delete(id);
            res.json({ success: true, message: "faq deleted successfully" });
        } catch (error) {
            console.error("Error deleting faq", error);
            res.status(500).json({ success: false, message: "Error deleting faq" });
        }
    },
}
