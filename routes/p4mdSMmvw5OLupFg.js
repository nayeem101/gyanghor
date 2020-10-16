const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

//admin model
const Admin = require("../models/Admin");
const Ebooks = require("../models/Ebooks");
const Department = require("../models/Department");
const Journals = require("../models/Journals");
const StudyMat = require("../models/StudyMat");

//admin auth
const { adminAuth } = require("../config/auth");

const uploadPath = path.join(__dirname, "../", "public", "images");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//get - admins/login
router.get("/ByRVZOXPZsitU9oF", (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin")
    res.render("fornimda/admin-log");
  else res.redirect("/N276olISAwaqMQqB");
});

//get - admins/register
router.get("/ByRVZOXPZsitU9oR", (req, res, next) => {
  res.render("fornimda/admin-reg");
});

//post - admins/register
router.post("/register", async (req, res, next) => {
  const { username, fullname, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if (!username || !fullname || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
  }

  //check password match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  //check pass length
  if (password.length < 6) {
    errors.push({ msg: "Passwords shoud be at least 6 characters" });
  }

  if (errors.length > 0) {
    console.log(errors);
    res.render("register", { errors, username, fullname });
  } else {
    //validation passed
    try {
      const admin = await Admin.findOne({ username });
      if (admin) {
        //user exists
        errors.push({ msg: "Username is already registered" });
        res.render("register", {
          errors,
          username,
          fullname,
          password,
          password2,
        });
      } else {
        //saving user to db
        const hash = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
          username,
          fullname,
          password: hash,
        });
        await newAdmin.save();
        req.flash("success_msg", "You are now registered and can login");
        res.redirect("./ByRVZOXPZsitU9oF");
        //console.log(newUser);
      }
    } catch (error) {
      errors.push({ msg: error.message });
      console.log(error);
      res.render("admin-reg", {
        errors,
        username,
        fullname,
        password,
        password2,
      });
    }
  }
});

//login handle
router.post("/ByRVZOXPZsitU9oF", async (req, res, next) => {
  passport.authenticate("admin-local", {
    successRedirect: "/N276olISAwaqMQqB", //dashboard
    failureRedirect: "/3U0bzsE9e1mQBuIW/ByRVZOXPZsitU9oF",
    failureFlash: true,
  })(req, res, next);
});

//logout handle
router.post("/logout", (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error_msg", "You have already logged out or login first");
    res.redirect("/users/login");
  }
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/3U0bzsE9e1mQBuIW/ByRVZOXPZsitU9oF");
});

//for admins
// ebooks -- GET /ebooks
router.get("/ebook", adminAuth, async (req, res, next) => {
  try {
    const ebooks = await Ebooks.find().sort({ _id: -1 }).limit(10);
    res.render("fornimda/addbook", { ebooks });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error._message || error.message);
    res.redirect("back");
  }
});

// ebooks -- POST /addebook
router.post("/addebook", adminAuth, async (req, res, next) => {
  const { name, writer,semester, pages, publisher, language, link, dlink, details } = req.body;
  let category = req.body.category.filter((cat) => cat.length !== 0);

  //book obj initilize
  const newEbook = new Ebooks({
    category,
    semester,
    name,
    writer,
    pages,
    publisher,
    language,
    link,
    dlink,
    details,
  });
  try {
    //saving book
    await newEbook.save();
    res.redirect("back");
  } catch (error) {
    req.flash("error_msg", error.message);
    res.redirect("back");
    console.log("error", error);
  }
});

//departments -- GET /departments
router.get("/departments", adminAuth, async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ _id: -1 }).limit(5);

    if (departments.length !== 0) {
      for (let i = 0; i < departments.length; i++) {
        let curDept = departments[i];
        const totalBooks = await Ebooks.countDocuments({ category: curDept.shortName });
        departments[i] = {
          id: curDept.id,
          name: curDept.name,
          shortName: curDept.shortName,
          totalBooks: totalBooks || 0,
        };
      }
    }
    res.render("fornimda/addDept", { departments });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error._message);
    res.redirect("/3U0bzsE9e1mQBuIW/departments");
  }
});

//add dept -- POST /addDept
router.post("/addDept", adminAuth, async (req, res, next) => {
  let { name, shortName } = req.body;
  let deptInfo = await Department.findOne({ shortName });
  if (deptInfo !== null) {
    req.flash("error_msg", "Department already exists");
    res.redirect("/3U0bzsE9e1mQBuIW/departments");
  } else {
    const newDept = new Department({
      name,
      shortName,
    });
    try {
      await newDept.save();
      res.redirect("/3U0bzsE9e1mQBuIW/departments");
    } catch (error) {
      console.log(error);
      req.flash("error_msg", error._message);
      res.redirect("back");
    }
  }
});

// journals -- GET /journals
router.get("/journals", adminAuth, async (req, res, next) => {
  const journals = await Journals.find().sort({ _id: -1 }).limit(10);
  if (journals.length !== 0) res.render("fornimda/addJournal", { journals });
  else res.render("fornimda/addJournal");
});

//journals -- POST /journals
router.post(
  "/addJournal",
  adminAuth,
  upload.single("author-img"),
  async (req, res, next) => {
    const {
      title,
      type,
      author,
      authorBatch,
      occupation,
      journalName,
      description,
      journalLink,
    } = req.body;
    const publishedAt = Date.now();

    let compressedImgPath = path.join(
      __dirname,
      "../",
      "public/images/journal",
      new Date().getTime() + ".jpg"
    );

    let imageLink = "/images/journal/author.png";

    if (req.file !== undefined) {
      sharp(req.file.path)
        .resize(640, 480, {
          fit: "inside",
        })
        .jpeg({
          quality: 70,
          chromaSubsampling: "4:4:4",
        })
        .toFile(compressedImgPath, (err, info) => {
          if (err) {
            console.log(err);
            req.flash("error_msg", "image can't be compressed");
            res.redirect("back");
          } else {
            fs.unlink(req.file.path, (err) => {
              console.log(err);
              req.flash("error_msg", "cannot delete image");
              res.redirect("back");
            });
          }
        });

      imageLink = compressedImgPath.substring(
        compressedImgPath.search(/images/),
        compressedImgPath.length
      );
    }

    let socialLinks = req.body.socialLinks.map((link, i) => {
      let media = "facebook";
      if (i === 1) media = "linkedin";
      else if (i === 2) media = "github";
      return { media, link };
    });

    const journal = new Journals({
      title,
      type,
      author,
      authorBatch,
      image: imageLink,
      socialLinks,
      occupation,
      journalName,
      description,
      journalLink,
      publishedAt,
    });

    try {
      await journal.save();
      req.flash("success_msg", "Journal added successfully");
      res.redirect("./journals");
    } catch (error) {
      console.log(error);
      req.flash("error_msg", error._message);
      res.redirect("back");
    }
  }
);

// journals -- DELETE /journalid
router.post("/journals/:journalid", adminAuth, async (req, res, next) => {
  let id = req.params.journalid;
  try {
    let result = await Journals.findByIdAndDelete(id);

    var url_del = "public/" + result.image;

    fs.access(url_del, (err) => {
      if (err) {
        console.log(err);
        req.flash("error_msg", "no such file or directory");
        res.redirect("back");
      }
      fs.unlink(url_del, (err) => {
        if (err) {
          console.log(err);
          req.flash("error_msg", "error deleting the file.");
          res.redirect("back");
        }
      });
    });

    req.flash("success_msg", "Journal deleted successfully");
    res.redirect("back");

  } catch (error) {
    console.log(error);
    req.flash("error_msg", error._message);
    res.redirect("back");
  }
});

//study materials -- GET /studyMaterials
router.get("/studyMaterials", adminAuth, async (req, res, next) => {
  const studyData = await StudyMat.find().sort({ _id: -1 }).limit(10);
  res.render("fornimda/addStudy", { studyData });
});

//study materials -- POST /studyMaterials
router.post("/addStudy", adminAuth, async (req, res, next) => {
  let { category, weblinks, subjects } = req.body;

  category = category.split(",");
  weblinks = weblinks.filter((item) => item.title.length !== 0);
  subjects = subjects.filter((item) => item.subname.length !== 0);

  const studyData = await StudyMat.findOne({ category });

  if (studyData === null || studyData.length === 0) {
    const newStudy = new StudyMat({
      category,
      weblinks,
      subjects,
    });

    try {
      await newStudy.save();
      res.redirect("/3U0bzsE9e1mQBuIW/studyMaterials");
    } catch (error) {
      console.log(error);
      req.flash("error_msg", error._message);
      res.redirect("back");
    }
  } else {
    let newWebLinks = studyData.weblinks.concat(weblinks),
      newSubjects = studyData.subjects.concat(subjects);
    try {
      await StudyMat.findOneAndUpdate(
        { category },
        { weblinks: newWebLinks, subjects: newSubjects }
      );
      res.redirect("/3U0bzsE9e1mQBuIW/studyMaterials");
    } catch (error) {
      console.log(error);
      req.flash("error_msg", error._message);
      res.redirect("back");
    }
  }
});

module.exports = router;
