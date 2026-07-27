// controllers/authController.js
// Handles Register, Login, Logout for both normal users and admin

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Helper to send token as an httpOnly cookie
const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  };
  res.cookie('token', token, cookieOptions);
};

// @desc    Show register page
// @route   GET /register
const showRegisterPage = (req, res) => {
  res.render('register', { title: 'Register', error: null, formData: {} });
};

// @desc    Show login page
// @route   GET /login
const showLoginPage = (req, res) => {
  res.render('login', { title: 'Login', error: null });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword, address, vehicleType, vehicleNumber } = req.body;

    // Basic validation
    if (!name || !email || !mobile || !password) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Please fill all required fields',
        formData: req.body,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Passwords do not match',
        formData: req.body,
      });
    }

    if (password.length < 6) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Password must be at least 6 characters long',
        formData: req.body,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Email is already registered. Please login.',
        formData: req.body,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      address: address || '',
      vehicleType: vehicleType || 'Car',
      vehicleNumber: vehicleNumber || '',
      role: 'user',
    });

    const token = generateToken(newUser._id);
    sendTokenCookie(res, token);

    return res.redirect('/user/dashboard');
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).render('register', {
      title: 'Register',
      error: 'Something went wrong. Please try again.',
      formData: req.body,
    });
  }
};

// @desc    Login user (normal users only, not admin)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/user/dashboard');
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).render('login', {
      title: 'Login',
      error: 'Something went wrong. Please try again.',
    });
  }
};

// @desc    Show admin login page
// @route   GET /admin/login
const showAdminLoginPage = (req, res) => {
  res.render('admin/login', { title: 'Admin Login', error: null });
};

// @desc    Login admin
// @route   POST /api/auth/admin-login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('admin/login', {
        title: 'Admin Login',
        error: 'Please provide email and password',
      });
    }

    const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin' });

    if (!admin) {
      return res.status(400).render('admin/login', {
        title: 'Admin Login',
        error: 'Invalid admin credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).render('admin/login', {
        title: 'Admin Login',
        error: 'Invalid admin credentials',
      });
    }

    const token = generateToken(admin._id);
    sendTokenCookie(res, token);

    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    return res.status(500).render('admin/login', {
      title: 'Admin Login',
      error: 'Something went wrong. Please try again.',
    });
  }
};

// @desc    Logout user/admin
// @route   GET /logout
const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};

module.exports = {
  showRegisterPage,
  showLoginPage,
  registerUser,
  loginUser,
  showAdminLoginPage,
  loginAdmin,
  logoutUser,
};
