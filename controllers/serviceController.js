// controllers/serviceController.js
// Handles all CRUD operations related to Service Requests
// Used by both the user side (create/cancel/view own) and admin side (manage all)

const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');

// @desc    Create a new service request
// @route   POST /api/services
// @access  Private (user)
const createServiceRequest = async (req, res) => {
  try {
    const { serviceType, vehicleType, vehicleNumber, location, description } = req.body;

    if (!serviceType || !vehicleType || !vehicleNumber || !location) {
      return res.status(400).render('request-service', {
        title: 'Request Service',
        error: 'Please fill all required fields',
        success: null,
      });
    }

    await ServiceRequest.create({
      userId: req.user._id,
      serviceType,
      vehicleType,
      vehicleNumber,
      location,
      description: description || '',
      status: 'Pending',
    });

    await Notification.create({
      userId: req.user._id,
      message: `Your ${serviceType} request has been submitted and is pending approval.`,
    });

    return res.render('request-service', {
      title: 'Request Service',
      error: null,
      success: 'Service request submitted successfully! Track it from the Track Request page.',
    });
  } catch (error) {
    console.error('Create Service Request Error:', error.message);
    return res.status(500).render('request-service', {
      title: 'Request Service',
      error: 'Something went wrong. Please try again.',
      success: null,
    });
  }
};

// @desc    Get all requests of logged in user (JSON, used for AJAX refresh on track page)
// @route   GET /api/services/my-requests
// @access  Private (user)
const getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Get My Requests Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel a request (only if it belongs to the user and is still Pending/Approved)
// @route   PUT /api/services/:id/cancel
// @access  Private (user)
const cancelServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    if (['Completed', 'Cancelled', 'Rejected'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a request that is already ${request.status}` });
    }

    request.status = 'Cancelled';
    await request.save();

    await Notification.create({
      userId: req.user._id,
      message: `Your ${request.serviceType} request has been cancelled.`,
    });

    res.status(200).json({ success: true, message: 'Request cancelled successfully', request });
  } catch (error) {
    console.error('Cancel Service Request Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ ADMIN SIDE OPERATIONS BELOW ============

// @desc    Get all requests (with optional filter + pagination) - used by admin panel
// @route   GET /api/services/all
// @access  Private (admin)
const getAllRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    let requestsQuery = ServiceRequest.find(filter)
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });

    let allRequests = await requestsQuery;

    // Simple search filter on vehicle number or user name/email (done in JS since it's populated data)
    if (search) {
      const searchLower = search.toLowerCase();
      allRequests = allRequests.filter((r) => {
        const nameMatch = r.userId && r.userId.name && r.userId.name.toLowerCase().includes(searchLower);
        const emailMatch = r.userId && r.userId.email && r.userId.email.toLowerCase().includes(searchLower);
        const vehicleMatch = r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch || vehicleMatch;
      });
    }

    const totalRecords = allRequests.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedRequests = allRequests.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      requests: paginatedRequests,
      totalPages,
      currentPage: Number(page),
      totalRecords,
    });
  } catch (error) {
    console.error('Get All Requests Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update request status (Approve / Reject / Assign Mechanic / Complete)
// @route   PUT /api/services/:id/status
// @access  Private (admin)
const updateRequestStatus = async (req, res) => {
  try {
    const { status, assignedMechanic, estimatedTime } = req.body;

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (status) request.status = status;
    if (assignedMechanic !== undefined) request.assignedMechanic = assignedMechanic;
    if (estimatedTime !== undefined) request.estimatedTime = estimatedTime;

    await request.save();

    await Notification.create({
      userId: request.userId,
      message: `Your ${request.serviceType} request status has been updated to "${request.status}".`,
    });

    res.status(200).json({ success: true, message: 'Request updated successfully', request });
  } catch (error) {
    console.error('Update Request Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a service request permanently (admin only)
// @route   DELETE /api/services/:id
// @access  Private (admin)
const deleteServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete Service Request Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createServiceRequest,
  getMyRequests,
  cancelServiceRequest,
  getAllRequests,
  updateRequestStatus,
  deleteServiceRequest,
};
