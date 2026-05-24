
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import mealsRoutes from './routes/meals.js';
import workoutsRoutes from './routes/workouts.js';
import sleepRoutes from './routes/sleep.js';
import waterRoutes from './routes/water.js';
import weightRoutes from './routes/weight.js';

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: IS_PROD ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin nepovolen'));
  },
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', globalLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FitBud API běží!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Vítej v FitBud API' });
});

app.use('/api/auth', authRoutes);

app.use('/api/meals', mealsRoutes);

app.use('/api/workouts', workoutsRoutes);

app.use('/api/sleep', sleepRoutes);

app.use('/api/water', waterRoutes);

app.use('/api/weight', weightRoutes);

app.use((err, req, res, next) => {
  if (err && err.message === 'Origin nepovolen') {
    return res.status(403).json({ error: 'Origin nepovolen' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request příliš velký' });
  }
  console.error('Neočekávaná chyba:', err);
  res.status(500).json({ error: 'Interní chyba serveru' });
});

async function startServer() {
  try {

    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT} (${IS_PROD ? 'production' : 'development'})`);
      console.log(`📊 Health check: /api/health`);
      console.log(`🔒 Povolené originy: ${allowedOrigins.join(', ')}`);
    });

    const shutdown = (signal) => {
      console.log(`\n${signal} přijat, ukončuji server...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Chyba při spuštění serveru:', error);
    process.exit(1);
  }
}

startServer();
