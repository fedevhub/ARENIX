const multer = require("multer");
const path = require("path");
const fs = require("fs");

const folder = path.join(__dirname, "../uploads/lapangan");

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const namaFile = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, namaFile);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format gambar harus JPG, PNG, atau WEBP"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
