var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const asyncHandler = require("../misc");

// error handler
const errorHandler = (errStatus, msg) => {
  const err = new Error(msg);
  err.status = errStatus;
  throw err;
};

/* GET home page. Shows list of paginated books */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    //get the page num in the url if no page num yet set to 0
    const page = req.query.page;

    // redirects to page=1 of results
    !page || page <= 0 ? res.redirect("?page=1") : null;

    const booksPerPage = 10;

    const { count, rows } = await Book.findAndCountAll({
      order: [["title", "ASC"]],
      limit: booksPerPage,
      offset: (page - 1) * booksPerPage,
    });

    //getting the num of pages for pagination
    const numOfPages = Math.ceil(count / booksPerPage);

    // redirects to last page of results if user enter a get request larger than numOfPages
    page > numOfPages ? res.redirect(`?page=${numOfPages}`) : null;

    let pageLinks = 1;

    res.render("books/index", {
      books: rows,
      title: "All Books",
      numOfPages,
      pageLinks,
    });
  })
);

router.get(
  "/search",
  asyncHandler(async (req, res) => {
    // get the term term
    const { term } = req.query;

    //get the page num in the url if no page num yet set to 0
    let page = req.query.page;

    // redirects to page=1 of results
    !page || page <= 0 ? res.redirect(`search?term=${term}&page=1`) : null;

    // number of books per page
    const booksPerPage = 10;

    const { count, rows } = await Book.findAndCountAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${term}%`,
            },
          },
          {
            author: {
              [Op.like]: `%${term}%`,
            },
          },
          {
            genre: {
              [Op.like]: `%${term}%`,
            },
          },
          {
            year: {
              [Op.like]: `%${term}%`,
            },
          },
        ],
      },
      limit: booksPerPage,
      offset: (page - 1) * booksPerPage,
    });

    if (count > 0) {
      let pageLinks = 1;

      //getting the num of pages for pagination
      const numOfPages = Math.ceil(count / booksPerPage);

      // redirects to last page of results if user enter a get request larger than numOfPages
      page > numOfPages
        ? res.redirect(`?term=${term}&page=${numOfPages}`)
        : null;

      res.render("books/index", {
        books: rows,
        title: "Search",
        pageLinks,
        term,
        numOfPages,
      });
      console.log(term);
    } else {
      res.render("books/no-results", { term, title: "Search" });
    }
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
      errorHandler(404, "Page Not Found");
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
      errorHandler(404, "Page Not Found");
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
      errorHandler(404, "Page Not Found");
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
      errorHandler(404, "Page Not Found");
    }
  })
);

module.exports = router;
