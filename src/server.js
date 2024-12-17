const express = require('express');
const mysql = require('./db/mysql');
const connectMongo = require('./db/mongo');
// Import custom routes files
const studentsRoutes = require('./routes/students');
const gradesRoutes = require('./routes/grades'); 
const lecturersRoutes = require('./routes/lecturers');
const dashboardRoutes = require('./routes/dashboard');
// Import path module to serve static files
const path = require('path');

require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    // Middlewar for parsing Form Data

// Serving Bootstrap CSS and JS locally without CDN
app.use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')));

// Routes
app.use('/students', studentsRoutes);
app.use('/lecturers', lecturersRoutes);
app.use('/grades', gradesRoutes);
app.use('/dashboard', dashboardRoutes);


// Home Page Route
app.get('/', (req, res) => {
    // Serve the home page with navigation links using Bootstrap styling
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Home Page</title>
            <!-- Link to Bootstrap CSS -->
            <link rel="stylesheet" href="/css/bootstrap.min.css">
        </head>
        <body>
            <div class="container my-5">
                <!-- Page Header -->
                <h1 class="text-center mb-4">G00423903</h1>

                <!-- Navigation Links -->
                <div class="list-group text-center">
                    <a href="/students" class="list-group-item list-group-item-action">
                        Students Page
                    </a>
                    <a href="/grades" class="list-group-item list-group-item-action">
                        Grades Page
                    </a>
                    <a href="/lecturers" class="list-group-item list-group-item-action">
                        Lecturers Page
                    </a>
                    <a href="/dashboard" class="list-group-item list-group-item-action">
                        Dashboard
                    </a>
                </div>
            </div>

            <!-- Optional Footer -->
            <footer class="text-center mt-5">
                <p>&copy; 2024 Eric Murray - G00423903</p>
            </footer>
        </body>
        </html>
    `);
});


// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});