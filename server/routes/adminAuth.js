const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken, authAdmin } = require('../middleware/auth');

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const result = await query(
    'SELECT id, name, username, email, role, password_hash FROM moderators WHERE username=$1',
    [username.trim().toLowerCase()]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const mod = result.rows[0];
  const valid = await bcrypt.compare(password, mod.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const { password_hash, ...safeMod } = mod;
  const token = signToken({ id: mod.id, role: 'admin', username: mod.username, modRole: mod.role });
  res.json({ token, moderator: safeMod });
});

// GET /api/admin/auth/me
router.get('/me', authAdmin, async (req, res) => {
  const result = await query(
    'SELECT id, name, username, email, role, created_at FROM moderators WHERE id=$1',
    [req.admin.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Moderator not found' });
  res.json(result.rows[0]);
});

module.exports = router;
