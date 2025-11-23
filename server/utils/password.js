import bcrypt from 'bcrypt';

// Počet salt rounds pro bcrypt (10 je dobrý kompromis mezi bezpečností a rychlostí)
const SALT_ROUNDS = 10;

/**
 * Hashuje heslo pomocí bcrypt
 * @param {string} password - Heslo v plain textu
 * @returns {Promise<string>} - Hashované heslo
 */
export async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Chyba při hashování hesla:', error);
    throw new Error('Nepodařilo se zahashovat heslo');
  }
}

/**
 * Porovná heslo s hashem
 * @param {string} password - Heslo v plain textu
 * @param {string} hash - Hashované heslo z databáze
 * @returns {Promise<boolean>} - True pokud se hesla shodují
 */
export async function comparePassword(password, hash) {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    console.error('Chyba při porovnávání hesla:', error);
    throw new Error('Nepodařilo se ověřit heslo');
  }
}

