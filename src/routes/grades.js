const express = require('express');
const router = express.Router();
const mysql = require('../db/mysql'); // MySQL connection

// GET /grades - Display grades page
router.get('/', async (req, res) => {
    try {
        // Query to fetch student name, module name, and grade
        const query = `
            SELECT student.name AS student_name, 
                   module.name AS module_name, 
                   grade.grade
            FROM student
            LEFT JOIN grade ON student.sid = grade.sid
            LEFT JOIN module ON grade.mid = module.mid
            ORDER BY student.name ASC, grade.grade ASC;
        `;
        const [results] = await mysql.query(query);

        // HTML response with Bootstrap styling
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Grades</title>
                <!-- Link to Bootstrap CSS -->
                <link rel="stylesheet" href="/css/bootstrap.min.css">
            </head>
            <body>
                <!-- Main Container -->
                <div class="container my-5">
                    <!-- Page Title -->
                    <h1 class="text-center mb-4">Grades</h1>

                    <!-- Back to Home Button -->
                    <div class="mb-3 text-end">
                        <a href="/" class="btn btn-primary">Back to Home</a>
                    </div>

                    <!-- Grades Table -->
                    <table class="table table-striped table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th>Student</th>
                                <th>Module</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Dynamically Generate Rows -->
                            ${results.map(row => `
                                <tr>
                                    <td>${row.student_name || ''}</td>
                                    <td>${row.module_name || ''}</td>
                                    <td>${row.grade !== null ? row.grade : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Footer -->
                <footer class="text-center mt-5">
                    <p>&copy; 2024 Eric Murray - G00423903</p>
                </footer>
            </body>
            </html>
        `;

        // Send the generated HTML response
        res.send(html);
    } catch (err) {
        // Handle errors gracefully
        console.error('Error fetching grades:', err);
        res.status(500).send(`
            <h1 class="text-danger text-center my-5">Failed to fetch grades</h1>
            <div class="text-center">
                <a href="/" class="btn btn-primary">Back to Home</a>
            </div>
        `);
    }
});


module.exports = router;
