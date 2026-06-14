import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../auth.js';

const router = express.Router();

// Register the first user as admin; subsequent registrations are editors.
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

  const countResult = await db.query('SELECT COUNT(*) AS c FROM users');
  const role = Number(countResult.rows[0].c) === 0 ? 'admin' : 'editor';
  const hash = bcrypt.hashSync(password, 10);

  const result = await db.query(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
    [email, hash, role]
  );

  const user = { id: result.rows[0].id, email, role };
  res.status(201).json({ token: signToken(user), user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const safeUser = { id: user.id, email: user.email, role: user.role };
  res.json({ token: signToken(safeUser), user: safeUser });
});

export default router;
