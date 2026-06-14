import express from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = express.Router();

const VALID_FIELD_TYPES = ['text', 'richtext', 'number', 'boolean', 'date', 'media'];

function validateFields(fields) {
  if (!Array.isArray(fields) || fields.length === 0) return 'fields must be a non-empty array';
  for (const f of fields) {
    if (!f.name || !f.type) return 'each field needs a name and type';
    if (!VALID_FIELD_TYPES.includes(f.type)) return `invalid field type: ${f.type}`;
  }
  return null;
}

router.get('/', requireAuth, async (req, res) => {
  const result = await db.query('SELECT * FROM content_types ORDER BY id');
  res.json(result.rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const result = await db.query('SELECT * FROM content_types WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, label, fields } = req.body;
  if (!name || !label) return res.status(400).json({ error: 'name and label required' });
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return res.status(400).json({ error: 'name must be lowercase alphanumeric/underscore' });
  }
  const err = validateFields(fields);
  if (err) return res.status(400).json({ error: err });

  try {
    const result = await db.query(
      'INSERT INTO content_types (name, label, fields) VALUES ($1, $2, $3) RETURNING id',
      [name, label, JSON.stringify(fields)]
    );
    res.status(201).json({ id: result.rows[0].id, name, label, fields });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'name already exists' });
    throw e;
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { label, fields } = req.body;
  const existing = await db.query('SELECT * FROM content_types WHERE id = $1', [req.params.id]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' });

  if (fields) {
    const err = validateFields(fields);
    if (err) return res.status(400).json({ error: err });
  }

  await db.query('UPDATE content_types SET label = $1, fields = $2 WHERE id = $3', [
    label ?? existing.rows[0].label,
    fields ? JSON.stringify(fields) : JSON.stringify(existing.rows[0].fields),
    req.params.id,
  ]);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await db.query('DELETE FROM content_types WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
