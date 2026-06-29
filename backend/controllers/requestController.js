const Request = require("../models/Request");
const Book = require("../models/book");

// ==========================
// CREATE BORROW REQUEST
// ==========================
const createRequest = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (book.status !== "Available") {
      return res.status(400).json({
        message: "Book is not available",
      });
    }

    // Don't allow owner to borrow own book
    if (book.owner.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot borrow your own book",
      });
    }

    // Check if request already exists
    const existing = await Request.findOne({
      book: bookId,
      requester: req.user.id,
      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    const request = await Request.create({
      book: book._id,
      requester: req.user.id,
      owner: book.owner,
    });

    // Update book status
    book.status = "Requested";
    await book.save();

    res.status(201).json(request);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// OWNER VIEW REQUESTS
// ==========================
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      owner: req.user.id,
    })
      .populate("book")
      .populate("requester", "name email");

    res.json(requests);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// ACCEPT REQUEST
// ==========================
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("book");

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    request.status = "Accepted";
    request.borrowUntil = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    );

    await request.save();

    const book = await Book.findById(request.book._id);

    book.status = "Borrowed";
    book.borrowedBy = request.requester;
    book.borrowUntil = request.borrowUntil;

    await book.save();

    res.json({
      message: "Request Accepted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// REJECT REQUEST
// ==========================
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    request.status = "Rejected";
    await request.save();

    const book = await Book.findById(request.book);

    book.status = "Available";
    await book.save();

    res.json({
      message: "Request Rejected",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
};