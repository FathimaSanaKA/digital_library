const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
  borrowBook,
  returnBook
} = require("../controllers/bookController");

router.get("/", getBooks);
router.post("/", protect, addBook);
router.delete("/:id", protect, deleteBook);
router.put("/:id", protect, updateBook);

// New Borrow/Return Action Routes
router.post("/:id/borrow", protect, borrowBook);
router.post("/:id/return", protect, returnBook);

module.exports = router;