import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cesta k databázi - buď z env nebo defaultní
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'fitbud.db');

let db = null;

// Inicializace databáze
export async function initDatabase() {
  try {
    // Otevření/vytvoření databáze
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log(`📦 Databáze připojena: ${DB_PATH}`);

    // Vytvoření tabulek
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Chyba při inicializaci databáze:', error);
    throw error;
  }
}

// Vytvoření tabulek
async function createTables() {
  // Tabulka uživatelů
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabulka jídel (meals)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fats REAL DEFAULT 0,
      meal_date DATE NOT NULL,
      meal_time TIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabulka tréninků (workouts)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      workout_type TEXT,
      duration_minutes INTEGER NOT NULL,
      calories_burned INTEGER DEFAULT 0,
      workout_date DATE NOT NULL,
      workout_time TIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabulka spánku (sleep)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sleep (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sleep_date DATE NOT NULL,
      bedtime TIME,
      wake_time TIME,
      duration_hours REAL,
      quality TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Databázové tabulky vytvořeny/ověřeny');
}

// Export databázového objektu
export function getDatabase() {
  if (!db) {
    throw new Error('Databáze není inicializována. Zavolej initDatabase() nejdřív.');
  }
  return db;
}

export default { initDatabase, getDatabase };

