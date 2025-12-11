import express from 'express';
import { getHomePage } from '../../controllers/websiteController/websiteController.js';

const router = express.Router();

// Debug route to check data
router.get('/debug', async (req, res) => {
    try {
        const [settingsRows] = await pool.query('SELECT * FROM settings WHERE id = 1');
        const settings = settingsRows[0] || {};
        
        const topbarItems = await Topbar.getAllWebsite() || [];
        
        const groupedItems = {
            left: topbarItems.filter(item => item.section === 'left' || item.position === 'start'),
            center: topbarItems.filter(item => item.section === 'center' || item.position === 'center'),
            right: topbarItems.filter(item => item.section === 'right' || item.position === 'end')
        };
        
        const topbarDate = await TopbarDate.get() || { showDate: 0, language: 'english' };
        
        res.json({
            settings: {
                hasData: !!settingsRows[0],
                keys: Object.keys(settings),
                cms_title: settings.cms_title
            },
            topbarItems: {
                total: topbarItems.length,
                grouped: groupedItems
            },
            topbarDate: topbarDate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', getHomePage);

export default router;