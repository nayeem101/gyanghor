const router = require("express").Router();
//models
const Department = require("../models/Department");
const Ebooks = require("../models/Ebooks");

//for users
// ebooks -- GET /ebooks
//departments -- GET /departments
router.get("/", async (req, res, next) => {
  try {
    const departments = await Department.find().limit(10);

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
    if (req.isAuthenticated() && req.user.role === "user") {
      res.render("foruser/departments", {
        departments,
        isLogedIn: true,
        username: req.user.name,
        route: "ebooks",
      });
    } else {
      res.render("foruser/departments", {
        departments,
        isLogedIn: false,
        route: "ebooks",
      });
    }
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error._message);
    res.redirect("back");
  }
});

// ebooks -- GET /ebooks/:department
router.get("/:department", async (req, res, next) => {
  const dept = req.params.department;
  const pageNum = parseInt(req.query.page, 10);
  try {
    const ebooks = await Ebooks.paginate(
      { category: dept },
      {
        page: pageNum || 1,
        limit: 6,
        sort: { _id: 1 },
      }
    );

    const deptName = await Department.find({ shortName: dept }, { name: 1 });

    const { docs, page, pages } = ebooks;
    const recents = await Ebooks.find({category: dept }, { id: 1, name: 1 }).sort({ _id: 1 }).limit(5);
    
    const data = {
      docs,
      page,
      pages,
      deptName: deptName[0].name,
      recents,
    };
    if (docs.length !== 0) {
      if (req.isAuthenticated() && req.user.role === "user")
        res.render("foruser/ebooklist", {
          data,
          isLogedIn: true,
          username: req.user.name,
        });
      else res.render("foruser/ebooklist", { data, isLogedIn: false });
    } else {
      res.redirect("/ebooks");
    }
  } catch (error) {
    console.log("ebook error", error);
    res.redirect("back");
  }
});

//single ebook -- GET /ebooks/:department?id
router.get("/singlebook/:bookID", async (req, res, next) => {
  const bookID = req.params.bookID;
  try {
    const ebook = await Ebooks.findById({ _id: bookID });

    let related = await Ebooks.find(
      { category: { $in: ebook.category } },
      { link: 0, details: 0, dlink: 0, publisher: 0 }
    )
      .sort({ _id: -1 })
      .limit(5);

    related = related.filter((book) => book.id !== ebook.id);

    if (req.isAuthenticated() && req.user.role === "user") {
      res.render("foruser/single-ebook", {
        ebook,
        related,
        isLogedIn: true,
        username: req.user.name,
      });
    } else {
      res.render("foruser/single-ebook", { ebook, related, isLogedIn: false });
    }
  } catch (error) {
    console.log("ebook error", error);
    res.redirect("back");
  }
});

module.exports = router;
