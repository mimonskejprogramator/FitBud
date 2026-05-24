import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const sleepRecords = await db.all(
      'SELECT * FROM sleep WHERE user_id = ? ORDER BY sleep_date DESC',
      [req.user.id]
    );

    res.json({ sleep: sleepRecords });
  } catch (error) {
    console.error('Chyba při načítání spánku:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst záznamy spánku' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const sleepRecord = await db.get(
      'SELECT * FROM sleep WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!sleepRecord) {
      return res.status(404).json({ error: 'Záznam spánku nenalezen' });
    }

    res.json({ sleep: sleepRecord });
  } catch (error) {
    console.error('Chyba při načítání spánku:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst záznam spánku' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { sleep_date, bedtime, wake_time, duration_hours, quality, notes } = req.body;

    if (!sleep_date || !duration_hours) {
      return res.status(400).json({
        error: 'Datum a délka spánku jsou povinné'
      });
    }

    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO sleep (user_id, sleep_date, bedtime, wake_time, duration_hours, quality, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, sleep_date, bedtime || null, wake_time || null, duration_hours, quality || null, notes ? String(notes).slice(0, 2000) : null]
    );

    res.status(201).json({
      message: 'Záznam spánku přidán',
      sleep: {
        id: result.lastID,
        user_id: req.user.id,
        sleep_date,
        bedtime,
        wake_time,
        duration_hours,
        quality,
        notes
      }
    });
  } catch (error) {
    console.error('Chyba při vytváření záznamu spánku:', error);
    res.status(500).json({ error: 'Nepodařilo se vytvořit záznam spánku' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { sleep_date, bedtime, wake_time, duration_hours, quality, notes } = req.body;

    const db = getDatabase();

    const existing = await db.get(
      'SELECT id FROM sleep WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Záznam spánku nenalezen' });
    }

    await db.run(
      `UPDATE sleep
       SET sleep_date = ?, bedtime = ?, wake_time = ?, duration_hours = ?, quality = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [sleep_date, bedtime, wake_time, duration_hours, quality, notes, req.params.id, req.user.id]
    );

    res.json({ message: 'Záznam spánku aktualizován' });
  } catch (error) {
    console.error('Chyba při aktualizaci záznamu spánku:', error);
    res.status(500).json({ error: 'Nepodařilo se aktualizovat záznam spánku' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();

    const result = await db.run(
      'DELETE FROM sleep WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Záznam spánku nenalezen' });
    }

    res.json({ message: 'Záznam spánku smazán' });
  } catch (error) {
    console.error('Chyba při mazání záznamu spánku:', error);
    res.status(500).json({ error: 'Nepodařilo se smazat záznam spánku' });
  }
});

export default router;
