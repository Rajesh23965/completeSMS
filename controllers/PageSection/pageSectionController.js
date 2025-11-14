//pageSectionController.js
import ejs from "ejs";
import path from "path";
import MenuModel from "../../models/Menue/menue.js";
import { MenuCategory } from "../../models/Menue/menuCategory.js";
import { WelcomeMessage } from "../../models/PageSection/WelcomeMessage.js";
import { Teachers } from "../../models/PageSection/Teachers.js";
import { HomeOptions } from "../../models/PageSection/HomeOptions.js";
import { HomeCta } from "../../models/PageSection/CallToActionSection.js";
import { HomeStatistics } from "../../models/PageSection/Statistics.js";
import { HomeServices } from "../../models/PageSection/HomeServices.js";
import { HomeTestimonial } from "../../models/PageSection/HomeTestimonial.js";
import { TeacherSection } from "../../models/PageSection/Teacher/TeacherSection.js";
import { EventsSection } from "../../models/PageSection/Event/EventsSection.js";
import { EventOptions } from "../../models/PageSection/Event/EventOptions.js";
import { AboutUsSectionAbout } from "../../models/PageSection/AboutUs/About.js";
import { AboutUsSectionSection } from "../../models/PageSection/AboutUs/Service.js";
import { AboutUsCta } from "../../models/PageSection/AboutUs/CTA.js";
import { AboutUsOptions } from "../../models/PageSection/AboutUs/AboutUsOptions.js";
import { FaqSectionFaq } from "../../models/PageSection/Faq/Faq.js";
import { FaqOptions } from "../../models/PageSection/Faq/Options.js";
import { OnlineAdmission } from "../../models/PageSection/OnlineAdmission/Admission.js";
import { GallerySection } from "../../models/PageSection/Gallery/Gallery.js";
import { ExamResultSection } from "../../models/PageSection/ExamResult/ExamResult.js";



export const renderPageSection = async (req, res) => {
  try {
    const { rows: menus } = await MenuModel.getMenusForSection();
    const { rows: categories } = await MenuCategory.getAll();

    const categoriesByMenu = {};
    categories.forEach(cat => {
      if (!categoriesByMenu[cat.menu_id]) {
        categoriesByMenu[cat.menu_id] = [];
      }
      categoriesByMenu[cat.menu_id].push(cat);
    });

    const welcome = await WelcomeMessage.get();
    const teachers = await Teachers.get();
    const homeoptions = await HomeOptions.get();
    const homecta = await HomeCta.get();
    const statistics = await HomeStatistics.get()
    const services = await HomeServices.get();
    const testimonial = await HomeTestimonial.get();
    const eoption = await EventOptions.get();

    const formPath = path.join(process.cwd(), "views/frontend/partials/pageSection.ejs");
    const formHtml = await ejs.renderFile(formPath, {
      menus,
      categoriesByMenu,
      welcome,
      teachers,
      homeoptions,
      homecta,
      statistics,
      services,
      testimonial,
      eoption
    });

    res.render("dashboard", {
      pageTitle: "Page Section",
      pageIcon: "fa-cog",
      breadcrumbs: [
        { title: "Dashboard", url: "/" },
        { title: "Page Section" }
      ],
      body: formHtml
    });
  } catch (err) {
    console.error("Error rendering pages section form:", err);
    res.status(500).send("Error rendering page section form");
  }
};

//Save home welcome message
export const saveWelcome = async (req, res) => {
  const data = req.body;

  // Convert checkbox to 'Enable' or 'Disable'
  data.show_website = req.body.show_website ? 'Enable' : 'Disable';

  // Handle uploaded photo
  if (req.files && req.files.photo && req.files.photo.length > 0) {
    data.photo = req.files.photo[0].filename;
  } else {
    data.photo = req.body.current_photo || null;
  }

  await WelcomeMessage.save(data);
  res.redirect("/frontend/section#welcome-message");
};


//Save home teacher related info
export const saveTeachers = async (req, res) => {
  const data = req.body;
  data.show_website = req.body.show_website ? 'Enable' : 'Disable';

  // Handle uploaded photo
  if (req.files && req.files.photo && req.files.photo.length > 0) {
    data.photo = req.files.photo[0].filename;
  } else {
    data.photo = req.body.current_photo || null;
  }
  await Teachers.save(data);
  res.redirect("/frontend/section#teachers");
};


//Save home Options related info
export const saveHomeOptions = async (req, res) => {

  const data = req.body;
  await HomeOptions.save(data);

  res.redirect("/frontend/section#home-options");
};

//Save Call To Action Section
export const saveHomeCta = async (req, res) => {
  try {
    const data = req.body;


    await HomeCta.save(data);

    //Redirect back to the section management page
    res.redirect("/frontend/section#home-cta");

  } catch (error) {
    console.error("Error saving Home CTA section:", error);
    res.status(500).send("An internal server error occurred while saving the Home CTA section.");
  }
}

export const getHomeStatistics = async (req, res) => {
  try {
    // Fetch the statistics data from the model
    const homeStats = await HomeStatistics.get();

    // If no stats exist (first run), return an empty object with a widgets array
    if (!homeStats) {
      return res.status(200).json({
        title: "",
        description: "",
        photo: "",
        title_text_color: "#000000",
        description_text_color: "#000000",
        show_website: 0,
        widgets: []
      });
    }

    // Return the fetched data
    res.status(200).json(homeStats);

  } catch (error) {
    console.error("Error fetching home statistics:", error);
    res.status(500).json({ message: "Failed to retrieve home statistics data.", error: error.message });
  }
};


//Save And update the statistics and its widgets
export const saveHomeStatistics = async (req, res) => {
  try {
    const data = req.body;
    data.show_website = req.body.show_website ? 'Enable' : 'Disable';

    // Handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }
    await HomeStatistics.save(data);

    res.redirect("/frontend/section#statistics");

  } catch (error) {
    console.error("Error saving home statistics:", error);
    res.status(500).send("An internal server error occurred while saving the Home Statistics.");
  }
};

//Save Home Service
export const saveHomeServices = async (req, res) => {
  try {
    const data = req.body;

    await HomeServices.save(data);

    res.redirect("/frontend/section#services");
  } catch (error) {
    console.error("Error saving home services", error);
    res.status(500).send("An internal server error occured while saving the home services.");
  }
};

//Save Home Testimonial
export const saveHomeTestimonial = async (req, res) => {
  try {
    const data = req.body;

    await HomeTestimonial.save(data);

    res.redirect("/frontend/section#testimonial");
  } catch (error) {
    console.error("Error saving home services", error);
    res.status(500).send("An internal server error occured while saving the home testimonial.");
  }
}

//Save Teacher Section
export const saveTeacherSection = async (req, res) => {
  try {
    const data = req.body;
    // Handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }

    await TeacherSection.save(data);

    res.redirect("/frontend/section#teacher_section")
  } catch (error) {
    console.error("Error saving teacher section", error);
    res.status(500).send("An internal server error occured while saving the teacher section.");
  }
};

/* Event Section */

//Save events
export const saveEvents = async (req, res) => {
  try {
    const data = req.body;

    await EventsSection.save(data);

    res.redirect("/frontend/section#events");

  } catch (error) {
    console.error("Error saving event section:", error);
    res.status(500).send("An internal server error occured while saving the event.");
  }
};

//Save Event Options
export const saveEventOptions = async (req, res) => {
  try {
    const data = req.body;

    // Handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }

    await EventOptions.save(data);

    res.redirect("/frontend/section#event-options");

  } catch (error) {
    console.error("Error saving event options", error);
    res.status(500).send("An internal server error occurred while saving the event.");

  }
}

//save About us About
export const saveAboutUsAbout = async (req, res) => {
  try {
    const data = req.body;

    //handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }
    await AboutUsSectionAbout.save(data);

    res.redirect("/frontend/section#about");

  } catch (error) {
    console.error("Error saving about us", error);
    res.status(500).send("An internal server error occurred while saving the aboutus about.");
  }

}

//Save AboutUs Service
export const saveAboutUsService = async (req, res) => {
  try {
    const data = req.body;

    //handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }

    await AboutUsSectionSection.save(data);

    res.redirect("/frontend/section#service");

  } catch (error) {
    console.error("Error saving aboutus service", error);
    res.status(500).send("An internal server error occurred while saving the aboutus service");
  }
}

//Sace AboutUS CTA
export const saveAboutUsCTA = async (req, res) => {
  try {
    const data = req.body;

    await AboutUsCta.save(data);

    res.redirect("/frontend/section#aboutus-cta")

  } catch (error) {
    console.error("Error saving aboutus CTA", error);
    res.status(500).send("An internal server error occurred while saving the aboutus CTA");
  }
}

//Save AboutUs Options
export const saveAboutUsOptions = async (req, res) => {
  try {
    const data = req.body;

    //handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }

    await AboutUsOptions.save(data);

    res.redirect("/frontend/section#about-options");

  } catch (error) {
    console.error("Error saving aboutus options", error);
    res.status(500).send("An internal server error occurred while saving the aboutus options");
  }
}

//FAQ Section Faq
export const saveFaq = async (req, res) => {
  try {
    const data = req.body;

    await FaqSectionFaq.save(data);

    res.redirect("/frontend/section#faq");
  } catch (error) {
    console.error("Errir saving faq ", error);
    res.status(500).send("An internal server error occurred whhile saving the faq");
  }
}

//Save Faq Options
export const saveFaqOptions = async (req, res) => {
  try {
    const data = req.body;

    //handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }


    await FaqOptions.save(data);

    res.redirect("/frontend/section#faq-options")

  } catch (error) {
    console.error("Error saving faq options", error);
    res.status(500).send("An internal server error occurred while saving the faq");
  }
}


//Save And update the Online Admission and its Fee Structure by class 
export const saveOnlineAdmission = async (req, res) => {
  try {
    const data = req.body;

    await OnlineAdmission.save(data);

    res.redirect("/frontend/section#online-admission");

  } catch (error) {
    console.error("Error saving online admission:", error);
    res.status(500).send("An internal server error occurred while saving the Online Admission.");
  }
};

//Save Gallery
export const saveGallery = async (req, res) => {
  try {
    const data = req.body;

    //handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }


    await GallerySection.save(data);

    res.redirect("/frontend/section#gallery")

  } catch (error) {
    console.error("Error saving gallery", error);
    res.status(500).send("An internal server error occurred while saving the gallery");
  }
}

//Save Exam Result
export const saveExamResult = async (req, res) => {
  try {
    const data = req.body;

    //handle uploaded photo
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      data.photo = req.files.photo[0].filename;
    } else {
      data.photo = req.body.current_photo || null;
    }


    await ExamResultSection.save(data);

    res.redirect("/frontend/section#exam-result")

  } catch (error) {
    console.error("Error saving exam result", error);
    res.status(500).send("An internal server error occurred while saving the exam result");
  }
}