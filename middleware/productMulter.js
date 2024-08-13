import multer from "multer";
import path from "path";

// Define storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append file extension
  },
});

// Define file filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Create Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // Max file size (1MB)
  },
});

export default upload;
