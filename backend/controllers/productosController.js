// controllers/productosController.js
const { pool } = require('../config/database');

// GET /api/productos?pagina=1&limite=50&busqueda=
async function getProductosPaginados(req, res) {
  try {
    const pagina  = Math.max(1, parseInt(req.query.pagina)  || 1);
    const limite  = Math.min(9999, parseInt(req.query.limite) || 50);
    const busqueda = (req.query.busqueda || '').trim();
    const offset  = (pagina - 1) * limite;

    let sqlCount = 'SELECT COUNT(*) AS total FROM productos';
    let sqlData  = 'SELECT * FROM productos';
    let params   = [];

    if (busqueda) {
      const term = `%${busqueda}%`;
      sqlCount += ' WHERE referencia LIKE ? OR talla LIKE ?';
      sqlData  += ' WHERE referencia LIKE ? OR talla LIKE ?';
      params    = [term, term];
    }

    sqlData += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    const [[countRow], [productos]] = await Promise.all([
      pool.query(sqlCount, params),
      pool.query(sqlData, [...params, limite, offset])
    ]);

    return res.json({
      ok: true,
      productos,
      total: countRow[0].total
    });
  } catch (err) {
    console.error('❌ Error al obtener productos:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener productos' });
  }
}

// POST /api/productos
async function crearProducto(req, res) {
  try {
    const { referencia, talla, cantidad } = req.body;

    if (!referencia || !talla || cantidad === undefined) {
      return res.status(400).json({ ok: false, mensaje: 'Datos incompletos: referencia, talla y cantidad son requeridos' });
    }
    if (isNaN(parseInt(cantidad)) || parseInt(cantidad) <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'Cantidad debe ser un número positivo' });
    }

    const [result] = await pool.query(
      'INSERT INTO productos (referencia, talla, cantidad) VALUES (?, ?, ?)',
      [referencia.trim(), talla.trim(), parseInt(cantidad)]
    );

    console.log(`✅ Guardado: ${referencia} (${talla}) x${cantidad}`);
    return res.status(201).json({ ok: true, mensaje: 'Guardado con éxito', id: result.insertId });
  } catch (err) {
    console.error('❌ Error al guardar producto:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error al guardar producto' });
  }
}

// DELETE /api/productos/:id
async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ ok: false, mensaje: 'ID inválido' });
    }

    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    console.log(`🗑️ Eliminado ID: ${id}`);
    return res.json({ ok: true, mensaje: 'Eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar producto' });
  }
}

// GET /api/productos/ultima-referencia
async function getUltimaReferencia(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT referencia FROM productos ORDER BY id DESC LIMIT 1'
    );
    const referencia = rows.length > 0 ? rows[0].referencia : null;
    return res.json({ ok: true, referencia });
  } catch (err) {
    console.error('❌ Error al obtener última referencia:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener última referencia' });
  }
}

// GET /api/productos/ultima-referencia-blusas
async function getUltimaReferenciaBlusas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT referencia FROM productos
       WHERE referencia LIKE '06-%' OR referencia LIKE '07-%' OR referencia LIKE '03-%'
       ORDER BY id DESC LIMIT 1`
    );
    const referencia = rows.length > 0 ? rows[0].referencia : null;
    return res.json({ ok: true, referencia });
  } catch (err) {
    console.error('❌ Error al obtener última referencia blusas:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener última referencia de blusas' });
  }
}

module.exports = {
  getProductosPaginados,
  crearProducto,
  eliminarProducto,
  getUltimaReferencia,
  getUltimaReferenciaBlusas
};
