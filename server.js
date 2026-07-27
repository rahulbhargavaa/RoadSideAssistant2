// server.js
// Entry point of the Road Side Assistance Management System

require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const helmet = require('helmet');

const connectDB = require('./config/database');
const { attachUser } = require('./middleware/authMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');

const app = express();

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware - relaxed CSP so that CDN scripts/styles (Bootstrap, FontAwesome, Chart.js, SweetAlert2) work
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled to allow CDN resources for this college project
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Attach logged-in user (if any) to res.locals for all views (navbar needs this)
app.use(attachUser);

// ================= PAGE ROUTES ================= //

// Homepage
app.get('/', (req, res) => {
  res.render('index', { title: 'Road Side Assistance' });
});

// About & Contact
app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

// ================= FEATURE ROUTES ================= //
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use('/', serviceRoutes);

// ================= 404 HANDLER ================= //
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ================= GLOBAL ERROR HANDLER ================= //
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).send('Something broke! Please try again later.');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Mobile: http://192.168.1.7:${PORT}`);
});