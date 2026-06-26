// controllers/authController.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Usuarios hardcodeados (igual que en Electron original)
// En producción real, estos irían en una tabla de la BD con contraseñas hasheadas
const USUARIOS = {
  JULIANDEV:  '1037665127',
  REMDEV:     '1000764800',
  DANIELA:    '1038361327',
  PAGINAWEB:  'lola123*',
};

async function login(req, res) {
  try {
    const { user, pass } = req.body;

    if (!user || !pass) {
      return res.status(400).json({ ok: false, mensaje: 'Usuario y contraseña requeridos' });
    }

    const usuario = user.trim().toUpperCase();
    const passwordEsperada = USUARIOS[usuario];

    if (!passwordEsperada || passwordEsperada !== pass.trim()) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { user: usuario },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({ ok: true, token, user: usuario });
  } catch (err) {
    console.error('❌ Error en login:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

module.exports = { login };
