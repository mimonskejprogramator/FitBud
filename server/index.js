import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Načtení env proměnných
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

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

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

