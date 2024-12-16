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

        // Generate HTML for the grades page
        let html = `
            <h1>Grades</h1>
            <p><button onclick="window.location.href='/'">Back to Home</button></p>
            <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>Student</th>
                    <th>Module</th>
                    <th>Grade</th>
                </tr>
        `;

        // Dynamically generate rows
        results.forEach(row => {
            html += `
                <tr>
                    <td>${row.student_name || ''}</td>
                    <td>${row.module_name || ''}</td>
                    <td>${row.grade !== null ? row.grade : ''}</td>
                </tr>
            `;
        });

        html += `</table>`;
        res.send(html);
    } catch (err) {
        console.error('Error fetching grades:', err);
        res.status(500).send('Failed to fetch grades');
    }
});

module.exports = router;
