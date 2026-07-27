// routes/serviceRoutes.js
// Routes for service request CRUD operations (used by both user and admin)

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const {
  createServiceRequest,
  getMyRequests,
  cancelServiceRequest,
  getAllRequests,
  updateRequestStatus,
  deleteServiceRequest,
} = require('../controllers/serviceController');

// User routes
router.post('/api/services', protect, createServiceRequest);
router.get('/api/services/my-requests', protect, getMyRequests);
router.put('/api/services/:id/cancel', protect, cancelServiceRequest);

// Admin routes (order matters - keep /all before /:id routes to avoid conflicts)
router.get('/api/services/all', protect, isAdmin, getAllRequests);
router.put('/api/services/:id/status', protect, isAdmin, updateRequestStatus);
router.delete('/api/services/:id', protect, isAdmin, deleteServiceRequest);

module.exports = router;
