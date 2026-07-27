# Road Side Assistance Management System

A complete full-stack **Road Side Assistance Management System** built with Node.js, Express, MongoDB, Mongoose and EJS. This project was developed as a ** College Project**.

Users can register, request roadside help (flat tyre, towing, battery jump start, fuel delivery, etc.), and track their request status in real time. Admins can manage users, approve/reject/assign requests, and view analytics through interactive charts.

---

## Tech Stack

**Frontend:** EJS, Bootstrap 5, HTML5, CSS3, Vanilla JavaScript, Font Awesome, Google Fonts (Poppins)
**Backend:** Node.js, Express.js
**Database:** MongoDB with Mongoose
**Authentication:** JWT + bcryptjs (password hashing)
**File Uploads:** Multer (profile pictures)
**Other:** Helmet (security headers), SweetAlert2 (alerts), Chart.js (analytics)

---

## Project Structure

```
RoadSideAssistant/
├── config/            # Database connection
├── controllers/        # Route logic (auth, admin, user, service)
├── middleware/          # Auth, Admin, Upload middleware
├── models/              # Mongoose schemas (User, ServiceRequest, Notification)
├── routes/              # Express routers
├── public/              # Static assets (css, js, images, uploads)
├── views/               # EJS templates (partials, admin, user pages)
├── server.js            # App entry point
├── seed.js              # Database seeder script
├── package.json
└── .env.example
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally and running, OR a MongoDB Atlas connection string

### Steps

1. **Extract/Clone the project** and open a terminal inside the `RoadSideAssistant` folder.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   A `.env` file is already included with sensible defaults for local development. If needed, copy `.env.example` to `.env` and adjust values:
   ```bash
   cp .env.example .env
   ```
   Key variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/roadside_assistance
   JWT_SECRET=roadside_assistance_super_secret_key_2024
   JWT_EXPIRE=7d
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=Admin@123
   ```

4. **Make sure MongoDB is running** on your machine (or update `MONGO_URI` to point to your MongoDB Atlas cluster).

5. **(Recommended) Seed the database** with sample data — 1 admin, 20 users, and 35 service requests:
   ```bash
   npm run seed
   ```

6. **Start the application:**
   ```bash
   npm run dev
   ```
   The server will start on **http://localhost:5000**

---

## Default Login Credentials (after seeding)

### Admin Login (`/admin/login`)
```
Email:    admin@gmail.com
Password: Admin@123
```

### Sample User Login (`/login`)
```
Email:    rahul1@example.com
Password: User@123
```
(All 20 seeded users share the password `User@123` — emails follow the pattern `firstname{n}@example.com`, e.g. `priya2@example.com`, `amit3@example.com`, etc.)

You can also register a brand new account from the **Register** page at any time.

---

## Features

### User Features
- Register / Login / Logout (JWT-based sessions via httpOnly cookies)
- Dashboard with request statistics and notifications
- Create a new service request (8 service types supported)
- Track all requests with live status badges
- Cancel a pending/approved request
- View request history (completed/rejected/cancelled)
- Update profile details and upload a profile picture
- Change password

### Admin Features
- Separate Admin Login
- Dashboard with platform-wide statistics
- Manage Users: search and delete users (AJAX + pagination)
- Manage Requests: search, filter by status, approve/reject, assign mechanic, set ETA, mark completed, delete (AJAX + pagination)
- Analytics page with Chart.js (status breakdown, service type breakdown, requests over time)

### Security
- Passwords hashed with bcryptjs
- JWT authentication stored in httpOnly cookies
- Route protection middleware (`protect`) and admin-only middleware (`isAdmin`)
- Helmet for secure HTTP headers
- Server-side input validation on all forms

---

## Available Scripts

| Command         | Description                                  |
|------------------|-----------------------------------------------|
| `npm run dev`    | Start the server with nodemon (auto-restart)  |
| `npm start`      | Start the server in production mode           |
| `npm run seed`   | Clear and reseed the database with sample data|

---

## Notes

- Uploaded profile pictures are stored in `public/uploads/` and served statically.
- All service request statuses: `Pending`, `Approved`, `Rejected`, `Mechanic Assigned`, `On The Way`, `Completed`, `Cancelled`.
- This project uses MVC architecture: Models (Mongoose schemas), Views (EJS templates), Controllers (business logic), and Routes (URL mapping).

---

## Author

Developed as a Project — Road Side Assistance Management System.
