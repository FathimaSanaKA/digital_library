const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
} = require("../controllers/bookController");

router.get("/", getBooks);
router.post("/", protect, addBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;