const multer = require('multer');

const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype) {
    return cb(null, true);
  }
  cb(new Error('Error: Images Only!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

module.exports = upload;
