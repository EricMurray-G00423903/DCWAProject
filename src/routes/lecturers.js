const express = require('express');
const router = express.Router();
const connectMongo = require('../db/mongo'); // MongoDB connection
const mysql = require('../db/mysql');       // MySQL connection to compare Department ID's

// GET /lecturers - Display all lecturers sorted by lecturer ID
router.get('/', async (req, res) => {
    try {
        const db = await connectMongo();
        const lecturers = await db
            .collection('lecturers')
            .find({})
            .sort({ _id: 1 }) // Sort by Lecturer ID (assumed as _id)
            .toArray();

        // Generate HTML for the lecturers page
        let html = `
            <h1>Lecturers</h1>
            <p><button onclick="window.location.href='/'">Back to Home</button></p>
            <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>Lecturer ID</th>
                    <th>Name</th>
                    <th>Department ID</th>
                    <th>Action</th>
                </tr>
        `;

        // Dynamically generate table rows
        lecturers.forEach(lecturer => {
            html += `
                <tr>
                    <td>${lecturer._id}</td>
                    <td>${lecturer.name}</td>
                    <td>${lecturer.did}</td>
                    <td><a href="/lecturers/delete/${lecturer._id}">Delete</a></td>
                </tr>
            `;
        });

        html += `</table>`;
        res.send(html);
    } catch (err) {
        console.error('Error fetching lecturers:', err);
        res.status(500).send('Failed to fetch lecturers');
    }
});

// GET /lecturers/delete/:lid - Delete a lecturer if no associated modules exist
router.get('/delete/:lid', async (req, res) => {
    const lecturerId = req.params.lid;

    try {
        const db = await connectMongo();

        // Fetch the lecturer's details from MongoDB
        const lecturer = await db.collection('lecturers').findOne({ _id: lecturerId });
        if (!lecturer) {
            return res.status(404).send(`
                <h1>Error</h1>
                <p>Lecturer ${lecturerId} not found.</p>
                <p><button onclick="window.location.href='/lecturers'">Back to Lecturers Page</button></p>
            `);
        }

        // Check in MySQL if this Lecturer ID exists in the 'module' table
        const checkModulesQuery = 'SELECT * FROM module WHERE lecturer = ?';
        const [modules] = await mysql.query(checkModulesQuery, [lecturerId]);

        if (modules.length > 0) {
            // Lecturer has associated modules; prevent deletion
            return res.send(`
                <h1>Error Message</h1>
                <p><strong>Cannot delete lecturer ${lecturerId}. He/She has associated modules.</strong></p>
                <p><button onclick="window.location.href='/lecturers'">Back to Lecturers Page</button></p>
            `);
        }

        // Safe to delete the lecturer from MongoDB
        const result = await db.collection('lecturers').deleteOne({ _id: lecturerId });

        if (result.deletedCount === 0) {
            return res.status(404).send(`
                <h1>Error</h1>
                <p>Failed to delete lecturer ${lecturerId}. Lecturer not found.</p>
                <p><button onclick="window.location.href='/lecturers'">Back to Lecturers Page</button></p>
            `);
        }

        // Redirect back to the Lecturers Page
        res.redirect('/lecturers');
    } catch (err) {
        console.error('Error deleting lecturer:', err);
        res.status(500).send('An error occurred while attempting to delete the lecturer.');
    }
});

module.exports = router;