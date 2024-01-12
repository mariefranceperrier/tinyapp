# URL Shortener Web App

This is a simple URL shortener web application built with Express and Node.js. Users can register, log in, create short URLs, and manage them.

## Features

- User authentication and authorization
- URL shortening
- View, edit, and delete user-specific URLs
- Responsive design for a better user experience

## Technologies Used

- Node.js
- Express
- EJS (Embedded JavaScript) for templating
- bcryptjs for password hashing
- cookie-session for session management

## Getting Started

### Prerequisites

- Node.js installed
- npm (Node Package Manager) installed

### Installation

1. Clone the repository: https://github.com/mariefranceperrier/tinyapp/tree/master
2. Navigate to the project directory
3. Install dependencies : npm install

### Usage

1. To start the application : npm start
2. Open your web browser and go to http://localhost:8080
3. Register or log in to create and manage your short URLs.

## Routes

- /: Home page, redirects to login.
- /register: Register a new account.
- /login: Log in to an existing account.
- /urls/new: Create a new short URL.
- /urls: View and manage user-specific URLs.
- /urls/:id: View, edit, or delete a specific short URL.
- /u/:id: Redirects to the original long URL.