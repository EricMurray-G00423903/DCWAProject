const express = require('express');
const mysql = require('../db/mysql'); // MySQL database connection
const connectMongo = require('../db/mongo'); // MongoDB connection
const { createObjectCsvWriter } = require('csv-writer'); // CSV writer library
const router = express.Router(); // Express router for defining routes
const path = require('path'); // Path utilities for file handling
const fs = require('fs'); // File system module for creating directories

// GET /dashboard - Display the Dashboard page with total stats for Students, Grades, and Lecturers
router.get('/', async (req, res) => {
    try {
        // Query MySQL for total students and grades count
        const [studentCountResult] = await mysql.query('SELECT COUNT(*) AS total_students FROM student');
        const [gradesCountResult] = await mysql.query('SELECT COUNT(*) AS total_grades FROM grade');

        // Extract counts from query results
        const totalStudents = studentCountResult[0].total_students;
        const totalGrades = gradesCountResult[0].total_grades;

        // Query MongoDB for total lecturers count
        const db = await connectMongo();
        const lecturersCount = await db.collection('lecturers').countDocuments();   // count the number of documents in the collection

        // Generate the HTML page with Bootstrap styling and dynamic stats
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
                    <h1 class="text-center mb-4">Dashboard</h1>
                    <div class="row g-4">
                        <!-- Students Card -->
                        <div class="col-md-4">
                            <div class="card text-white bg-primary">
                                <div class="card-header">Students</div>
                                <div class="card-body">
                                    <h5 class="card-title">${totalStudents}</h5>
                                    <p class="card-text">Total Students Enrolled</p>
                                </div>
                                <div class="card-footer text-end">
                                    <a href="/dashboard/export/students" class="btn btn-light btn-sm">Export CSV</a>
                                </div>
                            </div>
                        </div>

                        <!-- Grades Card -->
                        <div class="col-md-4">
                            <div class="card text-white bg-success">
                                <div class="card-header">Grades</div>
                                <div class="card-body">
                                    <h5 class="card-title">${totalGrades}</h5>
                                    <p class="card-text">Total Grades Recorded</p>
                                </div>
                                <div class="card-footer text-end">
                                    <a href="/dashboard/export/grades" class="btn btn-light btn-sm">Export CSV</a>
                                </div>
                            </div>
                        </div>

                        <!-- Lecturers Card -->
                        <div class="col-md-4">
                            <div class="card text-white bg-danger">
                                <div class="card-header">Lecturers</div>
                                <div class="card-body">
                                    <h5 class="card-title">${lecturersCount}</h5>
                                    <p class="card-text">Total Lecturers</p>
                                </div>
                                <div class="card-footer text-end">
                                    <a href="/dashboard/export/lecturers" class="btn btn-light btn-sm">Export CSV</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-4">
                        <a href="/" class="btn btn-secondary">Back to Home</a>
                    </div>
                </div>
                <footer class="text-center mt-5">
                    <p>&copy; 2024 Eric Murray - G00423903</p>
                </footer>
            </body>
            </html>
        `;

        res.send(html);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).send('Failed to load dashboard');
    }
});

// -------------------- EXPORT STUDENTS TO CSV --------------------
router.get('/export/students', async (req, res) => {
    try {
        // Fetch all students from MySQL
        const [students] = await mysql.query('SELECT * FROM student');

        // Ensure the exports folder exists
        const exportDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir); // Create directory if it doesn't exist

        // Set up CSV writer and file path
        const filePath = path.join(exportDir, 'students.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'sid', title: 'Student ID' },
                { id: 'name', title: 'Name' },
                { id: 'age', title: 'Age' },
            ],
        });

        // Write data to CSV
        await csvWriter.writeRecords(students);

        // Send file for download
        res.download(filePath, 'students.csv');
    } catch (err) {
        console.error('Error exporting students:', err);
        res.status(500).send('Failed to export students');
    }
});

// -------------------- EXPORT GRADES TO CSV --------------------
router.get('/export/grades', async (req, res) => {
    try {
        const [grades] = await mysql.query('SELECT * FROM grade');

        const exportDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

        const filePath = path.join(exportDir, 'grades.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'sid', title: 'Student ID' },
                { id: 'mid', title: 'Module ID' },
                { id: 'grade', title: 'Grade' },
            ],
        });

        await csvWriter.writeRecords(grades);
        res.download(filePath, 'grades.csv');
    } catch (err) {
        console.error('Error exporting grades:', err);
        res.status(500).send('Failed to export grades');
    }
});

// -------------------- EXPORT LECTURERS TO CSV --------------------
router.get('/export/lecturers', async (req, res) => {
    try {
        const db = await connectMongo();
        const lecturers = await db.collection('lecturers').find({}).toArray();

        const exportDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

        const filePath = path.join(exportDir, 'lecturers.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: '_id', title: 'Lecturer ID' },
                { id: 'name', title: 'Name' },
                { id: 'did', title: 'Department ID' },
            ],
        });

        await csvWriter.writeRecords(lecturers);
        res.download(filePath, 'lecturers.csv');
    } catch (err) {
        console.error('Error exporting lecturers:', err);
        res.status(500).send('Failed to export lecturers');
    }
});

module.exports = router;