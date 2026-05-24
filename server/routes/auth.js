import express from 'express';
import rateLimit from 'express-rate-limit';
import { getDatabase } from '../database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateToken,
  authenticateToken,
  cookieOptions,
  COOKIE_TOKEN_NAME
} from '../middleware/auth.js';
import {
  isValidEmail,
  isValidPassword,
  isValidName
} from '../utils/validation.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Příliš mnoho pokusů o přihlášení, zkus to za 15 minut.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Příliš mnoho pokusů o registraci. Zkus to za hodinu.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function setAuthCookie(res, token) {
  res.cookie(COOKIE_TOKEN_NAME, token, cookieOptions);
}

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Neplatný email' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Heslo musí mít 8–128 znaků' });
    }
    if (!isValidName(name)) {
      return res.status(400).json({ error: 'Jméno musí mít 1–80 znaků' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const db = getDatabase();

    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'Uživatel s tímto emailem už existuje'
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [normalizedEmail, passwordHash, trimmedName]
    );

    const token = generateToken({
      id: result.lastID,
      email: normalizedEmail,
      name: trimmedName
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registrace úspěšná',
      user: {
        id: result.lastID,
        email: normalizedEmail,
        name: trimmedName
      }
    });

  } catch (error) {
    console.error('Chyba při registraci:', error);
    res.status(500).json({
      error: 'Něco se pokazilo při registraci'
    });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email a heslo jsou povinné' });
    }
    if (email.length > 254 || password.length > 128) {
      return res.status(400).json({ error: 'Nesprávný email nebo heslo' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const db = getDatabase();

    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({ error: 'Nesprávný email nebo heslo' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Nesprávný email nebo heslo' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    setAuthCookie(res, token);

    res.json({
      message: 'Přihlášení úspěšné',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Chyba při přihlášení:', error);
    res.status(500).json({
      error: 'Něco se pokazilo při přihlášení'
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_TOKEN_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Odhlášeno' });
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, email, name FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Chyba při načítání profilu:', error);
    res.status(500).json({ error: 'Nepodařilo se načíst profil' });
  }
});

export default router;
