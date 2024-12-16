const express = require('express');
const mysql = require('./db/mysql');
const connectMongo = require('./db/mongo');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// MySQL Test Route
app.get('/mysql-test', async (req, res) => {
    try {
        const [rows] = await mysql.query('SHOW TABLES');
        res.json(rows);
    } catch (err) {
        res.status(500).send('MySQL connection failed');
    }
});

// MongoDB Test Route
app.get('/mongo-test', async (req, res) => {
    try {
        const db = await connectMongo();
        const lecturers = await db.collection('lecturers').find().toArray();
        res.json(lecturers);
    } catch (err) {
        res.status(500).send('MongoDB connection failed');
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});