# 🔐 Node.js Authentication APIs

This project is a backend authentication system built with **Node.js** and **Express.js**, created as a practice exercise. It includes essential features like user signup, login, email verification, password reset, and password change, using RESTful API principles.

## 📚 Features

- ✅ **User Registration (Signup)**
- ✅ **User Login**
- ✅ **Email Verification** via token link
- ✅ **Forgot Password** (send reset link to email)
- ✅ **Reset Password** via token
- ✅ **Change Password** when logged in

## 🛠️ Tech Stack

- **Node.js** with **Express.js**
- **JWT** for authentication and email tokens
- **bcrypt** for password hashing
- **nodemailer** for sending emails
- **dotenv** for managing environment variables
- **SQLite / PostgreSQL / MySQL / MongoDB** (use your choice for database)
- **Knex / Mongoose / Sequelize** (if applicable)

## 📦 API Endpoints Overview

### 🔐 Auth

#### `POST /auth/api/signup`
Registers a new user. Sends a verification email.

#### `POST /auth/api/login`
Logs in the user after verifying email and password.

### 📧 Email Verification

#### `GET /auth/api/verify-email?token=...`
Verifies user's email using a token sent in email.

### 🔁 Password Reset Flow

#### `POST/auth/api/forgot-password`
Sends a reset link to the user's email.

#### `POST /auth/api/reset-password`
Accepts token + new password and updates it after verification.

### 🔒 Change Password (Authenticated)

#### `POST /auth/api/change-password`
Changes password after verifying the old one. Requires auth.

