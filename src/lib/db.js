// src/lib/db.js
import mysql from 'mysql2/promise';

let pool; 
if (!pool) {
  pool = mysql.createPool({
    host:     process.env.MYSQL_HOST     || '127.0.0.1',
    port:     Number(process.env.MYSQL_PORT) || 3306,
    user:     process.env.MYSQL_USER     || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'cs348',
    connectionLimit: 5,
  });
}

export default pool;
