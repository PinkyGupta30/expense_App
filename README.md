# Expense Tracker Application

A full-stack Expense Tracker application built using Node.js, Express.js, MySQL, Sequelize, HTML, CSS, and JavaScript.

The application allows users to create an account, log in securely, manage their expenses, get AI-based category suggestions, generate reports, access leaderboard and premium features, and make payments using Cashfree.

---

## Project Overview

The Expense Tracker helps users manage their daily expenses in one place.

Users can:

- Create an account
- Log in securely
- Add expenses
- View expenses
- Edit expenses
- Delete expenses
- Automatically get category suggestions using AI
- View expense reports
- Check leaderboard information
- Access premium features
- Create Cashfree payment orders
- Verify payments

The backend provides REST APIs and handles authentication, database operations, business logic, and external service integrations.

---

## Technologies Used

### Backend

- Node.js
- Express.js
- Sequelize
- MySQL
- MySQL2

### Authentication & Security

- JWT (JSON Web Token)
- bcrypt
- dotenv
- Authentication Middleware

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API

### Payment

- Cashfree Payment Gateway

### AI

- Gemini API for expense category suggestions

### Development Tools

- Git
- GitHub
- Nodemon
- VS Code

---

# Features

## 1. User Signup

Users can create an account by providing:

- Name
- Email
- Password

The password is encrypted using bcrypt before storing it in the database.

### Flow

```text
Signup Page
     ↓
POST Signup API
     ↓
Validate User
     ↓
Hash Password using bcrypt
     ↓
Store User in MySQL
     ↓
Signup Successful