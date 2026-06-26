const Book = require("../models/book");

// GET all books
const getBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};

// ADD a new book
const addBook = async (req, res) => {
  const { title, author, description } = req.body;

  const book = await Book.create({
    title,
    author,
    description,
  });

  res.status(201).json(book);
};


const deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted" });
};
const updateBook = async (req, res) => {
  const { title, author, description } = req.body;

  const book = await Book.findByIdAndUpdate(
    req.params.id,
    {
      title,
      author,
      description,
    },
    { new: true }
  );

  res.json(book);
};
module.exports = {
  getBooks,
  addBook,
  deleteBook,
  updateBook,
};