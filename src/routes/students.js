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


module.exports = router;
