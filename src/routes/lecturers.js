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
            .sort({ _id: 1 }) // Sort by Lecturer ID
            .toArray();

        // HTML response with Bootstrap styling
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lecturers</title>
                <!-- Link to Bootstrap CSS -->
                <link rel="stylesheet" href="/css/bootstrap.min.css">
            </head>
            <body>
                <!-- Main Container -->
                <div class="container my-5">
                    <!-- Page Title -->
                    <h1 class="text-center mb-4">Lecturers</h1>

                    <!-- Back to Home Button -->
                    <div class="mb-3 text-end">
                        <a href="/" class="btn btn-primary">Back to Home</a>
                    </div>

                    <!-- Lecturers Table -->
                    <table class="table table-striped table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th>Lecturer ID</th>
                                <th>Name</th>
                                <th>Department ID</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Dynamically Generate Rows -->
                            ${lecturers.map(lecturer => `
                                <tr>
                                    <td>${lecturer._id}</td>
                                    <td>${lecturer.name}</td>
                                    <td>${lecturer.did}</td>
                                    <td>
                                        <a href="/lecturers/delete/${lecturer._id}" class="btn btn-danger btn-sm">Delete</a>
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
        // Handle errors gracefully
        console.error('Error fetching lecturers:', err);
        res.status(500).send(`
            <h1 class="text-danger text-center my-5">Failed to fetch lecturers</h1>
            <div class="text-center">
                <a href="/" class="btn btn-primary">Back to Home</a>
            </div>
        `);
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
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Lecturer Not Found</title>
                    <link rel="stylesheet" href="/css/bootstrap.min.css">
                </head>
                <body>
                    <div class="container my-5 text-center">
                        <h1 class="text-danger">Error</h1>
                        <p class="fs-5">Lecturer <strong>${lecturerId}</strong> not found.</p>
                        <a href="/lecturers" class="btn btn-primary mt-3">Back to Lecturers Page</a>
                    </div>
                    <footer class="text-center mt-5">
                        <p>&copy; 2024 Eric Murray - G00423903</p>
                    </footer>
                </body>
                </html>
            `);
        }

        // Check in MySQL if this Lecturer ID exists in the 'module' table
        const checkModulesQuery = 'SELECT * FROM module WHERE lecturer = ?';
        const [modules] = await mysql.query(checkModulesQuery, [lecturerId]);

        if (modules.length > 0) {
            // Lecturer has associated modules; prevent deletion
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Cannot Delete Lecturer</title>
                    <link rel="stylesheet" href="/css/bootstrap.min.css">
                </head>
                <body>
                    <div class="container my-5 text-center">
                        <h1 class="text-danger">Error Message</h1>
                        <p class="fs-5">
                            Cannot delete lecturer <strong>${lecturerId}</strong>. He/She has associated modules.
                        </p>
                        <a href="/lecturers" class="btn btn-primary mt-3">Back to Lecturers Page</a>
                    </div>
                    <footer class="text-center mt-5">
                        <p>&copy; 2024 Eric Murray - G00423903</p>
                    </footer>
                </body>
                </html>
            `);
        }

        // Safe to delete the lecturer from MongoDB
        const result = await db.collection('lecturers').deleteOne({ _id: lecturerId });

        if (result.deletedCount === 0) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Deletion Failed</title>
                    <link rel="stylesheet" href="/css/bootstrap.min.css">
                </head>
                <body>
                    <div class="container my-5 text-center">
                        <h1 class="text-danger">Error</h1>
                        <p class="fs-5">
                            Failed to delete lecturer <strong>${lecturerId}</strong>. Lecturer not found.
                        </p>
                        <a href="/lecturers" class="btn btn-primary mt-3">Back to Lecturers Page</a>
                    </div>
                    <footer class="text-center mt-5">
                        <p>&copy; 2024 Eric Murray - G00423903</p>
                    </footer>
                </body>
                </html>
            `);
        }

        // Redirect back to the Lecturers Page after successful deletion
        res.redirect('/lecturers');
    } catch (err) {
        console.error('Error deleting lecturer:', err);
        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error - Server Issue</title>
                <link rel="stylesheet" href="/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container my-5 text-center">
                    <h1 class="text-danger">Server Error</h1>
                    <p class="fs-5">An unexpected error occurred while attempting to delete the lecturer.</p>
                    <a href="/lecturers" class="btn btn-primary mt-3">Back to Lecturers Page</a>
                </div>
                <footer class="text-center mt-5">
                    <p>&copy; 2024 Eric Murray - G00423903</p>
                </footer>
            </body>
            </html>
        `);
    }
}); 

module.exports = router;