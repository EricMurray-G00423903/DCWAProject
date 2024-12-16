const express = require('express');
const mysql = require('./db/mysql');
const connectMongo = require('./db/mongo');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());

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