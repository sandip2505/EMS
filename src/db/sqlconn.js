const mysql = require('mysql');
require("dotenv").config();
const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "timenet",
};

// MySQL connection
const mysqlConnection = mysql.createConnection(mysqlConfig);

mysqlConnection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("MySQL connection successful");
});

module.exports = mysqlConnection;  // Export connection directly
