const express = require('express');
const mysql = require('../db/mysql'); // MySQL connection
const connectMongo = require('../db/mongo'); // MongoDB connection
const router = express.Router();

// GET /dashboard - Display the Dashboard page with stats
router.get('/', async (req, res) => {
    try {
        // 1. Query MySQL for total students and grades count
        const [studentCountResult] = await mysql.query('SELECT COUNT(*) AS total_students FROM student');
        const [gradesCountResult] = await mysql.query('SELECT COUNT(*) AS total_grades FROM grade');

        const totalStudents = studentCountResult[0].total_students;
        const totalGrades = gradesCountResult[0].total_grades;

        // 2. Query MongoDB for total lecturers count
        const db = await connectMongo();
        const lecturersCount = await db.collection('lecturers').countDocuments();

        // 3. Generate HTML response with dynamic stats
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dashboard</title>
                <link rel="stylesheet" href="/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container my-5">
                    <!-- Page Title -->
                    <h1 class="text-center mb-4">Dashboard</h1>

                    <!-- Dashboard Cards with Live Stats -->
                    <div class="row g-4">
                        <!-- Total Students Card -->
                        <div class="col-md-4">
                            <div class="card text-white bg-primary mb-3">
                                <div class="card-header">Students</div>
                                <div class="card-body">
                                    <h5 class="card-title">${totalStudents}</h5>
                                    <p class="card-text">Total Students Enrolled</p>
                                </div>
                            </div>
                        </div>

                        <!-- Total Grades Card -->
                        <div class="col-md-4">
                            <div class="card text-white bg-success mb-3">
                                <div class="card-header">Grades</div>
                                <div class="card-body">
                                    <h5 class="card-title">${totalGrades}</h5>
                                    <p class="card-text">Total Grades Recorded</p>
                                </div>
                            </div>
                        </div>

                        <!-- Total Lecturers Card -->
                        <div class="col-md-4">
                            <div class="card text-white bg-danger mb-3">
                                <div class="card-header">Lecturers</div>
                                <div class="card-body">
                                    <h5 class="card-title">${lecturersCount}</h5>
                                    <p class="card-text">Total Lecturers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Back to Home Button -->
                    <div class="text-center mt-4">
                        <a href="/" class="btn btn-secondary">Back to Home</a>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="text-center mt-5">
                    <p>&copy; 2024 Eric Murray - G00423903</p>
                </footer>
            </body>
            </html>
        `;

        res.send(html);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).send(`
            <h1 class="text-danger text-center my-5">Failed to load dashboard</h1>
            <div class="text-center">
                <a href="/" class="btn btn-primary">Back to Home</a>
            </div>
        `);
    }
});

module.exports = router;