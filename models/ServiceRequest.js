// models/ServiceRequest.js
// Mongoose schema for Service Requests raised by users

const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: [
        'Flat Tyre',
        'Battery Jump Start',
        'Fuel Delivery',
        'Engine Problem',
        'Towing',
        'Accident Help',
        'Brake Issue',
        'Vehicle Lockout',
      ],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['Car', 'Bike', 'Truck', 'Bus', 'Other'],
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'Mechanic Assigned',
        'On The Way',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },
    assignedMechanic: {
      type: String,
      default: '',
    },
    estimatedTime: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
