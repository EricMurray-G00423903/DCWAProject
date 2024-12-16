const express = require('express');
const router = express.Router();
const mysql = require('../db/mysql');

// GET /students - Display all students
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM student ORDER BY sid ASC';
        const [students] = await mysql.query(query);

        let html = `<h1>Students Page</h1><table border="1">`;
        students.forEach(student => {
            html += `
                <tr>
                    <td>${student.sid}</td>
                    <td>${student.name}</td>
                    <td>${student.age}</td>
                    <td><a href="/students/edit/${student.sid}">Update</a></td>
                </tr>`;
        });
        html += `</table><a href="/students/add">Add Student</a><a href="/">Back to Home</a>`;
        res.send(html);
    } catch (err) {
        res.status(500).send('Error fetching students');
    }
});

module.exports = router; // export the router