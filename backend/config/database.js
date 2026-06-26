// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME     || 'inventario_jeans',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0
});

// Inicializa la tabla si no existe
async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        referencia VARCHAR(20) NOT NULL,
        talla      VARCHAR(5)  NOT NULL,
        cantidad   INT         NOT NULL,
        INDEX idx_referencia (referencia),
        INDEX idx_id_desc    (id DESC)
      )
    `);
    console.log('✅ Tabla "productos" lista');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDB };
