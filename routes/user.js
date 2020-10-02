const router = require("express").Router();
const bcrypt = require("bcryptjs");
const validator = require("validator");

//user model
const User = require("../models/User");
const passport = require("passport");

//get - users/login
router.get("/login", (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "user") res.render("foruser/login");
  else res.redirect("/");
});

//get - users/register
router.get("/register", (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "user") res.render("foruser/register");
  else res.redirect("/");
});

//post - users/register
router.post("/register", async (req, res, next) => {
  const {
    firstname,
    lastname,
    department,
    batch,
    session,
    email,
    mobile,
    password,
    password2,
  } = req.body;
  let errors = [];

  //check required fields
  if (
    !firstname ||
    !lastname ||
    !department ||
    !batch ||
    !session ||
    !email ||
    !mobile ||
    !password ||
    !password2
  ) {
    errors.push({ msg: "Please fill all fields" });
  }

  if (!validator.isEmail(email)) {
    errors.push({ msg: "Invalid email address" });
  }
  if (!validator.isMobilePhone(mobile, "bn-BD")) {
    errors.push({ msg: "Invalid mobile Number" });
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
    res.render("foruser/register", {
      errors,
      firstname,
      lastname,
      department,
      batch,
      session,
      email,
      mobile,
    });
  } else {
    //validation passed
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        //user exists
        errors.push({ msg: "Email is already registered" });
        res.render("foruser/register", {
          errors,
          firstname,
          lastname,
          department,
          batch,
          session,
          email,
          mobile,
        });
      } else {
        //saving user to db
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({
          firstname,
          lastname,
          email,
          mobile,
          department,
          session,
          batch,
          password: hash,
        });
        await newUser.save();
        req.flash("success_msg", "You are now registered and can login");
        res.redirect("./login");
        //console.log(newUser);
      }
    } catch (error) {
      errors.push({ msg: error.message });
      console.log(error);
      res.render("foruser/register", {
        errors,
        firstname,
        lastname,
        email,
        mobile,
        department,
        session,
        batch,
      });
    }
  }
});

//login handle
router.post("/login", async (req, res, next) => {
  passport.authenticate("user-local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
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
  res.redirect("/users/login");
});

module.exports = router;
