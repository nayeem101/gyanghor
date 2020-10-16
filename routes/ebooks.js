const router = require("express").Router();
//models
const Department = require("../models/Department");
const Ebooks = require("../models/Ebooks");

// dept with ebooks -- GET /
router.get("/", async (req, res, next) => {
  const pageNum = parseInt(req.query.page, 10);
  try {
    const departments = await Department.paginate(
      {},
      {
        page: pageNum || 1,
        limit: 8,
      }
    );
    const { docs, page, pages } = departments;
    if (docs.length !== 0) {
      for (let i = 0; i < docs.length; i++) {
        let curDept = docs[i];
        const totalBooks = await Ebooks.countDocuments({ category: curDept.shortName });
        docs[i] = {
          id: curDept.id,
          name: curDept.name,
          shortName: curDept.shortName,
          totalBooks: totalBooks || 0,
        };
      }
    }
    if (req.isAuthenticated() && req.user.role === "user") {
      res.render("foruser/departments", {
        departments: docs,
        page,
        pages,
        isLogedIn: true,
        username: req.user.name,
        route: "ebooks",
      });
    } else {
      res.render("foruser/departments", {
        departments: docs,
        page,
        pages,
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
    const recents = await Ebooks.find({ category: dept }, { id: 1, name: 1 })
      .sort({ _id: -1 })
      .limit(5);

    const data = {
      docs,
      page,
      pages,
      deptName: deptName[0].name,
      recents,
      dept,
    };
    if (docs.length !== 0) {
      if (req.isAuthenticated() && req.user.role === "user")
        res.render("foruser/ebooklist", {
          data,
          isLogedIn: true,
          username: req.user.name,
          route: "ebooks",
        });
      else res.render("foruser/ebooklist", { data, isLogedIn: false, route: "ebooks" });
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

// filter by semester -- GET /semesters/:department/:semester
router.get("/semesters/:dept/:semester", async (req, res, next) => {
  let dept = req.params.dept,
    semester = req.params.semester;

  if (semester && dept) {
    try {
      const ebooks = await Ebooks.find(
        { category: dept, semester: semester },
        { name: 1, writer: 1, pages: 1, category: 1, semester: 1 }
      ).limit(6);
      if (ebooks.length !== 0) res.json(ebooks);
      else res.status(404).json({ message: "No books found" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "internal server error" });
    }
  }
});

// escape special characters in search query
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
// search -- GET /search?query=''
router.get("/search/:dept", async (req, res, next) => {
  const dept = req.params.dept;
  if (req.query.title) {
    const regex = new RegExp(escapeRegex(req.query.title), "gi");
    // Get matched data from DB
    try {
      const data = await Ebooks.find(
        { category: dept, $text: { $search: regex } },
        { _id: 1, name: 1, score: { $meta: "textScore" } },
        { score: { $meta: "textScore" } }
      )
        .limit(5)
        .sort({ score: { $meta: "textScore" } });

      if (data.length !== 0) res.json(data);
      else res.json({ message: "No data found" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "server error" });
    }
  }
});
module.exports = router;
