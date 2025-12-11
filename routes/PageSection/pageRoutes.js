import express from "express";
import { HomeCta } from "../../models/PageSection/CallToActionSection.js";

import {
  renderPageSection,
  saveWelcome, saveTeachers,
  saveHomeOptions, saveHomeCta,
  saveHomeStatistics, saveHomeServices,
  saveHomeTestimonial,
  saveTeacherSection, saveEvents,
  saveEventOptions,
  saveAboutUsAbout,
  saveAboutUsService,
  saveAboutUsCTA,
  saveAboutUsOptions,
  saveFaq,
  saveFaqOptions,
  saveOnlineAdmission,
  saveGallery,
  saveExamResult,
  getWelcome,
  getTeacher,
  getTestimonial,
  getHomeStatistics,
  getService,
  getHomeCta
} from "../../controllers/PageSection/pageSectionController.js";
import pool from "../../config/database.js";
import { aboutUsOptions, aboutUsSecService, aboutUsSectionUpload, eventOptionsUpload, examResult, faqOption, gallery, statisticsUpload, teacherSectionUpload, teacherUpload, welcomeUpload } from "../../config/upload.js";
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
import { GallerySection } from "../../models/PageSection/Gallery/Gallery.js";
import { ExamResultSection } from "../../models/PageSection/ExamResult/ExamResult.js";

const router = express.Router();

/* Display page section */
router.get("/section", renderPageSection);

router.get("/section/:slug", async (req, res) => {
  const { slug } = req.params;


  //Home Section
  if (slug === "welcome-message") {
    const [[welcome]] = await pool.query("SELECT * FROM welcome_message LIMIT 1");
    return res.render("frontend/sections/welcome-message", { welcome });
  }

  if (slug === "teachers") {
    const [[teachers]] = await pool.query("SELECT * FROM teachers LIMIT 1");
    return res.render("frontend/sections/teachers", { teachers });
  }

  if (slug === "options") {
    const [[options]] = await pool.query("SELECT * FROM home_options LIMIT 1");
    return res.render("frontend/sections/home-options", { options });
  }

  if (slug === "home-cta" || slug === "call-to-action-section") {
    const cta = await HomeCta.get();
    return res.render("frontend/sections/home-cta", { cta });
  }

  if (slug === "statistics") {
    // Get main statistics record
    const [[statistics]] = await pool.query("SELECT * FROM home_statistics LIMIT 1");

    if (statistics) {
      // Fetch related widgets for this statistics ID
      const [widgets] = await pool.query(
        "SELECT * FROM home_statistics_widgets WHERE home_statistics_id = ? ORDER BY id ASC",
        [statistics.id]
      );
      // Attach widgets array
      statistics.widgets = widgets;
    }

    return res.render("frontend/sections/home-statistics", { statistics });
  }

  if (slug === "services") {
    const [[services]] = await pool.query("SELECT * FROM home_services LIMIT 1");
    return res.render("frontend/sections/services", { services });
  }

  if (slug === "home-testimonial" || slug === "testimonial") {
    const htesti = await HomeTestimonial.get();
    return res.render("frontend/sections/home-testimonial", { htesti });
  }

  //Teacher Section
  if (slug === "teacher-section") {
    const teachersection = await TeacherSection.get();
    return res.render("frontend/sections/teacher-section", { teachersection });
  }

  //Events Section
  if (slug === "events") {
    const event = await EventsSection.get();
    return res.render("frontend/sections/events", { event });
  }

  if (slug === "event-options") {
    const eoption = await EventOptions.get();
    return res.render("frontend/sections/event-options", { eoption });
  }

  //About Us Section

  if (slug === "about") {
    const about = await AboutUsSectionAbout.get();
    return res.render("frontend/sections/about", { about });
  }

  if (slug === "service") {
    const service = await AboutUsSectionSection.get();
    return res.render("frontend/sections/service", { service });
  }

  if (slug === "about-us-call-to-action-section" || slug === "about-us-call-to-action-section") {
    const cta = await AboutUsCta.get();
    return res.render("frontend/sections/aboutus-cta", { cta });
  }

  if (slug === "about-options") {
    const abtOption = await AboutUsOptions.get();
    return res.render("frontend/sections/about-options", { abtOption });
  }

  //FAQ Section
  if (slug === "faq") {
    const faq = await FaqSectionFaq.get();
    return res.render("frontend/sections/faq", { faq });
  }

  //Faq Otions
  if (slug === "faq-options") {
    const faqOpt = await FaqOptions.get();
    return res.render("frontend/sections/faq-options", { faqOpt });
  }

  //Online Admission Section
  if (slug === "admission") {

    const [[onAdmission]] = await pool.query("SELECT * FROM online_admission LIMIT 1");

    if (onAdmission) {

      const [admissionFee] = await pool.query(
        "SELECT * FROM online_admission_fee WHERE online_admission_id = ? ORDER BY id ASC",
        [onAdmission.id]
      );

      onAdmission.admissionFee = admissionFee;
    }

    return res.render("frontend/sections/online-admission", { onAdmission });
  }

  //Gallery Section
  if (slug === "gallery") {
    const gallery = await GallerySection.get();
    return res.render("frontend/sections/gallery", { gallery });
  }

  //Exam Result
  if (slug === "exam-results") {
    const examResult = await ExamResultSection.get();
    return res.render("frontend/sections/exam-results", { examResult });
  }

  // fallback
  res.render(`frontend/sections/${slug}`, {});
});


// Tab Forms routes

const uploadWelcome = welcomeUpload.fields([{ name: "photo", maxCount: 1 }]);
const uploadTeacher = teacherUpload.fields([{ name: "photo", maxCount: 1 }]);
const uploadStatistics = statisticsUpload.fields([{ name: "photo", maxCount: 1 }])
const uploadTeacherSection = teacherSectionUpload.fields([{ name: "photo", maxCount: 1 }]);
const uploadEventOptions = eventOptionsUpload.fields([{ name: 'photo', maxCount: 1 }]);
const uploadAboutUsSecAbout = aboutUsSectionUpload.fields([{ name: 'photo', maxCount: 1 }]);
const uploadAboutUsSecService = aboutUsSecService.fields([{ name: 'photo', maxCount: 1 }]);
const uploadAboutUsSecOptions = aboutUsOptions.fields([{ name: 'photo', maxCount: 1 }]);
const uploadFaqOptions = faqOption.fields([{ name: 'photo', maxCount: 1 }]);
const uploadGallery = gallery.fields([{ name: 'photo', maxCount: 1 }]);
const uploadExamResult = examResult.fields([{ name: 'photo', maxCount: 1 }]);

router.post("/section/welcome-message", uploadWelcome, saveWelcome);
router.get("/welcome-message", getWelcome);

router.post("/section/teachers", uploadTeacher, saveTeachers);
router.get("/teachers", getTeacher);

router.post("/section/home-options", saveHomeOptions);

router.post("/section/home-cta", saveHomeCta)
router.get("/call-to-action",getHomeCta);

router.post("/section/home-statistics", uploadStatistics, saveHomeStatistics);
router.get("/statistics", getHomeStatistics);

router.post("/section/home-services", saveHomeServices);
router.get("/services-data",getService);

router.post("/section/home-testimonial", saveHomeTestimonial);
router.get("/home-testimonial", getTestimonial);

router.post("/section/teacher-section", uploadTeacherSection, saveTeacherSection);

router.post("/section/events", saveEvents);

router.post("/section/event-options", uploadEventOptions, saveEventOptions);

router.post("/section/about", uploadAboutUsSecAbout, saveAboutUsAbout);

router.post("/section/service", uploadAboutUsSecService, saveAboutUsService);

router.post("/section/aboutus-cta", saveAboutUsCTA)

router.post("/section/aboutus-options", uploadAboutUsSecOptions, saveAboutUsOptions);

router.post("/section/faq", saveFaq);

router.post("/section/faq-option", uploadFaqOptions, saveFaqOptions);

router.post("/section/online-admission", saveOnlineAdmission);

router.post("/section/gallery", uploadGallery, saveGallery);

router.post("/section/exam-result", uploadExamResult, saveExamResult);
export default router;





