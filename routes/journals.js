const router = require("express").Router();

//blog model
const Journals = require("../models/Journals");

//get all journals GET /journals
router.get("/", async (req, res, next) => {
  const pageNum = parseInt(req.query.page, 10);
  try {
    const data = await Journals.paginate(
      {},
      {
        page: pageNum || 1,
        limit: 3,
        sort: { _id: -1 },
      }
    );

    if (req.isAuthenticated() && req.user.role === "user") {
      res.render("foruser/journals", { data, isLogedIn: true, username: req.user.name, });
    } else {
      res.render("foruser/journals", { data, isLogedIn: false });
    }
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

module.exports = router;
