import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/water
 * Vrátí všechny záznamy o pití pro uživatele
 */
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const logs = await db.all(
      'SELECT * FROM water_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ logs });
  } catch (error) {
    console.error('Chyba při načítání pitného režimu:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst záznamy' });
  }
});

/**
 * GET /api/water/today
 * Součet vypité vody za dnešní den
 */
router.get('/today', async (req, res) => {
  try {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const row = await db.get(
      'SELECT COALESCE(SUM(amount_ml), 0) AS total FROM water_logs WHERE user_id = ? AND log_date = ?',
      [req.user.id, today]
    );
    res.json({ total: row.total, date: today });
  } catch (error) {
    console.error('Chyba při načítání denního součtu:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst denní součet' });
  }
});

/**
 * POST /api/water
 * Přidání záznamu (množství v ml)
 */
router.post('/', async (req, res) => {
  try {
    const { amount_ml, log_date } = req.body;

    const amount = parseInt(amount_ml);
    if (!amount || amount <= 0 || amount > 5000) {
      return res.status(400).json({ error: 'Neplatné množství (1-5000 ml)' });
    }

    const date = log_date || new Date().toISOString().split('T')[0];

    const db = getDatabase();
    const result = await db.run(
      'INSERT INTO water_logs (user_id, amount_ml, log_date) VALUES (?, ?, ?)',
      [req.user.id, amount, date]
    );

    res.status(201).json({
      message: 'Záznam přidán',
      log: { id: result.lastID, amount_ml: amount, log_date: date }
    });
  } catch (error) {
    console.error('Chyba při ukládání pitného režimu:', error);
    res.status(500).json({ error: 'Nepodařilo se uložit záznam' });
  }
});

/**
 * DELETE /api/water/:id
 * Smazání záznamu
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const result = await db.run(
      'DELETE FROM water_logs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Záznam nenalezen' });
    }
    res.json({ message: 'Záznam smazán' });
  } catch (error) {
    console.error('Chyba při mazání záznamu:', error);
    res.status(500).json({ error: 'Nepodařilo se smazat záznam' });
  }
});

export default router;

