const Book = require("../models/book");

// GET all books
const getBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};

// ADD a new book (Saves the contributor's ID as the owner)
const addBook = async (req, res) => {
  try {
    const { title, author, description } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      owner: req.user.id, // Attached automatically via authMiddleware validation step
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a book (Enforces Owner Guard)
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Authorization verification: Check string values of database IDs
    if (book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized. Only the creator of this title can modify it." });
    }

    const { title, author, description } = req.body;
    
    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a book (Enforces Owner Guard)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Authorization verification
    if (book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized. Only the creator of this title can delete it." });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book successfully removed from the global catalog." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Borrow/Return controllers remain unchanged
const borrowBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.available) return res.status(400).json({ message: "Book is already borrowed" });

    book.available = false;
    book.borrowedBy = req.user.id;
    await book.save();
    res.json({ message: "Book successfully borrowed", book });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.borrowedBy?.toString() !== req.user.id) return res.status(401).json({ message: "Unauthorized return attempt" });

    book.available = true;
    book.borrowedBy = null;
    await book.save();
    res.json({ message: "Book successfully returned", book });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getBooks, addBook, deleteBook, updateBook, borrowBook, returnBook };