const express = require('express');
const mysql = require('./db/mysql');
const connectMongo = require('./db/mongo');
// Import custom routes files
const studentsRoutes = require('./routes/students');
const gradesRoutes = require('./routes/grades'); 
const lecturersRoutes = require('./routes/lecturers');

require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    // Middlewar for parsing Form Data

// Routes
app.use('/students', studentsRoutes);
//app.use('/lecturers', lecturersRoutes);
//app.use('/grades', gradesRoutes);


// Home Page Route
app.get('/', (req, res) => {
    res.send(`
        <h1>G00423903</h1>
        <ul>
            <li><a href="/students">Students Page</a></li>
            <li><a href="/grades">Grades Page</a></li>
            <li><a href="/lecturers">Lecturers Page</a></li>
        </ul>
    `);
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});