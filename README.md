# PizzaNova
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack pizza ordering & inventory management platform built using the MERN stack.
A modern full-stack pizza ordering and inventory management platform built with the MERN stack.

## Screenshots
### Landing Page
<img width="1894" height="902" alt="image" src="https://github.com/user-attachments/assets/6970fdce-7604-4aea-9c47-7a4bc925f926" />
<img width="1896" height="898" alt="image" src="https://github.com/user-attachments/assets/1c5f1105-a4dc-4c23-8dbe-0e10435a6699" />
<img width="1903" height="910" alt="image" src="https://github.com/user-attachments/assets/e10aecfc-6b05-4b80-bc07-22ab2518891c" />

### Menu
<img width="1882" height="904" alt="image" src="https://github.com/user-attachments/assets/fc74ca66-f86f-44a7-9bb8-1976e2486683" />


### Pizza Builder
<img width="1885" height="880" alt="image" src="https://github.com/user-attachments/assets/9e86ff24-a8d1-41ca-b038-12aeb311705e" />
<img width="1880" height="822" alt="image" src="https://github.com/user-attachments/assets/1b1dc4d4-7ae6-48ca-8e30-401c8c73afd3" />

### Cart & Checkout
<img width="1905" height="897" alt="image" src="https://github.com/user-attachments/assets/96737759-0cd6-491f-8169-cc955a0eab7b" />
<img width="1872" height="885" alt="image" src="https://github.com/user-attachments/assets/b828564d-2e90-4458-aca7-aa73e9212294" />

### Admin Dashboard
<img width="1890" height="877" alt="image" src="https://github.com/user-attachments/assets/8d835307-b9d3-41cb-91b3-4e2cb835a425" />


# Overview

PizzaNova is a production-inspired pizza ordering platform developed using the MERN stack. It allows customers to browse pizzas, build customized orders, complete payments using Razorpay Test Mode, and track order status in real time.

The platform also provides a dedicated admin panel for managing pizzas, monitoring inventory, updating order status, and receiving automated low-stock email alerts.

The project demonstrates a complete full-stack workflow involving authentication, role-based authorization, payment integration, real-time communication, email services, and inventory management.

---


## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router, CSS |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Payment | Razorpay (Test Mode) |
| Email | Nodemailer |
| Scheduling | node-cron |

---

## Features

### Customer

| Module | Features |
|---------|----------|
| Authentication | Registration, Login, Email Verification, Forgot Password, Reset Password, Change Password |
| Pizza Ordering | Browse Menu, Pizza Details, Custom Pizza Builder |
| Shopping | Cart, Checkout, Razorpay Integration, Payment Retry |
| Orders | Real-Time Tracking, Order History, Live Status Updates |
| Profile | View & Update Profile |

### Admin

| Module | Features |
|---------|----------|
| Dashboard | Store Statistics, Low Stock Summary |
| Pizza | Add, Edit, Delete Pizzas |
| Inventory | Manage Ingredients, Update Stock, Thresholds |
| Orders | View, Search, Filter, Update Status, Cancel |
| Automation | Auto Inventory Deduction, Low Stock Alerts |

---

## Project Structure

| Folder | Description |
|---------|-------------|
| backend/src/controllers | Business logic |
| backend/src/models | Database models |
| backend/src/routes | API routes |
| backend/src/middlewares | Authentication & Authorization |
| backend/src/socket | Socket.IO |
| backend/src/cron | Scheduled Jobs |
| backend/src/seed | Database Seeds |
| frontend/src/components | Reusable Components |
| frontend/src/pages | Application Pages |
| frontend/src/services | API Layer |
| frontend/src/styles | CSS Files |
| frontend/src/assets | Images & Icons |

---

# Prerequisites

| Requirement | Description |
|-------------|-------------|
| Node.js | v18 or above |
| MongoDB | Local installation or MongoDB Atlas |
| Gmail Account | Required for Email Verification & Password Reset |
| Gmail App Password | Required by Nodemailer |
| Razorpay Account | Test Mode API Keys |

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

---

# Environment Variables

Create a `.env` file inside the **backend** directory.

```env
PORT=4404
FRONTEND_URL=http://localhost:5173

DB=mongodb://127.0.0.1:27017/OIBSIP

JWT_SECRET=your_jwt_secret
EXPIRY=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

RAZORPAY_API_KEY=your_test_key
RAZORPAY_API_SECRET=your_test_secret
```

---

# Database Seeding

## Inventory

Seed all pizza ingredients.

```bash
npm run seed:inventory --prefix backend
```

---

## Admin Account

Create an administrator account. (Seed)

```bash
node backend/src/seed/createAdmin.js admin@example.com admin123
```


> Menu pizzas are **not seeded**. They should be added using the Admin Dashboard.

---

# Running the Application

## Backend

```bash
npm start --prefix backend
```

or

```bash
npm run dev --prefix backend
```

Runs on

```
http://localhost:4404
```

---

## Frontend

```bash
npm run dev --prefix frontend
```

Runs on

```
http://localhost:5173
```

---

# First Run Checklist

| Step | Status |
|------|--------|
| Configure `.env` | Required |
| Seed Inventory | Required |
| Create Admin Account | Required |
| Start Backend | Required |
| Start Frontend | Required |
| Login as Admin | Required |
| Add Pizza Menu | Required |
| Register Customer | Required |
| Verify Email | Required |
| Place First Order | Required |

---

## Admin Flow

| Step | Action |
|------|--------|
| 1 | Login at `/admin-login` |
| 2 | Add Pizza Menu |
| 3 | Manage Inventory |
| 4 | View Orders |
| 5 | Update Order Status |
| 6 | Trigger Low Stock Alert |

---

# Available Scripts

| Command | Description |
|---------|-------------|
| `npm start --prefix backend` | Start Backend |
| `npm run dev --prefix backend` | Backend Development Server |
| `npm run seed:inventory --prefix backend` | Seed Inventory |
| `node backend/src/seed/createAdmin.js` | Create Admin |
| `node backend/src/seed/deletePendingOrders.js` | Delete Pending Orders |
| `npm run dev --prefix frontend` | Start Frontend |
| `npm run build --prefix frontend` | Build Frontend |
| `npm run lint --prefix frontend` | Run ESLint |

---

# API Overview
| Module | Description |
|---------|-------------|
| Authentication | Registration, Login, Password Management |
| Pizza | Pizza CRUD Operations |
| Inventory | Inventory Management |
| Orders | Order Placement & Tracking |
| Payments | Razorpay Integration |
| Admin | Dashboard & Management |

---

# Real-Time Features

| Feature | Technology |
|----------|------------|
| Order Status Updates | Socket.IO |
| Payment Verification | Razorpay |
| Low Stock Monitoring | node-cron |
| Email Notifications | Nodemailer |

---

# Security Features

| Feature | Description |
|---------|-------------|
| Password Hashing | bcrypt |
| Authentication | JWT |
| Authorization | Role-Based Access Control |
| Email Verification | Token Based |
| Password Reset | Secure Expiring Token |

---

# License

This project is developed for educational and portfolio purposes.

---

# Author

**Shivang Pandey**

GitHub: https://github.com/Shivang0402


