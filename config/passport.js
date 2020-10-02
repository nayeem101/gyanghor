const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

//load User model
const User = require("../models/User");
//admin model
const Admin = require("../models/Admin");

//? user auth
passport.use(
  "user-local",
  new LocalStrategy({ usernameField: "email" }, async function (email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      //check for user
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }

      //check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password Incorrect" });
      }
    } catch (error) {
      console.log("from passport:", error);
      return done(error);
    }
  })
);

//? admin auth
passport.use(
  "admin-local",
  new LocalStrategy({ usernameField: "username" }, async function (
    username,
    password,
    done
  ) {
    try {
      const admin = await Admin.findOne({ username });
      //check for user
      if (!admin) {
        return done(null, false, { message: "User not found" });
      }
      //check password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        return done(null, admin);
      } else {
        return done(null, false, { message: "Password Incorrect" });
      }
    } catch (error) {
      console.log("from passport:", error);
      return done(error);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    const admin = await Admin.findById(id).exec();
    if (admin && !user) {
      done(null, { id: admin.id, name: admin.fullname, role: "admin" });
    } else if (!admin && user) {
      done(null, { id: user.id, name: user.firstname, role: "user" });
    } else {
      return done("user not found", null);
    }
  } catch (err) {
    console.log(err);
    done(err);
  }
});

module.exports = passport;
