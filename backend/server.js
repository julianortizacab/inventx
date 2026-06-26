// server.js - Invent X Solutions API REST
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { initDB } = require('./config/database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5500',
  'https://inventx.vercel.app',   // <-- reemplaza con tu dominio real de Vercel
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ej. Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── PARSERS ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'online', timestamp: new Date().toISOString() });
});

// ─── RUTAS ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

// ─── ERROR GLOBAL ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.message);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// ─── ARRANQUE ────────────────────────────────────────────────────────────────
async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 DB: ${process.env.DB_NAME || 'inventario_jeans'} @ ${process.env.DB_HOST || 'localhost'}`);
  });
}

start().catch(err => {
  console.error('❌ Error fatal al iniciar:', err);
  process.exit(1);
});
