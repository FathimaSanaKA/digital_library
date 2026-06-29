const authRoutes = require("./routes/authRoutes");

const bookRoutes = require("./routes/bookRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const requestRoutes = require("./routes/requestRoutes");
dotenv.config();
console.log(process.env.MONGO_URI);
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Digital Library Backend Running");
});

const PORT = process.env.PORT || 5000;

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});