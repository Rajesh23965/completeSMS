import { TestimonialModel } from "../../models/PageSection/Testimonial/Testimonial.js";

/* Render Testimonial  */
export const renderTestimonial = async (req, res) => {
    try {

        res.render("dashboard", {
            pageTitle: "Testimonial",
            pageIcon: "fa-bars",
            breadcrumbs: [
                { title: "Dashboard", url: "/" },
                { title: "Frontend" }
            ],
            body: `
        <div class="testimonial-tabs testimonial-form ">
          <!-- Tabs with style to look like links/buttons -->
          <a href="#" id="testimonialListTab" class="section-title active-tab"><i class="fa fa-list"></i> Testimonial List</a>
          <a href="#" id="testimonialCreateTab" class="section-title"><i class="far fa-edit"></i> Add Testimonial/ Edit Testimonial</a>
        </div>

        <!-- Containers where EJS partials will be loaded via AJAX -->
        <div id="testimonialListContainer" class="content-container"></div>
        <div id="testimonialFormContainer" class="content-container hidden"></div>
      `
        });
    } catch (err) {
        console.error("Error rendering testimonial form:", err);
        res.status(500).send("Error rendering testimonial form");
    }
};

export const TestimonialController = {

    async save(req, res) {
        try {
            const data = req.body;

            //handle uploaded photo
            if (req.files && req.files.photo && req.files.photo.length > 0) {
                data.photo = req.files.photo[0].filename;
            } else {
                data.photo = req.body.current_photo || null;
            }


            await TestimonialModel.save(data);

            res.status(200).json({ success: true, message: "Testimonial saved successfully" });

        } catch (error) {
            console.error("Error saving testimonial:", error);
            res.status(500).json({ success: false, message: "Error saving testimonial" });
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search ? req.query.search.trim() : "";

            const {
                testimonials,
                totalPages,
                currentPage,
                currentLimit,
                currentSearch,
                hasNextPage,
                hasPreviousPage
            } = await TestimonialModel.getPaginated(page, limit, search);

            res.render("frontend/testimonial/testimonialList", {
                testimonials,
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
            console.error("Error fetching testimonial list:", error);
            res.status(500).send("Error fetching testimonial list");
        }
    },



    async edit(req, res) {
        try {
            const id = req.params.id;
            const testimonial = await TestimonialModel.getById(id);
            res.render("frontend/testimonial/testimonialUI", { testimonial });
        } catch (error) {
            console.error("Error loading testimonial edit form:", error);
            res.status(500).send("Error loading testimonial edit form");
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await TestimonialModel.delete(id);
            res.json({ success: true, message: "Testimonial deleted successfully" });
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            res.status(500).json({ success: false, message: "Error deleting testimonial" });
        }
    },

}