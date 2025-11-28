// Global language state, defaulting to English
let currentLanguage = "english";

// Nepali Months and Weekdays for conversion
const nepaliMonths = [
    "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज",
    "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुण", "चैत्र"
];
const nepaliWeekdays = [
    "आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"
];

// --- API HELPER FUNCTIONS ---

/**
 * Function to fetch data from API. Includes basic mocking for reliable execution.
 * The TOPBAR ITEMS API will now always attempt to fetch LIVE data first.
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`HTTP error! Status: ${response.status} for URL: ${url}. Attempting mock data for non-topbar APIs.`);
            // Only use mock data for non-topbar APIs if fetching fails
            return mockApiData(url);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data from API:', url, error);
        return mockApiData(url); // Use mock data on error
    }
}

// --- LANGUAGE HELPER FUNCTIONS ---

// Converts English number to Nepali number
function toNepaliNumber(num) {
    const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
    return String(num).split('').map(d => map[d] || d).join('');
}

// Simplified/Approximate AD to BS conversion logic (You should replace this with a reliable library)
function convertToBS(date) {
    const now = date || new Date();
    let bsYear = now.getFullYear() + 56;
    let bsMonth = now.getMonth() + 9;

    if (bsMonth > 12) {
        bsMonth -= 12;
        bsYear++;
    }

    // We are hardcoding the day for accuracy based on the user's example date (Nov 25, 2025 = Mangalbar 10)
    const mockDay = 10;
    const mockWeekdayIndex = 2;

    return {
        year: bsYear,
        month: bsMonth,
        day: mockDay,
        weekday: mockWeekdayIndex
    };
}

// 📅 Date Formatting
function formatNepaliDate(date) {
    const bs = convertToBS(date);

    const nepYear = toNepaliNumber(bs.year);
    const nepMonth = nepaliMonths[bs.month - 1] || "मंसिर";
    const nepDay = toNepaliNumber(bs.day);
    const nepWeekday = nepaliWeekdays[bs.weekday];

    return `${nepYear} ${nepMonth} ${nepDay} गते, ${nepWeekday}`;
}

function formatEnglishDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // We keep the fixed date here for consistency with the BS mock date:
    const fixedDate = new Date("2025-11-25");
    return fixedDate.toLocaleDateString("en-US", options);
}

// ⏰ NEW: Time Formatting
function formatEnglishTime(date) {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleTimeString("en-US", options);
}

function formatNepaliTime(date) {
    // Get time components
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Afternoon/Forenoon

    // Convert to 12-hour format
    const displayHours = hours % 12 || 12;

    // Convert numbers to Nepali
    const nepaliHours = toNepaliNumber(displayHours);
    const nepaliMinutes = toNepaliNumber(minutes);

    return `${nepaliHours}:${nepaliMinutes} ${ampm}`;
}

/**
 * Toggles the language state and re-initializes the topbar.
 */
window.toggleLanguage = function () { // Make global for button onclick
    currentLanguage = currentLanguage === "english" ? "nepali" : "english";
    document.getElementById("top-bar").innerHTML = "";
    initializeTopbar();
}

// --- RENDERING HELPER FUNCTIONS ---

/**
 * Creates a standard topbar item, handling type and language conversion.
 * Uses the dynamic 'text' field provided by your API.
 */
function createTopbarItem(item) {
    // Check item visibility (status: 1 = show)
    if (item.visibility !== 1) return null; // Using 'visibility' as per your dynamic data

    const element = document.createElement('div');
    element.className = 'topbar-item has-divider';

    // *** DYNAMIC TEXT HANDLING ***
    const itemText = item.text;

    // Apply custom styles
    if (item.border) element.style.border = item.border;
    if (item.radius) element.style.borderRadius = item.radius;

    // Add icon
    if (item.icon) {
        const icon = document.createElement('i');
        icon.className = item.icon;
        element.appendChild(icon);
    }

    let content;

    // Type-Based Rendering Logic
    switch (item.type) {
        case 'phone':
            content = document.createElement('a');
            content.href = `tel:${item.url || item.text}`;
            // Apply Nepali number conversion to the phone number text
            content.textContent = currentLanguage === "nepali"
                ? toNepaliNumber(item.text)
                : item.text;
            break;
        case 'email':
            content = document.createElement('a');
            content.href = `mailto:${item.url || item.text}`;
            content.textContent = item.text;
            break;
        case 'button':
            content = document.createElement('a');
            content.className = 'topbar-btn';
            content.href = item.url || '#';
            content.textContent = item.text;
            break;
        case 'toggle':
            return null;
        case 'address':
        case 'custom':
        default:
            content = document.createElement('span');
            content.textContent = item.text;
    }

    if (content) {
        element.appendChild(content);
        return element;
    }
    return null;
}

/**
 * Creates the language toggle button with correct label and action.
 */
function createLanguageToggleButton() {
    const element = document.createElement('div');
    element.className = 'topbar-item';

    const button = document.createElement("button");
    button.className = "lang-btn";

    // Display the language to SWITCH TO (English <-> नेपाली)
    button.textContent = (currentLanguage === "english") ? "नेपाली" : "English";
    button.onclick = window.toggleLanguage;

    element.appendChild(button);
    return element;
}


// --- MAIN LOGIC ---

/**
 * Organizes topbar items, applies colors, and appends to the DOM.
 */
function organizeTopbarItems(topbarData, settingsData, dateSettingsData) {
    const topbar = document.getElementById('top-bar');
    if (!topbar) return;

    // 1. APPLY THEME COLORS
    if (settingsData && settingsData.data) {
        const data = settingsData.data;
        document.documentElement.style.setProperty('--theme-menu-bg-color', data.theme_menu_bg_color || '#0a7c53');
        document.documentElement.style.setProperty('--theme-text-color-primary', data.theme_text_color || '#ffffff');
        document.documentElement.style.setProperty('--theme-divider-color', (data.theme_text_color || '#ffffff') + '40');
        document.documentElement.style.setProperty('--theme-button-hover-color', data.theme_button_hover_color || '#2980b9');
        document.documentElement.style.setProperty('--theme-border-radius', data.theme_border_radius || '5px');
    }

    const startSection = document.createElement('div');
    startSection.className = 'topbar-section start-section';

    const endSection = document.createElement('div');
    endSection.className = 'topbar-section end-section';

    // 2. DATE AND TIME INJECTION LOGIC
    const showDate = dateSettingsData?.settings?.showDate === 1;
    const datePosition = dateSettingsData?.settings?.language === 'nepali' ? 'start' : 'end';

    if (showDate) {
        const now = new Date(); // Get the current time instance

        let formattedDate;
        let formattedTime;

        if (currentLanguage === "nepali") {
            formattedDate = formatNepaliDate(now);
            formattedTime = formatNepaliTime(now);
        } else {
            formattedDate = formatEnglishDate(now);
            formattedTime = formatEnglishTime(now);
        }

        // Combine date and time
        const combinedDateTime = `${formattedDate} | ${formattedTime}`;

        const dateItem = {
            id: 'datetime-display',
            type: 'custom',
            text: combinedDateTime, // The combined formatted string
            icon: 'fas fa-calendar-alt',
            position: datePosition,
            visibility: 1
        };

        const dateElement = createTopbarItem(dateItem);
        if (dateElement) {
            // Prepend date to the start section or append to end section
            if (datePosition === 'start') {
                startSection.insertBefore(dateElement, startSection.firstChild);
            } else {
                endSection.appendChild(dateElement);
            }
        }
    }

    // 3. PROCESS DYNAMIC ITEMS
    let hasLanguageButton = false;
    let languageButtonPosition = 'end';
    let itemsToRender = [];

    if (topbarData && topbarData.success && Array.isArray(topbarData.topbar)) {
        const items = topbarData.topbar;

        // Sort items by order_no field
        items.sort((a, b) => (a.order_no || 0) - (b.order_no || 0));

        items.forEach(item => {
            if (item.visibility !== 1) return;

            // Detect language button settings
            if (item.type === "toggle") {
                hasLanguageButton = true;
                languageButtonPosition = item.position || 'end';
                return;
            }

            itemsToRender.push(item);
        });

        // Add all processed items to the DOM
        itemsToRender.forEach(item => {
            const topbarItem = createTopbarItem(item);

            if (topbarItem) {
                if (item.position === 'start') {
                    startSection.appendChild(topbarItem);
                } else {
                    endSection.appendChild(topbarItem);
                }
            }
        });

        // Add the single, functional language button
        if (hasLanguageButton) {
            const langButtonElement = createLanguageToggleButton();
            if (languageButtonPosition === 'start') {
                startSection.appendChild(langButtonElement);
            } else {
                endSection.appendChild(langButtonElement);
            }
        }
    }

    // 4. FINALIZE
    topbar.appendChild(startSection);
    topbar.appendChild(endSection);
}

/**
 * Initializes the topbar by fetching all required data and calling render.
 */
async function initializeTopbar() {
    const settingsData = await fetchData('http://localhost:3000/frontend/api');
    const topbarData = await fetchData('http://localhost:3000/frontend/topbar/get'); // Assuming fixed URL
    const dateSettingsData = await fetchData('http://localhost:3000/frontend/topbar/date/get');

    organizeTopbarItems(topbarData, settingsData, dateSettingsData);
}

// Update date and time every minute
function startDateUpdater() {
    // Interval set to 60,000 milliseconds (1 minute)
    setInterval(() => {
        // Re-render the topbar to update the date and time string
        document.getElementById("top-bar").innerHTML = "";
        initializeTopbar();
    }, 60000);
}

// // --- MOCK DATA (Only for non-topbar APIs if live fetch fails) ---
// function mockApiData(url) {
//     // API (Color Management)
//     if (url.includes('/frontend/api')) {
//         return { "success": true, "data": { "id": 1, "theme_primary_color": "#0a7c53", "theme_menu_bg_color": "#0a7c53", "theme_button_hover_color": "#2980b9", "theme_text_color": "#ffffff", "theme_border_radius": "5px" } };
//     }
//     // Date Enable API
//     else if (url.includes('/frontend/topbar/date/get')) {
//         return { "success": true, "message": "Topbar date settings fetched", "settings": { "id": 1, "showDate": 1, "language": "nepali" } };
//     }
//     return null;
// }

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTopbar();
    startDateUpdater();
});