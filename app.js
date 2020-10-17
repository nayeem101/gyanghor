const express = require("express");
// const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

// require('dotenv').config();

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const app = express();

//passport config
const passport = require("./config/passport");

//dev logger
// app.use(morgan("dev"));

//DB config
// const dburi = require("./config/keys").MongoURI;
const dburi = process.env.ATLAS_URI;
//Connect to Mongo
mongoose.connect(dburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  autoIndex: true
});

const db = mongoose.connection;
//error handle
db.on("error", (err) => {
  console.log("db error:", err);
});

db.once("open", () => {
  console.log("Database Connection Established");
});

//Bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//cookie parser
app.use(cookieParser());

//session store in db
const sessionStore = new MongoStore({
  mongooseConnection: db,
  collection: "sessions",
});

//express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 3, // ms * seconds * mins * hours * days
    },
  })
);

//passport
app.use(passport.initialize());
app.use(passport.session());

//EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/views"));

//set public assets with cachesing for 1 day
// app.use(express.static(__dirname + "/public", {maxAge: 1000 * 60 * 60 * 24 * 1}));
app.use(express.static(__dirname + "/public"));

//flash msg
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//ROUTES
app.use("/", require("./routes"));
app.use("/users", require("./routes/user"));
app.use("/3U0bzsE9e1mQBuIW", require("./routes/p4mdSMmvw5OLupFg"));
app.use("/ebooks", require("./routes/ebooks"));
app.use("/blogs", require("./routes/blogs"));
app.use("/journals", require("./routes/journals"));
app.use("/study", require("./routes/study"));

//404 not found
app.use((req, res, next) => {
  res.status(404).render("err_404");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started http://localhost:${PORT}`));

//TODO
//?from -- admin render route in index fetch all users data and pass to the view

//* add a feature in ebook most read section
//* add more in home page
//* fix the redirect previous page after login
//* add user profile (last)