const { MongoClient } = require('mongodb'); // Import MongoDB client
require('dotenv').config(); // Load environment variables

const client = new MongoClient(process.env.MONGO_URI);  // MongoDB connection

// Connect to MongoDB using the connection string from the .env file
async function connectMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db(process.env.MONGO_DB); // Return the database
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

module.exports = connectMongo;