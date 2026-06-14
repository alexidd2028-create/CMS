import express from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

function serialize(row) {
  return { ...row, data: JSON.parse(row.data) };
}

function getContentType(idOrName) {
  return (
    db.prepare('SELECT * FROM content_types WHERE id = ?').get(idOrName) ||
    db.prepare('SELECT * FROM content_types WHERE name = ?').get(idOrName)
  );
}

// List entries for a content type (by id or name)
router.get('/:contentType', requireAuth, (req, res) => {
  const ct = getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const rows = db
    .prepare('SELECT * FROM entries WHERE content_type_id = ? ORDER BY id DESC')
    .all(ct.id);
  res.json(rows.map(serialize));
});

router.get('/:contentType/:id', requireAuth, (req, res) => {
  const ct = getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const row = db
    .prepare('SELECT * FROM entries WHERE id = ? AND content_type_id = ?')
    .get(req.params.id, ct.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(serialize(row));
});

router.post('/:contentType', requireAuth, (req, res) => {
  const ct = getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const { data, status } = req.body;
  if (typeof data !== 'object' || data === null) {
    return res.status(400).json({ error: 'data must be an object' });
  }

  const result = db
    .prepare('INSERT INTO entries (content_type_id, data, status) VALUES (?, ?, ?)')
    .run(ct.id, JSON.stringify(data), status || 'draft');

  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(serialize(row));
});

router.put('/:contentType/:id', requireAuth, (req, res) => {
  const ct = getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const existing = db
    .prepare('SELECT * FROM entries WHERE id = ? AND content_type_id = ?')
    .get(req.params.id, ct.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { data, status } = req.body;
  db.prepare(
    "UPDATE entries SET data = ?, status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(
    data ? JSON.stringify(data) : existing.data,
    status ?? existing.status,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id);
  res.json(serialize(row));
});

router.delete('/:contentType/:id', requireAuth, (req, res) => {
  const ct = getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const result = db
    .prepare('DELETE FROM entries WHERE id = ? AND content_type_id = ?')
    .run(req.params.id, ct.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
