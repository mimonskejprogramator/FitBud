import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/weight
 * Všechny záznamy váhy uživatele seřazené chronologicky
 */
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const logs = await db.all(
      'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date ASC',
      [req.user.id]
    );
    res.json({ logs });
  } catch (error) {
    console.error('Chyba při načítání váhy:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst záznamy' });
  }
});

/**
 * POST /api/weight
 * Nový záznam váhy
 */
router.post('/', async (req, res) => {
  try {
    const { weight_kg, log_date, notes } = req.body;

    const weight = parseFloat(weight_kg);
    if (!weight || weight < 20 || weight > 400) {
      return res.status(400).json({ error: 'Neplatná váha (20-400 kg)' });
    }

    const date = log_date || new Date().toISOString().split('T')[0];

    const db = getDatabase();
    const result = await db.run(
      'INSERT INTO weight_logs (user_id, weight_kg, log_date, notes) VALUES (?, ?, ?, ?)',
      [req.user.id, weight, date, notes || null]
    );

    res.status(201).json({
      message: 'Záznam přidán',
      log: { id: result.lastID, weight_kg: weight, log_date: date, notes }
    });
  } catch (error) {
    console.error('Chyba při ukládání váhy:', error);
    res.status(500).json({ error: 'Nepodařilo se uložit záznam' });
  }
});

/**
 * DELETE /api/weight/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const result = await db.run(
      'DELETE FROM weight_logs WHERE id = ? AND user_id = ?',
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

