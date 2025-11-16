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


    const formPath = path.join(process.cwd(), "views/frontend/partials/pageSection.ejs");
    const formHtml = await ejs.renderFile(formPath, {
      menus,
      categoriesByMenu,
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