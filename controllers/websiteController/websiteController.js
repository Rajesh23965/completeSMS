import pool from "../../config/database.js";
import MenuModel from "../../models/Menue/menue.js";
import { WelcomeMessage } from "../../models/PageSection/WelcomeMessage.js";
import { Settings } from "../../models/Setting/setting.js";
import { Topbar } from "../../models/Topbar/topbar.model.js";
import { TopbarDate } from "../../models/Topbar/topbarDate.model.js";


export const getHomePage = async (req, res) => {
    try {
        // Fetch all required data
        const [settingsRows] = await pool.query('SELECT * FROM settings WHERE id = 1');
        const settings = settingsRows[0] || {};
        
        // Fetch topbar items
        const topbarItems = await Topbar.getAllWebsite() || [];
        
        // Group items by section (using position/section for consistency)
        const groupedItems = {
            // Sort items by order_no for correct display sequence
            left: topbarItems.filter(item => item.position === 'start').sort((a, b) => a.order_no - b.order_no),
            center: topbarItems.filter(item => item.position === 'center').sort((a, b) => a.order_no - b.order_no),
            right: topbarItems.filter(item => item.position === 'end').sort((a, b) => a.order_no - b.order_no)
        };
        
        const topbarDate = await TopbarDate.get() || { showDate: 0, language: 'english' };
        
        // Extract theme colors and logo specifically for easy access in EJS/CSS
        const themeSettings = {
            theme_primary_color: settings.theme_primary_color || '#007bff',
            theme_menu_bg_color: settings.theme_menu_bg_color || '#343a40',
            theme_text_color: settings.theme_text_color || '#ffffff',
            theme_button_hover_color: settings.theme_button_hover_color || '#0056b3',
            theme_border_radius: settings.theme_border_radius || '4px',
            left_logo: settings.left_logo,
            cms_title: settings.cms_title
        };
  
        // Render the website homepage
        res.render('website/index', {
            settings: settings,
            topbarItems: groupedItems,
            topbarDate: topbarDate,
            themeSettings: themeSettings, // <--- Pass extracted theme settings
        });
        
    } catch (error) {
        console.error("Error loading homepage:", error);
        // Fallback with empty data
        res.render('website/index', {
            settings: {},
            topbarItems: { left: [], center: [], right: [] },
            topbarDate: { showDate: 0, language: 'english' },
            themeSettings: {}, // <--- Fallback theme settings
        });
    }
};


