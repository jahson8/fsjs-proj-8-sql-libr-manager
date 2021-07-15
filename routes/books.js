var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const asyncHandler = require("../misc");

/* GET home page. Shows the full list of books */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    //get the page num in the url if no page num yet set to 0
    const page = req.query.page || 0;
    const booksPerPage = 10;

    // Calculate offset
    const offset = page * booksPerPage;

    const { count, rows } = await Book.findAndCountAll({
      order: [["title", "ASC"]],
      limit: booksPerPage,
      offset: offset,
    });

    //getting the num of pages for pagination
    const numOfPages = Math.ceil(count / booksPerPage);

    //creates an array to iterate through in pug for the pag links
    const pagLinksArr = [];
    for (let i = 1; i <= numOfPages; i++) {
      pagLinksArr.push(i);
    }

    res.render("books/index", { books: rows, title: "All Books", pagLinksArr });
  })
);

/* shows create  book form*/
router.get("/new", (req, res) => {
  res.render("books/new-book", { title: "New Book" });
});

/* Posts Create book*/
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error

        book = await Book.build(req.body);
        res.render("books/new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error; // error caught in the asyncHandler's catch block
      }
    }
  })
);

/* Shows book info*/
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      res.render("books/show-book", { book, title: "Book" });
    } else {
      res.sendStatus(404);
    }
  })
);

/* Shows book details form*/
router.get(
  "/:id/edit",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      res.render("books/update-book", { book, title: "Update Book" });
    } else {
      res.sendStatus(404);
    }
  })
);

/* Update Book info*/
router.post(
  "/:id/edit",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books/" + book.id);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct article gets updated
        res.render("books/update-book", {
          book,
          errors: error.errors,
          title: "Update Book",
        });
      } else {
        throw error; // error caught in the asyncHandler's catch block
      }
    }
  })
);

/* Delete Book  form*/
router.get(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      res.render("books/delete-book", { book, title: "Delete Book" });
    } else {
      res.sendStatus(404);
    }
  })
);

/* Delete individual book */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
