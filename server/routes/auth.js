import express from 'express';
import rateLimit from 'express-rate-limit';
import { getDatabase } from '../database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Omezení pokusů o přihlášení - max 5 za 15 minut z jedné IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Příliš mnoho pokusů o přihlášení, zkus to za 15 minut.' },
  standardHeaders: true,
  legacyHeaders: false,
});

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

/**
 * POST /api/auth/login
 * Přihlášení uživatele
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validace vstupů
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email a heslo jsou povinné'
      });
    }

    const db = getDatabase();

    // Najít uživatele podle emailu
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Nesprávný email nebo heslo'
      });
    }

    // Ověření hesla
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Nesprávný email nebo heslo'
      });
    }

    // Vygenerování JWT tokenu
    const token = generateToken({
      id: user.id,
      email: user.email
    });

    // Vrácení odpovědi
    res.json({
      message: 'Přihlášení úspěšné',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Chyba při přihlášení:', error);
    res.status(500).json({
      error: 'Něco se pokazilo při přihlášení'
    });
  }
});

export default router;

