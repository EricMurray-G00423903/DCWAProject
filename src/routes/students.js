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

        // Close the table and add links
        html += `
            </table>
        `;

        res.send(html);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Failed to fetch students');
    }
});

module.exports = router;
