import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const meals = await db.all(
      'SELECT * FROM meals WHERE user_id = ? ORDER BY meal_date DESC, meal_time DESC',
      [req.user.id]
    );

    res.json({ meals });
  } catch (error) {
    console.error('Chyba při načítání jídel:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst jídla' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const meal = await db.get(
      'SELECT * FROM meals WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!meal) {
      return res.status(404).json({ error: 'Jídlo nenalezeno' });
    }

    res.json({ meal });
  } catch (error) {
    console.error('Chyba při načítání jídla:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst jídlo' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, meal_date, meal_time, notes } = req.body;

    if (!name || !calories || !meal_date) {
      return res.status(400).json({
        error: 'Název, kalorie a datum jsou povinné'
      });
    }

    const db = getDatabase();

    const result = await db.run(
      `INSERT INTO meals (user_id, name, calories, protein, carbs, fats, meal_date, meal_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, calories, protein || 0, carbs || 0, fats || 0, meal_date, meal_time, notes]
    );

    res.status(201).json({
      message: 'Jídlo přidáno',
      meal: {
        id: result.lastID,
        user_id: req.user.id,
        name,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        meal_date,
        meal_time,
        notes
      }
    });
  } catch (error) {
    console.error('Chyba při vytváření jídla:', error);
    res.status(500).json({ error: 'Nepodařilo se vytvořit jídlo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, meal_date, meal_time, notes } = req.body;

    const db = getDatabase();

    const existing = await db.get(
      'SELECT id FROM meals WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Jídlo nenalezeno' });
    }

    await db.run(
      `UPDATE meals
       SET name = ?, calories = ?, protein = ?, carbs = ?, fats = ?,
           meal_date = ?, meal_time = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [name, calories, protein, carbs, fats, meal_date, meal_time, notes, req.params.id, req.user.id]
    );

    res.json({ message: 'Jídlo aktualizováno' });
  } catch (error) {
    console.error('Chyba při aktualizaci jídla:', error);
    res.status(500).json({ error: 'Nepodařilo se aktualizovat jídlo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();

    const result = await db.run(
      'DELETE FROM meals WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Jídlo nenalezeno' });
    }

    res.json({ message: 'Jídlo smazáno' });
  } catch (error) {
    console.error('Chyba při mazání jídla:', error);
    res.status(500).json({ error: 'Nepodařilo se smazat jídlo' });
  }
});

export default router;
