import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const workouts = await db.all(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC, workout_time DESC',
      [req.user.id]
    );

    res.json({ workouts });
  } catch (error) {
    console.error('Chyba při načítání tréninků:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst tréninky' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const workout = await db.get(
      'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!workout) {
      return res.status(404).json({ error: 'Trénink nenalezen' });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Chyba při načítání tréninku:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst trénink' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, workout_type, duration_minutes, calories_burned, workout_date, workout_time, notes } = req.body;

    if (!name || !duration_minutes || !workout_date) {
      return res.status(400).json({
        error: 'Název, délka a datum jsou povinné'
      });
    }

    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO workouts (user_id, name, workout_type, duration_minutes, calories_burned, workout_date, workout_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, workout_type, duration_minutes, calories_burned || 0, workout_date, workout_time, notes]
    );

    res.status(201).json({
      message: 'Trénink přidán',
      workout: {
        id: result.lastID,
        user_id: req.user.id,
        name,
        workout_type,
        duration_minutes,
        calories_burned: calories_burned || 0,
        workout_date,
        workout_time,
        notes
      }
    });
  } catch (error) {
    console.error('Chyba při vytváření tréninku:', error);
    res.status(500).json({ error: 'Nepodařilo se vytvořit trénink' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, workout_type, duration_minutes, calories_burned, workout_date, workout_time, notes } = req.body;

    const db = getDatabase();

    const existing = await db.get(
      'SELECT id FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Trénink nenalezen' });
    }

    await db.run(
      `UPDATE workouts
       SET name = ?, workout_type = ?, duration_minutes = ?, calories_burned = ?,
           workout_date = ?, workout_time = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [name, workout_type, duration_minutes, calories_burned, workout_date, workout_time, notes, req.params.id, req.user.id]
    );

    res.json({ message: 'Trénink aktualizován' });
  } catch (error) {
    console.error('Chyba při aktualizaci tréninku:', error);
    res.status(500).json({ error: 'Nepodařilo se aktualizovat trénink' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();

    const result = await db.run(
      'DELETE FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Trénink nenalezen' });
    }

    res.json({ message: 'Trénink smazán' });
  } catch (error) {
    console.error('Chyba při mazání tréninku:', error);
    res.status(500).json({ error: 'Nepodařilo se smazat trénink' });
  }
});

export default router;
