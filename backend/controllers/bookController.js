const Book = require("../models/book");

// =========================
// GET ALL BOOKS
// =========================
const getBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate("owner", "name email")
      .populate("borrowedBy", "name email");

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// ADD BOOK
// =========================
const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      image,
      category,
      genre,
    } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      image,
      category,
      genre,
      owner: req.user.id,
    });

    const newBook = await Book.findById(book._id)
      .populate("owner", "name email");

    res.status(201).json(newBook);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// UPDATE BOOK
// =========================
const updateBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      image,
      category,
      genre,
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Only owner can edit
    if (book.owner.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    book.title = title;
    book.author = author;
    book.description = description;
    book.image = image;
    book.category = category;
    book.genre = genre;

    await book.save();

    res.json(book);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// DELETE BOOK
// =========================
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Only owner can delete
    if (book.owner.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await book.deleteOne();

    res.json({
      message: "Book deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
};