// routes/productos.js
const express    = require('express');
const router     = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getProductosPaginados,
  crearProducto,
  eliminarProducto,
  getUltimaReferencia,
  getUltimaReferenciaBlusas
} = require('../controllers/productosController');

// Todas las rutas de productos requieren autenticación JWT
router.use(verifyToken);

// GET  /api/productos?pagina=1&limite=50&busqueda=
router.get('/', getProductosPaginados);

// GET  /api/productos/ultima-referencia
router.get('/ultima-referencia', getUltimaReferencia);

// GET  /api/productos/ultima-referencia-blusas
router.get('/ultima-referencia-blusas', getUltimaReferenciaBlusas);

// POST /api/productos
router.post('/', crearProducto);

// DELETE /api/productos/:id
router.delete('/:id', eliminarProducto);

module.exports = router;
