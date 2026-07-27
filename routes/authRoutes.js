// routes/authRoutes.js
// Routes related to authentication: register, login, logout (user + admin)

const express = require('express');
const router = express.Router();

const {
  showRegisterPage,
  showLoginPage,
  registerUser,
  loginUser,
  showAdminLoginPage,
  loginAdmin,
  logoutUser,
} = require('../controllers/authController');

// Page routes
router.get('/register', showRegisterPage);
router.get('/login', showLoginPage);
router.get('/admin/login', showAdminLoginPage);
router.get('/logout', logoutUser);

// Form submission routes
router.post('/api/auth/register', registerUser);
router.post('/api/auth/login', loginUser);
router.post('/api/auth/admin-login', loginAdmin);

module.exports = router;
