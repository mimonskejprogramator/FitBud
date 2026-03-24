import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Chybí JWT_SECRET v .env souboru. Zkopíruj .env.example do .env.');
  process.exit(1);
}

/**
 * Middleware pro ověření JWT tokenu
 * Token očekáváme v cookie nebo v Authorization headeru
 */
export function authenticateToken(req, res, next) {
  // Zkusíme získat token z cookie
  let token = req.cookies?.token;
  
  // Pokud není v cookie, zkusíme Authorization header
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  }
  
  // Pokud token chybí
  if (!token) {
    return res.status(401).json({ 
      error: 'Přístup odepřen. Musíš být přihlášený.' 
    });
  }
  
  // Ověření tokenu
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Neplatný nebo expirovaný token.' 
      });
    }
    
    // Uložíme user info do requestu pro další použití
    req.user = user;
    next();
  });
}

/**
 * Vytvoří JWT token pro uživatele
 * @param {object} user - Uživatelské data (id, email)
 * @returns {string} - JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email
  };
  
  // Token vyprší za 7 dní
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

