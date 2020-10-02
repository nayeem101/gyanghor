const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const sharp = require("sharp");

const User = require("../models/User");
const Department = require("../models/Department");
const Ebooks = require("../models/Ebooks");

const { ensureAuth, adminAuth } = require("../config/auth");

const uploadPath = path.join(__dirname, "../", "public", "upload");

//multer image upload config
var storage = multer.diskStorage({
  //folder upload -> public/upload
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);
      let newFilename =
        Math.floor(Math.random() * 9000000000) +
        1000000000 +
        path.extname(file.originalname);
      cb(null, newFilename);
    });
  },
});
var upload = multer({ storage: storage });
//multer blog image post show and delete

//show all image in folder upload to json
router.get("/files", (req, res, next) => {
  let currentUser = req.user.name;

  fs.readdir("public/upload", (err, files) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
    var sorted = [];

    for (let item of files) {
      let extname = path.extname(item);
      let uploadedBy = item.substring(0, item.indexOf("-"));
      if (
        (extname === ".png" ||
          extname === ".jpg" ||
          extname === ".jpeg" ||
          extname === ".svg") &&
        currentUser === uploadedBy
      ) {
        var abc = {
          image: "/upload/" + item,
          folder: "/",
        };
        sorted.push(abc);
      }
    }

    res.send(sorted);
  });
});

//upload image to folder upload
router.post("/upload", upload.array("flFileUpload", 2), (req, res, next) => {
  req.files.forEach((file) => {
    let compressedImgPath = path.join(
      __dirname,
      "../",
      "public/upload",
      `${req.user.name}-${new Date().getTime()}${path.extname(file.originalname)}`
    );

    sharp(file.path)
      .resize(640, 480, {
        fit: "inside",
      })
      .jpeg({
        quality: 70,
        chromaSubsampling: "4:4:4",
      })
      .toFile(compressedImgPath, (err, info) => {
        if (err) {
          res.send(err.message);
          console.log(err);
        } else {
          fs.unlink(file.path, (err) => {
            if (err) console.log("sharp error", err);
          });
          res.redirect("back");
        }
      });
  });
});

//delete file
router.post("/delete_file", (req, res, next) => {
  var url_del = "public" + req.body.url_del;

  fs.access(url_del, (err) => {
    if (err) {
      console.log(err);
      res.send("error accessing the files");
    }
    fs.unlink(url_del, (err) => {
      if (err){
        res.send("error accessing the files");
        console.log("sharp error", err);
      }
    });
  });

  res.redirect("back");
});

//get form data
router.post("/post", (req, res, next) => {
  const post = req.body.data;
  res.render("index", { post });
});

//home
router.get("/", async (req, res, next) => {
  try {
    const depts = await Department.find();
    if (depts.length !== 0) {
      for (let i = 0; i < depts.length; i++) {
        let curDept = depts[i];
        const totalBooks = await Ebooks.countDocuments({ category: curDept.shortName });
        depts[i] = {
          id: curDept.id,
          name: curDept.name,
          shortName: curDept.shortName,
          totalBooks: totalBooks || 0,
        };
      }
    }
    if (req.isAuthenticated() && req.user.role === "user")
      res.render("home", { depts, isLogedIn: true, username: req.user.name });
    else res.render("home", { depts, isLogedIn: false });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

//dashboard
router.get("/dashboard", ensureAuth, (req, res, next) => {
  res.render("foruser/dashboard", { user: req.user });
  console.log(req.user);
});

//admin dashboard
router.get("/N276olISAwaqMQqB", adminAuth, async (req, res, next) => {
  try {
    const allUsers = await User.find();
    let users = allUsers.map((user) => {
      return {
        id: user.id,
        fullname: `${user.firstname} ${user.lastname}`,
        department: user.department,
        batch: user.batch,
        session: user.session,
        email: user.email,
        mobile: user.mobile,
      };
    });

    res.render("fornimda/N276olISAwaqMQqB", { user: req.user, users });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error.message || error._message);
    res.redirect("back");
  }
});

module.exports = router;
