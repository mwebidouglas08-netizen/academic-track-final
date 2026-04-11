const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, regNumber, phone, email, academicLevel, department, researchTopic, password } = req.body;

  if (!firstName || !lastName || !regNumber || !phone || !email || !academicLevel || !department || !password) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = await query(
    'SELECT id FROM students WHERE reg_number=$1 OR email=$2',
    [regNumber.trim().toUpperCase(), email.trim().toLowerCase()]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Registration number or email already exists.' });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO students (first_name, last_name, reg_number, phone, email, academic_level, department, research_topic, password_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, first_name, last_name, reg_number, email, academic_level, department, research_topic, phone`,
    [firstName.trim(), lastName.trim(), regNumber.trim().toUpperCase(), phone.trim(),
     email.trim().toLowerCase(), academicLevel, department.trim(), researchTopic?.trim() || null, hash]
  );

  const student = result.rows[0];
  const token = signToken({ id: student.id, role: 'student', regNumber: student.reg_number });
  res.status(201).json({ token, student });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { regNumber, password } = req.body;
  if (!regNumber || !password) {
    return res.status(400).json({ error: 'Registration number and password are required.' });
  }

  const result = await query(
    `SELECT id, first_name, last_name, reg_number, email, phone, academic_level, department, research_topic, password_hash
     FROM students WHERE reg_number=$1`,
    [regNumber.trim().toUpperCase()]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: 'Invalid registration number or password.' });
  }

  const student = result.rows[0];
  const valid = await bcrypt.compare(password, student.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid registration number or password.' });
  }

  const { password_hash, ...safeStudent } = student;
  const token = signToken({ id: student.id, role: 'student', regNumber: student.reg_number });
  res.json({ token, student: safeStudent });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authStudent, async (req, res) => {
  const result = await query(
    `SELECT id, first_name, last_name, reg_number, email, phone, academic_level, department, research_topic, created_at
     FROM students WHERE id=$1`,
    [req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Student not found' });
  res.json(result.rows[0]);
});

module.exports = router;
