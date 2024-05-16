import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

let db;

function createDatabaseConnection() {
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  db.on("error", (err) => {
    console.error("Database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Handle the lost connection, such as attempting to reconnect
      handleConnectionError();
    } else {
      throw err;
    }
  });
}

function handleConnectionError() {
  // Close the current connection
  db.destroy();

  // Attempt to create a new connection and retry the operation
  createDatabaseConnection();
}

// Initialize the database connection
createDatabaseConnection();

export default db;
