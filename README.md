# 🚗 Smart Parking System
 
A full-stack web application for managing parking lots, slots, bookings, and payments — with real-time slot updates and an admin dashboard.

---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MySQL with Sequelize ORM |
| Real-time | Socket.IO |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Auth | JWT (JSON Web Tokens) |
 
---
 
## ✨ Features
 
- User registration and login with JWT authentication
- Browse available parking lots and select slots
- Book, view, and cancel parking slots
- Razorpay payment integration
- Booking confirmation emails sent automatically
- Real-time slot status updates via Socket.IO
- Admin dashboard with stats, revenue charts, and user management
- Auto-expiry of bookings every 5 minutes via cron jobs
---
 
## 📁 Project Structure
 
```
smart-parking-main/
├── backend/
│   ├── config/         # Database connection (Sequelize + MySQL)
│   ├── controllers/    # Route logic (auth, bookings, payments, admin)
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Sequelize models (User, Slot, Booking, Payment, ParkingLot)
│   ├── routes/         # Express API routes
│   ├── seeders/        # Seed script for dummy data
│   ├── utils/          # Mailer and cron jobs
│   └── server.js       # Entry point
└── frontend/
    ├── src/
    │   ├── pages/      # React pages (Login, Home, Booking, Admin, etc.)
    │   ├── components/ # Shared components
    │   ├── redux/      # Redux store and slices
    │   └── utils/      # Axios API config
    └── index.html
```
 
---
 
## ⚙️ Setup & Installation
 
### Prerequisites
- Node.js (v18+)
- MySQL
---
 
### 1. Clone the repository
 
```bash
git clone <your-repo-url>
cd smart-parking-main
```
 
---
 
### 2. Backend Setup
 
```bash
cd backend
npm install
```
 
Create a `.env` file in the `backend/` folder:
 
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_parking
JWT_SECRET=your_random_secret_string
 
# Optional — for Razorpay payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
 
# Optional — for booking confirmation emails
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
 
Create the MySQL database:
 
```bash
mysql -u root -p -e "CREATE DATABASE smart_parking;"
```
 
Start the backend (this auto-creates all tables):
 
```bash
npm run dev
```
 
Once you see `All models synced` and `Server running on http://localhost:5000`, open a new terminal and seed the database:
 
```bash
npm run seed
```
 
---
 
### 3. Frontend Setup
 
```bash
cd frontend
npm install
npm run dev
```
 
Frontend runs at **http://localhost:5173**
 
---
 
## 🔑 Default Login Credentials (after seeding)
 
| Role | Email | Password |
|---|---|---|
| Admin | rahul.sharma@gmail.com | admin123 |
| User | amit.kumar@yahoo.com | user123 |
 
> ⚠️ These are dummy credentials for local testing only. Change them before deploying.
 
---
 
## 📡 API Endpoints
 
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/lots` | Get all parking lots |
| GET | `/api/slots/lot/:lotId` | Get slots for a lot |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | Get my bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/admin/stats` | Admin dashboard stats |
 
---
 
## 📝 Notes
 
- The backend uses `sequelize.sync({ alter: true })` — it auto-creates and updates tables on startup.
- Slot status is updated in real-time using Socket.IO events.
- A cron job runs every 5 minutes to expire old bookings and free up slots.
- Gmail App Password (not your regular Gmail password) is required for email — enable 2FA on your Google account first, then generate one under Security → App Passwords.
