const router = require('express').Router();
const { query } = require('../db');
const { authStudent } = require('../middleware/auth');

// GET /api/messages
router.get('/', authStudent, async (req, res) => {
  const result = await query(
    `SELECT m.*, mod.name AS replied_by_name
     FROM messages m
     LEFT JOIN moderators mod ON mod.id = m.replied_by
     WHERE m.student_id=$1
     ORDER BY m.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// POST /api/messages
router.post('/', authStudent, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'Subject and body are required.' });

  const result = await query(
    `INSERT INTO messages (student_id, subject, body) VALUES ($1,$2,$3) RETURNING *`,
    [req.user.id, subject.trim(), body.trim()]
  );
  res.status(201).json(result.rows[0]);
});

module.exports = router;
