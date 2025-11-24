import express from 'express';
import { getDatabase } from '../database.js';
import { hashPassword } from '../utils/password.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrace nového uživatele
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validace vstupů
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, heslo a jméno jsou povinné' 
      });
    }

    // Kontrola délky hesla
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Heslo musí mít alespoň 6 znaků' 
      });
    }

    const db = getDatabase();

    // Kontrola, jestli email už neexistuje
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Uživatel s tímto emailem už existuje' 
      });
    }

    // Hashování hesla
    const passwordHash = await hashPassword(password);

    // Vytvoření nového uživatele
    const result = await db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );

    // Vygenerování JWT tokenu
    const token = generateToken({ 
      id: result.lastID, 
      email 
    });

    // Vrácení odpovědi
    res.status(201).json({
      message: 'Registrace úspěšná',
      user: {
        id: result.lastID,
        email,
        name
      },
      token
    });

  } catch (error) {
    console.error('Chyba při registraci:', error);
    res.status(500).json({ 
      error: 'Něco se pokazilo při registraci' 
    });
  }
});

export default router;

