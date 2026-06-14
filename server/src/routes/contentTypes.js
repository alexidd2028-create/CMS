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

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM content_types ORDER BY id').all();
  res.json(rows.map((r) => ({ ...r, fields: JSON.parse(r.fields) })));
});

router.get('/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM content_types WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, fields: JSON.parse(row.fields) });
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, label, fields } = req.body;
  if (!name || !label) return res.status(400).json({ error: 'name and label required' });
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return res.status(400).json({ error: 'name must be lowercase alphanumeric/underscore' });
  }
  const err = validateFields(fields);
  if (err) return res.status(400).json({ error: err });

  try {
    const result = db
      .prepare('INSERT INTO content_types (name, label, fields) VALUES (?, ?, ?)')
      .run(name, label, JSON.stringify(fields));
    res.status(201).json({ id: result.lastInsertRowid, name, label, fields });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'name already exists' });
    throw e;
  }
});

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const { label, fields } = req.body;
  const existing = db.prepare('SELECT * FROM content_types WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  if (fields) {
    const err = validateFields(fields);
    if (err) return res.status(400).json({ error: err });
  }

  db.prepare('UPDATE content_types SET label = ?, fields = ? WHERE id = ?').run(
    label ?? existing.label,
    fields ? JSON.stringify(fields) : existing.fields,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM content_types WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
