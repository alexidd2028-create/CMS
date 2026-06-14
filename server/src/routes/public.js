import express from 'express';
import db from '../db.js';

const router = express.Router();

async function getContentType(name) {
  const result = await db.query('SELECT * FROM content_types WHERE name = $1', [name]);
  return result.rows[0];
}

// Public: list all content types (name/label only, for navigation)
router.get('/content-types', async (req, res) => {
  const result = await db.query('SELECT id, name, label, fields FROM content_types ORDER BY id');
  res.json(result.rows);
});

// Public: list published entries for a content type
router.get('/entries/:contentType', async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const result = await db.query(
    "SELECT id, data, created_at, updated_at FROM entries WHERE content_type_id = $1 AND status = 'published' ORDER BY id DESC",
    [ct.id]
  );
  res.json(result.rows);
});

// Public: get a single published entry
router.get('/entries/:contentType/:id', async (req, res) => {
  const ct = await getContentType(req.params.contentType);
  if (!ct) return res.status(404).json({ error: 'Content type not found' });

  const result = await db.query(
    "SELECT id, data, created_at, updated_at FROM entries WHERE id = $1 AND content_type_id = $2 AND status = 'published'",
    [req.params.id, ct.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

export default router;
