const dns = require('node:dns');
// Force Node to process IPv4 lookups first to prevent online MongoDB Atlas DNS resolution crashes
dns.setDefaultResultOrder('ipv4first'); 

const path = require('path');
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

// Initialize environment configuration rules
dotenv.config();
console.log("Initializing database connection with target cluster URI...");
connectDB();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// 1. Host Production Frontend Static Assets
// Maps access calls directly to the 'dist' directory compiled from your React frontend
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Base API Router Integrations
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);

// 3. Fallback Catchall SPA Router Handler
// Ensures client-side routing sub-pages map directly back to the React application instance
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// App Engine standard configuration binds to port 8080 by default in cloud spaces
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST,  () => {
  console.log(`Server running successfully on port ${PORT}`);
}); 