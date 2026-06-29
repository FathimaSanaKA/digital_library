const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/requestController");

// Create Borrow Request
router.post("/", protect, createRequest);

// View My Incoming Requests
router.get("/", protect, getRequests);

// Accept Request
router.put("/accept/:id", protect, acceptRequest);

// Reject Request
router.put("/reject/:id", protect, rejectRequest);

module.exports = router;