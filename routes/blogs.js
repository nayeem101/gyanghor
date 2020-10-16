const router = require("express").Router();

// html sanitizer
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

//auth
const { ensureAuth } = require("../config/auth");
//blog model
const Blogs = require("../models/Blogs");

// all Blogs GET /
router.get("/", async (req, res, next) => {
  const pageNum = parseInt(req.query.page, 10);
  try {
    const { docs, page, pages } = await Blogs.paginate(
      {},
      {
        page: pageNum || 1,
        limit: 3,
        sort: { _id: -1 },
      }
    );

    //recent posts
    const recents = await Blogs.find({}, { id: 1, title: 1 }).sort({ _id: -1 }).limit(5);
    const mostRead = await Blogs.find({}, { id: 1, title: 1 })
      .sort({ view: -1 })
      .limit(5);

    const data = { docs, page, pages, recents, mostRead };

    if (req.isAuthenticated() && req.user.role === "user")
      res.render("foruser/blogs", { data, isLogedIn: true, username: req.user.name });
    else res.render("foruser/blogs", { data, isLogedIn: false });
  } catch (error) {
    console.log("ebook error", error);
    res.redirect("back");
  }
});

//get blogs by category GET /category
router.get("/category/:name", async (req, res, next) => {
  const pageNum = parseInt(req.query.page, 10);
  const category = req.params.name;
  try {
    const { docs, page, pages } = await Blogs.paginate(
      { category },
      {
        page: pageNum || 1,
        limit: 3,
        sort: { _id: -1 },
      }
    );

    //recent posts
    const recents = await Blogs.find({}, { id: 1, title: 1 }).sort({ _id: -1 }).limit(5);
    const mostRead = await Blogs.find({}, { id: 1, title: 1 })
      .sort({ view: -1 })
      .limit(5);

    const data = { docs, page, pages, recents, mostRead, category };

    if (req.isAuthenticated() && req.user.role === "user")
      res.render("foruser/blogs", { data, isLogedIn: true, username: req.user.name });
    else res.render("foruser/blogs", { data, isLogedIn: false });
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

//create post GET /create
router.get("/create", (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "user") {
    res.render("foruser/create-blog", { isLogedIn: true, username: req.user.name });
  } else {
    res.redirect("/blogs");
  }
});

//create post POST /create
router.post("/create", ensureAuth, async (req, res, next) => {
  let { title, category, description, details } = req.body;
  let createdBy = { authorID: req.user.id, author: req.user.name },
    createdAt = new Date().toDateString(),
    view = 0;
  //sanitize html
  const cleanDetails = DOMPurify.sanitize(details);

  const blog = new Blogs({
    title,
    category,
    description,
    createdBy,
    createdAt,
    details: cleanDetails,
    view,
  });

  try {
    await blog.save();
    res.redirect("/blogs");
  } catch (error) {
    let errors = [];
    errors.push({ msg: error._message });
    console.log(errors);
    res.render("foruser/create-blog", {
      title,
      category,
      description,
      errors,
      isLogedIn: true,
    });
  }
});

// get single blog GET /blogs/:id
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const blog = await Blogs.findOneAndUpdate({ _id: id }, { $inc: { view: 1 } });

    let similarBlogs = await Blogs.find({ category: blog.category }, { details: 0 })
      .sort({ _id: -1 })
      .limit(6);

    similarBlogs = similarBlogs.filter((sblog) => sblog.id !== blog.id);

    if (req.isAuthenticated() && req.user.role === "user") {
      const currentUserID = req.user.id;
      let editPost = currentUserID === blog.createdBy.authorID;
      res.render("foruser/single-blog", {
        blog,
        similarBlogs,
        isLogedIn: true,
        username: req.user.name,
        editPost,
      });
    } else {
      res.render("foruser/single-blog", { blog, similarBlogs, isLogedIn: false });
    }
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

//edit blog GET /edit/:id
router.get("/edit/:id", ensureAuth, async (req, res, next) => {
  const id = req.params.id;
  const currentUserID = req.user.id;
  console.log(id);
  try {
    const blog = await Blogs.findById(id);
    const { createdBy } = blog;
    if (currentUserID === createdBy.authorID)
      res.render("foruser/create-blog", {
        editPost: true,
        blog,
        username: req.user.name,
      });
    else res.redirect("back");
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

//update blog POST /update/:id
router.post("/update/:id", ensureAuth, async (req, res, next) => {
  const id = req.params.id;
  let { title, category, description, details } = req.body;
  let createdAt = new Date().toDateString();
  //sanitize html
  const cleanDetails = DOMPurify.sanitize(details);

  try {
    const result = await Blogs.updateOne(
      { _id: id },
      {
        $set: { title, category, description, details: cleanDetails, createdAt },
      }
    );
    console.log("blog update", {
      updated: result.n,
      modified: result.nModified,
      ok: result.ok,
    });
    res.redirect(`/blogs/${id}`);
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

//delete blog GET /delete/:id
router.get("/delete/:id", ensureAuth, async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await Blogs.deleteOne({ _id: id });
    console.log(result.ok, result.deletedCount);
    res.redirect("/blogs");
  } catch (error) {
    console.log(error);
    res.redirect("back");
  }
});

module.exports = router;
