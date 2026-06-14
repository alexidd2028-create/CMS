import express from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

async function getContentType(idOrName) {
  const byId = /^\d+$/.test(idOrName)
    ? await db.query('SELECT * FROM content_types WHERE id = $1', [idOrName])
    : { rows: [] };
  if (byId.rows[0]) return byId.rows[0];
  const byName = await db.query('SELECT * FROM content_types WHERE name = $1', [idOrName]);
  return byName.rows[0];
}

// List entries for a content type (by id or name)
router.get('/:contentType', requireAuth, async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const result = await db.query(
    'SELECT * FROM entries WHERE content_type_id = $1 ORDER BY id DESC',
    [ct.id]
  );
  res.json(result.rows);
});

router.get('/:contentType/:id', requireAuth, async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const result = await db.query('SELECT * FROM entries WHERE id = $1 AND content_type_id = $2', [
    req.params.id,
    ct.id,
  ]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

router.post('/:contentType', requireAuth, async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const { data, status } = req.body;
  if (typeof data !== 'object' || data === null) {
    return res.status(400).json({ error: 'data must be an object' });
  }

  const result = await db.query(
    'INSERT INTO entries (content_type_id, data, status) VALUES ($1, $2, $3) RETURNING *',
    [ct.id, JSON.stringify(data), status || 'draft']
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:contentType/:id', requireAuth, async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const existing = await db.query('SELECT * FROM entries WHERE id = $1 AND content_type_id = $2', [
    req.params.id,
    ct.id,
  ]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' });

  const { data, status } = req.body;
  const result = await db.query(
    "UPDATE entries SET data = $1, status = $2, updated_at = now() WHERE id = $3 RETURNING *",
    [
      data ? JSON.stringify(data) : JSON.stringify(existing.rows[0].data),
      status ?? existing.rows[0].status,
      req.params.id,
    ]
  );
  res.json(result.rows[0]);
});

router.delete('/:contentType/:id', requireAuth, async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const result = await db.query('DELETE FROM entries WHERE id = $1 AND content_type_id = $2', [
    req.params.id,
    ct.id,
  ]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
