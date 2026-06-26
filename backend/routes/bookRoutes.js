const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
} = require("../controllers/bookController");
console.log({
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  protect,
});

router.get("/", getBooks);
router.post("/", protect, addBook);
router.delete("/:id", protect, deleteBook);
router.put("/:id", protect, updateBook);

module.exports = router;