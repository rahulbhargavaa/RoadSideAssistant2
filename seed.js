// seed.js
// Run with: npm run seed
// Clears existing data and inserts 1 admin, 20 users, and 35 service requests

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');

const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');
const Notification = require('./models/Notification');

const vehicleTypes = ['Car', 'Bike', 'Truck', 'Bus', 'Other'];
const serviceTypes = [
  'Flat Tyre',
  'Battery Jump Start',
  'Fuel Delivery',
  'Engine Problem',
  'Towing',
  'Accident Help',
  'Brake Issue',
  'Vehicle Lockout',
];
const cities = [
  'Jaipur, Rajasthan',
  'Jodhpur, Rajasthan',
  'Udaipur, Rajasthan',
  'Delhi',
  'Mumbai, Maharashtra',
  'Pune, Maharashtra',
  'Bangalore, Karnataka',
  'Ahmedabad, Gujarat',
  'Chandigarh',
  'Lucknow, Uttar Pradesh',
];

const firstNames = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Rohit', 'Kavita',
  'Suresh', 'Pooja', 'Manish', 'Neha', 'Sanjay', 'Divya', 'Arjun', 'Ritu',
  'Karan', 'Meena', 'Deepak', 'Swati',
];
const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Yadav', 'Joshi',
  'Mehta', 'Chauhan',
];

const mechanicNames = ['Ramesh Kumar', 'Suresh Mechanic', 'Vijay Auto Works', 'Speedy Repairs Team'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomVehicleNumber = () => {
  const states = ['RJ14', 'DL8C', 'MH12', 'KA05', 'UP32', 'GJ01'];
  const num = Math.floor(1000 + Math.random() * 9000);
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${randomFrom(states)} ${letters} ${num}`;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Notification.deleteMany({});

    // ---------------- Create Admin ----------------
    console.log('Creating admin account...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      mobile: '9999999999',
      password: hashedAdminPassword,
      address: 'Head Office, Jodhpur, Rajasthan',
      vehicleType: 'Car',
      vehicleNumber: 'RJ14 AA 0001',
      role: 'admin',
    });

    // ---------------- Create 20 Users ----------------
    console.log('Creating 20 users...');
    const users = [];
    const defaultPasswordHash = await bcrypt.hash('User@123', 10);

    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[i];
      const lastName = randomFrom(lastNames);
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}${i + 1}@example.com`,
        mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: defaultPasswordHash,
        address: randomFrom(cities),
        vehicleType: randomFrom(vehicleTypes),
        vehicleNumber: randomVehicleNumber(),
        role: 'user',
      });
      users.push(user);
    }

    // ---------------- Create 35 Service Requests ----------------
    console.log('Creating 35 service requests...');

    const statusPlan = [
      ...Array(10).fill('Pending'),
      ...Array(10).fill('Approved'),
      ...Array(5).fill('Rejected'),
      ...Array(10).fill('Completed'),
    ];

    for (let i = 0; i < statusPlan.length; i++) {
      const status = statusPlan[i];
      const randomUser = randomFrom(users);
      const serviceType = randomFrom(serviceTypes);

      const requestData = {
        userId: randomUser._id,
        serviceType,
        vehicleType: randomUser.vehicleType,
        vehicleNumber: randomUser.vehicleNumber,
        location: randomFrom(cities),
        description: `Need help with ${serviceType.toLowerCase()} issue. Please send assistance soon.`,
        status,
      };

      if (status === 'Approved' || status === 'Completed') {
        requestData.assignedMechanic = randomFrom(mechanicNames);
        requestData.estimatedTime = `${Math.floor(15 + Math.random() * 45)} mins`;
      }

      const createdRequest = await ServiceRequest.create(requestData);

      await Notification.create({
        userId: randomUser._id,
        message: `Your ${serviceType} request status is "${status}".`,
        read: Math.random() > 0.5,
      });
    }

    console.log('=================================================');
    console.log('SEED DATA CREATED SUCCESSFULLY!');
    console.log('=================================================');
    console.log(`Admin Login   -> Email: ${adminEmail}  Password: ${adminPassword}`);
    console.log('Sample User   -> Email: rahul1@example.com  Password: User@123');
    console.log('20 Users created | 35 Service Requests created');
    console.log('=================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
