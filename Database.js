const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    // Tabela de usuários
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        username   VARCHAR(100) NOT NULL UNIQUE,
        email      VARCHAR(150) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de treinos
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS workouts (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        user_id             INT NOT NULL,
        name                VARCHAR(150) NOT NULL,
        division            VARCHAR(100),
        muscle_group        VARCHAR(100),
        estimated_duration  INT DEFAULT 45,
        exercise_count      INT DEFAULT 0,
        notes               TEXT,
        last_updated        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Banco de dados inicializado com sucesso');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDatabase };