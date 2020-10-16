const router = require("express").Router();

//models
const Department = require("../models/Department");
const StudyMat = require("../models/StudyMat");

//get study dept GET /
router.get("/", async (req, res, next) => {
  const pageNum = parseInt(req.query.page, 10);
  try {
    const departments = await Department.paginate(
      {},
      {
        page: pageNum || 1,
        limit: 6,
        sort: { _id: 1 },
      }
    );
    const { docs, page, pages } = departments;
    if (req.isAuthenticated() && req.user.role === "user") {
      res.render("foruser/departments", {
        departments: docs,
        route: "study",
        isLogedIn: true,
        username: req.user.name,
        page,
        pages,
      });
    } else {
      res.render("foruser/departments", {
        departments: docs,
        route: "study",
        isLogedIn: false,
        page,
        pages,
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

router.get("/:dept", async (req, res, next) => {
  const dept = req.params.dept;
  try {
    const deptName = await Department.findOne({ shortName: dept }, { name: 1, _id: 0 });
    let allWebLinks = [],
      allSubjects = [];
    const studyInfo = await StudyMat.find({ category: dept }).exec();
    studyInfo.forEach((data) => {
      let { weblinks, subjects } = data;
      allWebLinks.push(...weblinks);
      allSubjects.push(...subjects);
    });

    //res.send({allSubjects,allWebLinks});
    if (req.isAuthenticated() && req.user.role === "user")
      res.render("foruser/studymat", {
        deptName,
        allSubjects,
        allWebLinks,
        isLogedIn: true,
        username: req.user.name,
      });
    else
      res.render("foruser/studymat", {
        deptName,
        allSubjects,
        allWebLinks,
        isLogedIn: false,
      });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

module.exports = router;
