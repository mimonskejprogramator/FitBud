// Načtení env proměnných musí být úplně první, jinak ostatní moduly nevidí JWT_SECRET
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import mealsRoutes from './routes/meals.js';
import workoutsRoutes from './routes/workouts.js';
import sleepRoutes from './routes/sleep.js';
import waterRoutes from './routes/water.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FitBud API běží!',
    timestamp: new Date().toISOString()
  });
});

// Základní route
app.get('/', (req, res) => {
  res.json({ message: 'Vítej v FitBud API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Meals routes
app.use('/api/meals', mealsRoutes);

// Workouts routes
app.use('/api/workouts', workoutsRoutes);

// Sleep routes
app.use('/api/sleep', sleepRoutes);

// Water routes
app.use('/api/water', waterRoutes);

// Spuštění serveru s inicializací databáze
async function startServer() {
  try {
    // Inicializace databáze
    await initDatabase();

    // Spuštění serveru
    app.listen(PORT, () => {
      console.log(`🚀 Server běží na http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Chyba při spuštění serveru:', error);
    process.exit(1);
  }
}

startServer();

