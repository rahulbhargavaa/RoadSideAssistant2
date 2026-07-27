// middleware/authMiddleware.js
// Verifies JWT token stored in cookies and attaches the logged in user to req.user

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - user must be logged in (used for pages/API that only need login)
const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // If it's an API/AJAX request, respond with JSON
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'Not authorized, please login' });
      }
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }
      return res.redirect('/login');
    }

    req.user = currentUser;
    res.locals.user = currentUser; // make available in EJS views
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Attach user to res.locals if logged in, but do not block access (for public pages like homepage)
const attachUser = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('-password');
      if (currentUser) {
        req.user = currentUser;
        res.locals.user = currentUser;
      }
    } else {
      res.locals.user = null;
    }
  } catch (error) {
    res.locals.user = null;
  }
  next();
};

module.exports = { protect, attachUser };
