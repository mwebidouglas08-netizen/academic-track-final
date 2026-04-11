const router = require('express').Router();
const { query } = require('../db');
const { authStudent } = require('../middleware/auth');

// GET /api/notifications - get notifications for this student
router.get('/', authStudent, async (req, res) => {
  const result = await query(
    `SELECT n.*, m.name AS sender_name
     FROM notifications n
     LEFT JOIN moderators m ON m.id = n.sent_by
     WHERE n.recipient_type='all' OR n.recipient_id=$1
     ORDER BY n.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authStudent, async (req, res) => {
  await query(
    `UPDATE notifications SET is_read=true WHERE id=$1 AND (recipient_type='all' OR recipient_id=$2)`,
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

module.exports = router;
