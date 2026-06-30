const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check for token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token (Make sure JWT_SECRET is defined in your .env file)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user data to the request object
      req.user = decoded; 

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// This must match the destructuring import in bookRoutes.js!
module.exports = { protect };