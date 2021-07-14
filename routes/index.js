var express = require("express");
var router = express.Router();

/*. Redirects to /books */
router.get("/", (req, res, next) => {
  res.redirect("/books");
});

module.exports = router;
