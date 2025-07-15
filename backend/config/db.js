const mysql = require('mysql2/promise');
require('dotenv').config(); // load environment variables
console.log('log: ',process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_DATABASE, process.env.DB_HOST, process.env.DB_PORT);   
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//test connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release(); // ปล่อย connect กลับไปยัง pool
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1); // exit the process if connection fails
    })
module.exports = pool;