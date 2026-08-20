# Expense App – Signup Feature

## Project Description

This project is a simple full-stack Signup feature built using Node.js, Express.js, HTML, and MySQL.

Users can create an account by entering their name, email, and password. The submitted data is sent to the Express server and stored in a MySQL database.

## Technologies Used

* Node.js
* Express.js
* HTML
* CSS
* MySQL
* MySQL2
* Git and GitHub

## Features

* User-friendly signup page
* Name, email, and password validation
* POST request for signup
* Express backend
* MySQL database connection
* User data stored in the `users` table
* Unique email validation through the database

## Project Structure

```text
expense-app/
│
├── public/
│   └── signup.html
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Database Setup

Create the database:

```sql
CREATE DATABASE expense_app;
```

Select the database:

```sql
USE expense_app;
```

Create the users table:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

## Installation

Clone the repository:

```bash
git clone https://github.com/PinkyGupta30/expense_App.git
```

Move into the project folder:

```bash
cd expense_App
```

Install dependencies:

```bash
npm install
```

Configure your MySQL credentials in `server.js`.

Start the application:

```bash
node server.js
```

## Usage

Open the following URL in your browser:

```text
http://localhost:3000/signup
```

Enter your name, email, and password, then click the **Sign Up** button.

The application sends the data to the Express backend, which stores the user information in the MySQL database.

## Application Flow

```text
User
  ↓
Signup Page
  ↓
POST /signup
  ↓
Express Server
  ↓
req.body
  ↓
MySQL Database
  ↓
User Stored Successfully
```

## API Endpoint

### Signup

**Method:** `POST`

**Endpoint:**

```text
/signup
```

The request contains:

* Name
* Email
* Password

## Author

Pinky Gupta
