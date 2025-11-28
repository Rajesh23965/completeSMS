document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Topbar and start the date updater interval
    window.initializeTopbar();
    window.startDateUpdater();

    // 2. Setup Page Routing
    const menuItems = document.querySelectorAll('.menu-item');
    const pageContents = document.querySelectorAll('.page-content');
    const defaultPage = 'home';

    /**
     * Shows the loader, simulates content fetching, and then displays the target page.
     * This function is the core of the single-page application (SPA) routing.
     * @param {string} pageName The data-page attribute value (e.g., 'home', 'about').
     */
    function loadPage(pageName) {
      // 1. Show loader immediately (from loader.js)
      window.showLoader();
      
      // 2. Simulate the async task (page fetch delay)
      const navigationTime = 800; 

      setTimeout(() => {
        // 3. Update Content: Hide all and show target content
        pageContents.forEach(content => {
          content.classList.add('hidden');
        });

        const targetContent = document.getElementById(`content-${pageName}`);
        if (targetContent) {
          targetContent.classList.remove('hidden');
        }

        // 4. Update Menu Styling (Active State)
        menuItems.forEach(item => {
          // Remove previous active classes
          item.classList.remove('active', 'border-indigo-600', 'font-semibold', 'text-indigo-600');
          item.classList.add('text-gray-700', 'border-transparent');
          
          // Add new active classes
          if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active', 'border-indigo-600', 'font-semibold', 'text-indigo-600');
            item.classList.remove('text-gray-700', 'hover:border-indigo-600');
          }
        });

        // 5. Hide Loader (from loader.js)
        window.hideLoader();
        console.log(`Page '${pageName}' loaded.`);
      }, navigationTime);
    }


    // --- Event Listeners and Initial Load ---

    // Attach click listeners to all menu items
    menuItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        const page = this.getAttribute('data-page');
        if (page) {
          loadPage(page);
        }
      });
    });


    // Initial Load Handler: Hides loader after *all* assets are loaded and loads default page.
    window.onload = function() {
        console.log('Window assets loaded. Loading default page.');
        // This will show the loader briefly (if not already hidden) and then hide it after the simulation delay
        loadPage(defaultPage);
    };

    // Pre-emptive call for very fast load scenarios
    if (document.readyState === 'complete') {
        loadPage(defaultPage);
    } else {
        // Ensure loader is visible while loading assets before window.onload fires
        window.showLoader(); 
    }
});