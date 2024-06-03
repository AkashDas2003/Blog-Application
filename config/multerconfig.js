const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
// disk storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, name) {
      const filename = name.toString("hex") + path.extname(file.originalname);//puts a random name with the original file extension
      cb(null, filename);
    });
  },
});


// export  upload variable
const upload = multer({ storage: storage });
 module.exports = { upload };

