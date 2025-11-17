import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import MySQLStoreModule from 'express-mysql-session';
const MySQLStore = MySQLStoreModule(session);
import settingRoute from "./routes/SettingRoutes/settingRoutes.js"
import menuRoutes from "./routes/MenueRoutes/menuRoutes.js";
import pageRoute from "./routes/PageSection/pageRoutes.js"
import sliderRoutes from "./routes/SliderRoutes/sliderRoutes.js"
import featureRoutes from "./routes/FeaturesRoutes/features.js"
import testimonialRoutes from "./routes/Testimonial/Testimonial.js";
import serviceRoutes from "./routes/ServiceRoute/ServiceRoute.js";
import faqRoutes from "./routes/FrontendFaq/FrontendFaq.js";
import galleryCatRoutes from "./routes/GalleryCate/GalleryCateRoutes.js";
import galleryRoutes from "./routes/GalleryRoutes/GalleryRoutes.js"
import galleryUploadRoutes  from "./routes/GalleryRoutes/galleryUploadRoutes.js"
import settingRoutes from "./routes/Settings/settingRoutes.js"

const app = express();

//Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
});
app.use(session({
    secret: process.env.SESSION_SECRET || 'IT_Home_Nepal',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
    }
}));
app.use((req, res, next) => {
    res.locals.baseUrl = req.protocol + '://' + req.get('host');
    next();
});

// Routes

app.get('/', (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        pageTitle: 'Dashboard',
        pageIcon: 'fa-tachometer-alt',
        breadcrumbs: [{ label: '', href: '/' }],
        baseUrl: req.protocol + '://' + req.get('host'),
        breadcrumbs: [{ label: '', href: '/' }],
        body: "All"
    });
});

app.use("/frontend", settingRoute);
app.use("/frontend", menuRoutes);
app.use("/frontend", pageRoute);
app.use("/frontend", sliderRoutes);
app.use("/frontend", featureRoutes);
app.use("/frontend", testimonialRoutes);
app.use("/frontend", serviceRoutes);
app.use("/frontend", faqRoutes);
app.use("/frontend", galleryCatRoutes);
app.use("/frontend", galleryRoutes);
app.use("/frontend", galleryUploadRoutes);
app.use("/school_settings", settingRoutes);

export default app;



