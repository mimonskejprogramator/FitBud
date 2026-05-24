import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || 'token';
const IS_PROD = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  console.error('Chybí JWT_SECRET v .env souboru. Zkopíruj .env.example do .env.');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('JWT_SECRET musí mít alespoň 32 znaků. Vygeneruj např.: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"');
  process.exit(1);
}

export const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

export const COOKIE_TOKEN_NAME = COOKIE_NAME;

export function authenticateToken(req, res, next) {

  let token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Přístup odepřen. Musíš být přihlášený.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Neplatný nebo expirovaný token.'
      });
    }

    req.user = user;
    next();
  });
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
