import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Chyba při hashování hesla:', error);
    throw new Error('Nepodařilo se zahashovat heslo');
  }
}

export async function comparePassword(password, hash) {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    console.error('Chyba při porovnávání hesla:', error);
    throw new Error('Nepodařilo se ověřit heslo');
  }
}
