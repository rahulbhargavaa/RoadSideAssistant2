// routes/adminRoutes.js
// Routes for admin panel: dashboard, manage users, manage requests, analytics

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const {
  getAdminDashboard,
  getManageUsersPage,
  getAllUsers,
  deleteUser,
  getManageRequestsPage,
  getAnalyticsPage,
} = require('../controllers/adminController');

// All routes below require login AND admin role
router.get('/admin/dashboard', protect, isAdmin, getAdminDashboard);
router.get('/admin/users', protect, isAdmin, getManageUsersPage);
router.get('/admin/requests', protect, isAdmin, getManageRequestsPage);
router.get('/admin/analytics', protect, isAdmin, getAnalyticsPage);

// Admin API routes for AJAX calls
router.get('/api/admin/users', protect, isAdmin, getAllUsers);
router.delete('/api/admin/users/:id', protect, isAdmin, deleteUser);

module.exports = router;
