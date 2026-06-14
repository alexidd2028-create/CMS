import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const BUCKET = process.env.SUPABASE_BUCKET || 'media';

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ error: 'Media storage not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)' });
  }
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const ext = req.file.originalname.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, req.file.buffer, { contentType: req.file.mimetype });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  res.status(201).json({ url: data.publicUrl });
});

export default router;
