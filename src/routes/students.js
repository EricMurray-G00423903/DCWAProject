const express = require('express');
const router = express.Router();
const mysql = require('../db/mysql'); // MySQL connection

// GET /students - Display all students in alphabetical order by sid
router.get('/', async (req, res) => {
    try {
        // Query to select all students ordered by student ID
        const query = 'SELECT * FROM student ORDER BY sid ASC';
        const [students] = await mysql.query(query);

        // HTML response
        let html = `
            <h1>Students</h1>
            <p><button onclick="window.location.href='/students/add'">Add New Student</button>
                <button onclick="window.location.href='/'">Back to Home</button></p>
            <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Action</th>
                </tr>
        `;

        // Generate table rows dynamically
        students.forEach(student => {
            html += `
                <tr>
                    <td>${student.sid}</td>
                    <td>${student.name}</td>
                    <td>${student.age}</td>
                    <td>
                        <a href="/students/edit/${student.sid}">Update</a>
                    </td>
                </tr>
            `;
        });

        // Close the table
        html += `
            </table>
        `;

        res.send(html);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Failed to fetch students');
    }
});

// GET /students/edit/:sid - Show form to edit a specific student
router.get('/edit/:sid', async (req, res) => {
    const { sid } = req.params;

    try {
        // Query the student details by ID
        const query = 'SELECT * FROM student WHERE sid = ?';
        const [rows] = await mysql.query(query, [sid]);

        if (rows.length === 0) {
            return res.status(404).send('Student not found');
        }

        const student = rows[0];

        // Display the form with the student's existing data
        let html = `
            <h1>Update Student</h1>
            <form method="POST" action="/students/edit/${sid}">
                <label>Student ID (Cannot be changed):</label><br>
                <input type="text" name="sid" value="${student.sid}" disabled /><br><br>

                <label>Name:</label><br>
                <input type="text" name="name" value="${student.name}" required minlength="2" /><br><br>

                <label>Age:</label><br>
                <input type="number" name="age" value="${student.age}" required min="18" /><br><br>

                <button type="submit">Update</button>
                <button onclick="window.location.href='/students'">Cancel</button>
            </form>
        `;

        res.send(html);
    } catch (err) {
        console.error('Error fetching student for update:', err);
        res.status(500).send('Failed to load student data');
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
    // Display the form with empty inputs
    let html = `
        <h1>Add New Student</h1>
        <form method="POST" action="/students/add">
            <label>Student ID (Starts with G00, 4+ characters):</label><br>
            <input type="text" name="sid" placeholder="G001" required minlength="4" /><br><br>

            <label>Name (Minimum 2 characters):</label><br>
            <input type="text" name="name" placeholder="John Doe" required minlength="2" /><br><br>

            <label>Age (18 or older):</label><br>
            <input type="number" name="age" placeholder="18" required min="18" /><br><br>

            <button type="submit">Add Student</button>
            <button onclick="window.location.href='/students'">Cancel</button>
        </form>
    `;

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
