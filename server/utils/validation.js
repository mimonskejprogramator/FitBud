const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === 'string'
    && email.length <= 254
    && EMAIL_RE.test(email);
}

export function isValidPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && password.length <= 128;
}

export function isValidName(name) {
  return typeof name === 'string'
    && name.trim().length >= 1
    && name.length <= 80;
}

export function clipString(value, max) {
  if (value === null || value === undefined) return null;
  const s = String(value);
  return s.length > max ? s.slice(0, max) : s;
}

export function asInt(value, { min = -2147483648, max = 2147483647 } = {}) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export function asFloat(value, { min = -1e9, max = 1e9 } = {}) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoTime(value) {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value !== 'string') return false;
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}
