module.exports = {
  //user auth
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "user") {
      return next();
    }
    req.flash("error_msg", "You have to login to first.");
    res.redirect("/users/login");
  },
  //admin auth
  adminAuth: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    console.log(req.user);
    req.flash("error_msg", "Authentication failed");
    res.redirect("/3U0bzsE9e1mQBuIW/ByRVZOXPZsitU9oF");
  },
};
