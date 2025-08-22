import multer from "multer";
import path from "path";
import fs from "fs";

const createUploader = (folder) => {
  const uploadDir = `public/uploads/${folder}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${folder}-${uniqueSuffix}${ext}`);
    }
  });
  
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    // Videos
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  const fileFilter = (req, file, cb) => {
    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
    if (isMimeAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  };

  return multer({
    storage: storage,
    limits: {
      fileSize: 50 * 1024 * 1024
    },
    fileFilter: fileFilter
  });
};

// Create upload middleware for settings
const settingsUpload = createUploader('settings');

// Middleware for multiple file uploads
export const uploadFiles = settingsUpload.fields([
  { name: "logo", maxCount: 1 },
  { name: "fav_icon", maxCount: 1 }
]);

export default settingsUpload;