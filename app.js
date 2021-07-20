var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const routes = require("./routes/index");
const books = require("./routes/books");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/books", books);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(err.status).render("page-not-found", { err });
  } else {
    err.status = 500;
    err.message = "Internal Server Error";
    res.status(err.status);
    res.render("error", { err });
  }

  console.error(err.status, err.message);
});

module.exports = app;
