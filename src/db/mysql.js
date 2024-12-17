const mysql = require('mysql2/promise'); // Import MySQL2 library
require('dotenv').config(); // Load environment variables

const pool = mysql.createPool({ // Create a MySQL connection pool
    host: process.env.MYSQL_HOST,   // MySQL host from .env file
    user: process.env.MYSQL_USER,   // MySQL user from .env file
    password: process.env.MYSQL_PASSWORD,   // MySQL password from .env file
    database: process.env.MYSQL_DATABASE,   // MySQL database from .env file
});

module.exports = pool;