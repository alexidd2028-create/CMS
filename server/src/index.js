import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import contentTypeRoutes from './routes/contentTypes.js';
import entryRoutes from './routes/entries.js';
import publicRoutes from './routes/public.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/content-types', contentTypeRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`CMS server running on http://localhost:${PORT}`));
