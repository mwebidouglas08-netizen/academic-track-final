const router = require('express').Router();
const { query } = require('../db');
const { authStudent } = require('../middleware/auth');

// GET /api/submissions - student's own submissions
router.get('/', authStudent, async (req, res) => {
  const result = await query(
    `SELECT s.*, 
       json_agg(h ORDER BY h.changed_at ASC) AS history
     FROM submissions s
     LEFT JOIN submission_history h ON h.submission_id = s.id
     WHERE s.student_id = $1
     GROUP BY s.id
     ORDER BY s.submitted_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// POST /api/submissions - create new submission
router.post('/', authStudent, async (req, res) => {
  const { type, title, content, currentLevel, aiScore, aiFeedback } = req.body;

  if (!type || !title || !content || !currentLevel) {
    return res.status(400).json({ error: 'type, title, content and currentLevel are required.' });
  }

  const validTypes = ['Proposal', 'Results', 'Presentation', 'Publication'];
  const validLevels = ['Department', 'School Faculty', 'Postgraduate Board'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid submission type.' });
  if (!validLevels.includes(currentLevel)) return res.status(400).json({ error: 'Invalid level.' });

  const sub = await query(
    `INSERT INTO submissions (student_id, type, title, content, current_level, status, ai_score, ai_feedback)
     VALUES ($1,$2,$3,$4,$5,'Submitted',$6,$7)
     RETURNING *`,
    [req.user.id, type, title.trim(), content.trim(), currentLevel, aiScore || 0, aiFeedback || null]
  );

  const submission = sub.rows[0];

  // Insert first history entry
  await query(
    `INSERT INTO submission_history (submission_id, level, status, notes)
     VALUES ($1,$2,'Submitted','Initial submission')`,
    [submission.id, currentLevel]
  );

  res.status(201).json(submission);
});

// GET /api/submissions/:id
router.get('/:id', authStudent, async (req, res) => {
  const result = await query(
    `SELECT s.*, json_agg(h ORDER BY h.changed_at ASC) AS history
     FROM submissions s
     LEFT JOIN submission_history h ON h.submission_id = s.id
     WHERE s.id=$1 AND s.student_id=$2
     GROUP BY s.id`,
    [req.params.id, req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Submission not found' });
  res.json(result.rows[0]);
});

module.exports = router;
