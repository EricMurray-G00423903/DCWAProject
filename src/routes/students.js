const express = require('express');
const router = express.Router();
const mysql = require('../db/mysql'); // MySQL connection

// GET /students - Display all students with optional search and filter functionality
router.get('/', async (req, res) => {
    try {
        const { search } = req.query; // Get the search query from URL parameters
        let query = 'SELECT * FROM student';
        const params = [];

        // Modify the query if a search term exists
        if (search) {
            query += ' WHERE name LIKE ? ORDER BY sid ASC';
            params.push(`%${search}%`); // Add wildcard search for SQL LIKE
        } else {
            query += ' ORDER BY sid ASC';
        }

        // Execute the query
        const [students] = await mysql.query(query, params);

        // Generate HTML response with Bootstrap styling
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Students</title>
                <link rel="stylesheet" href="/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container my-5">
                    <!-- Page Title -->
                    <h1 class="text-center mb-4">Students</h1>

                    <!-- Top Action Section: Buttons and Search Bar -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <!-- Add Student and Back to Home Buttons -->
                        <div>
                            <a href="/students/add" class="btn btn-success me-2">Add New Student</a>
                            <a href="/" class="btn btn-primary">Back to Home</a>
                        </div>

                        <!-- Search Form -->
                        <form method="GET" action="/students" class="d-flex">
                            <input type="text" name="search" class="form-control me-2" placeholder="Search by name..." value="${search || ''}">
                            <button type="submit" class="btn btn-primary me-2">Search</button>
                            <a href="/students" class="btn btn-secondary">Reset</a>
                        </form>
                    </div>

                    <!-- Students Table -->
                    <table class="table table-striped table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr>
                                    <td>${student.sid}</td>
                                    <td>${student.name}</td>
                                    <td>${student.age}</td>
                                    <td>
                                        <a href="/students/edit/${student.sid}" class="btn btn-warning btn-sm">Update</a>
                                    </td>
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
        console.error('Error fetching students:', err);
        res.status(500).send(`
            <h1 class="text-danger text-center my-5">Failed to fetch students</h1>
            <div class="text-center">
                <a href="/" class="btn btn-primary">Back to Home</a>
            </div>
        `);
    }
});

// GET /students/edit/:sid - Show form to edit a specific student
router.get('/edit/:sid', async (req, res) => {
    const { sid } = req.params;

    try {
        // Query the student details by ID
        const query = 'SELECT * FROM student WHERE sid = ?';
        const [rows] = await mysql.query(query, [sid]);

        // Handle case where the student is not found
        if (rows.length === 0) {
            return res.status(404).send(`
                <h1 class="text-danger text-center my-5">Student Not Found</h1>
                <div class="text-center">
                    <a href="/students" class="btn btn-primary">Back to Students</a>
                </div>
            `);
        }

        const student = rows[0];

        // HTML response with Bootstrap styling
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Update Student</title>
                <!-- Link to Bootstrap CSS -->
                <link rel="stylesheet" href="/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container my-5">
                    <!-- Page Title -->
                    <h1 class="text-center mb-4">Update Student</h1>

                    <!-- Update Form -->
                    <form method="POST" action="/students/edit/${sid}" class="p-4 border rounded bg-light">
                        <!-- Student ID (Read-only) -->
                        <div class="mb-3">
                            <label for="sid" class="form-label fw-bold">Student ID (Cannot be changed):</label>
                            <input type="text" id="sid" class="form-control" value="${student.sid}" disabled>
                        </div>

                        <!-- Name Input -->
                        <div class="mb-3">
                            <label for="name" class="form-label fw-bold">Name:</label>
                            <input type="text" id="name" name="name" value="${student.name}" class="form-control" required minlength="2">
                        </div>

                        <!-- Age Input -->
                        <div class="mb-3">
                            <label for="age" class="form-label fw-bold">Age:</label>
                            <input type="number" id="age" name="age" value="${student.age}" class="form-control" required min="18">
                        </div>

                        <!-- Action Buttons -->
                        <div class="d-flex justify-content-between">
                            <button type="submit" class="btn btn-success">Update</button>
                            <a href="/students" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
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
        console.error('Error fetching student for update:', err);
        res.status(500).send(`
            <h1 class="text-danger text-center my-5">Failed to load student data</h1>
            <div class="text-center">
                <a href="/students" class="btn btn-primary">Back to Students</a>
            </div>
        `);
    }
});



// POST /students/edit/:sid - Process form submission and update student
router.post('/edit/:sid', async (req, res) => {
    const { sid } = req.params;
    const { name, age } = req.body;

    // Input validation
    if (!name || name.length < 2) {
        return res.status(400).send('Name must be at least 2 characters long.');
    }
    if (!age || age < 18) {
        return res.status(400).send('Age must be 18 or older.');
    }

    try {
        // Update the student details in the database
        const query = 'UPDATE student SET name = ?, age = ? WHERE sid = ?';
        const [result] = await mysql.query(query, [name, age, sid]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Student not found or no changes made');
        }

        // Redirect back to the Students page
        res.redirect('/students');
    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).send('Failed to update student');
    }
});

// GET /students/add - Show form to add a new student
router.get('/add', (req, res) => {
    // HTML response with Bootstrap styling
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Add New Student</title>
            <!-- Link to Bootstrap CSS -->
            <link rel="stylesheet" href="/css/bootstrap.min.css">
        </head>
        <body>
            <!-- Main Container -->
            <div class="container my-5">
                <!-- Page Title -->
                <h1 class="text-center mb-4">Add New Student</h1>

                <!-- Add Student Form -->
                <form method="POST" action="/students/add" class="p-4 border rounded bg-light">
                    <!-- Student ID Input -->
                    <div class="mb-3">
                        <label for="sid" class="form-label fw-bold">Student ID (Starts with G00, 4+ characters):</label>
                        <input type="text" id="sid" name="sid" placeholder="G001" class="form-control" required minlength="4">
                    </div>

                    <!-- Name Input -->
                    <div class="mb-3">
                        <label for="name" class="form-label fw-bold">Name (Minimum 2 characters):</label>
                        <input type="text" id="name" name="name" placeholder="John Doe" class="form-control" required minlength="2">
                    </div>

                    <!-- Age Input -->
                    <div class="mb-3">
                        <label for="age" class="form-label fw-bold">Age (18 or older):</label>
                        <input type="number" id="age" name="age" placeholder="18" class="form-control" required min="18">
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between">
                        <button type="submit" class="btn btn-success">Add Student</button>
                        <a href="/students" class="btn btn-secondary">Cancel</a>
                    </div>
                </form>
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
});


// POST /students/add - Add a new student to the database
router.post('/add', async (req, res) => {
    const { sid, name, age } = req.body;

    // Input validation
    const sidRegex = /^G\d{3}$/; // Starts with G and followed by exactly 3 digits
    const errors = [];

    if (!sid || !sidRegex.test(sid)) {
        errors.push("Student ID must start with 'G' and be exactly 4 characters (e.g., G001).");
    }
    if (!name || name.length < 2) {
        errors.push("Name must be at least 2 characters long.");
    }
    if (!age || age < 18) {
        errors.push("Age must be 18 or older.");
    }

    if (errors.length > 0) {
        // Return form with error messages and previous data
        let errorHtml = `
            <h1>Add New Student</h1>
            <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
            <form method="POST" action="/students/add">
                <label>Student ID:</label><br>
                <input type="text" name="sid" value="${sid || ''}" required /><br><br>

                <label>Name:</label><br>
                <input type="text" name="name" value="${name || ''}" required /><br><br>

                <label>Age:</label><br>
                <input type="number" name="age" value="${age || ''}" required /><br><br>

                <button type="submit">Add Student</button>
                <button onclick="window.location.href='/students'">Cancel</button>
            </form>
        `;
        return res.send(errorHtml);
    }

    try {
        // Check for existing Student ID
        const checkQuery = 'SELECT * FROM student WHERE sid = ?';
        const [existing] = await mysql.query(checkQuery, [sid]);

        if (existing.length > 0) {
            return res.send(`
                <h1>Error</h1>
                <p>Student with ID ${sid} already exists.</p>
                <a href="/students/add">Go Back</a>
            `);
        }

        // Insert new student
        const insertQuery = 'INSERT INTO student (sid, name, age) VALUES (?, ?, ?)';
        await mysql.query(insertQuery, [sid, name, age]);

        res.redirect('/students'); // Redirect to Students page
    } catch (err) {
        console.error('Error adding new student:', err);
        res.status(500).send('Failed to add student.');
    }
});




module.exports = router;
