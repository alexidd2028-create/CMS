import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../auth.js';

const router = express.Router();

// Register the first user as admin; subsequent registrations are editors.
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const role = userCount === 0 ? 'admin' : 'editor';
  const hash = bcrypt.hashSync(password, 10);

  const result = db
    .prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)')
    .run(email, hash, role);

  const user = { id: result.lastInsertRowid, email, role };
  res.status(201).json({ token: signToken(user), user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const safeUser = { id: user.id, email: user.email, role: user.role };
  res.json({ token: signToken(safeUser), user: safeUser });
});

export default router;
