-- FitBud Database Schema
-- SQLite databáze pro tracking kalorií, tréninků a spánku

-- Tabulka uživatelů
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka jídel (meals) - tracking kalorií
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
);

-- Tabulka tréninků (workouts)
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT, -- např. "cardio", "strength", "yoga"
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER DEFAULT 0,
  workout_date DATE NOT NULL,
  workout_time TIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabulka spánku (sleep)
CREATE TABLE IF NOT EXISTS sleep (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  sleep_date DATE NOT NULL,
  bedtime DATETIME NOT NULL,
  wake_time DATETIME NOT NULL,
  duration_hours REAL,
  quality INTEGER CHECK(quality >= 1 AND quality <= 5), -- 1-5 hodnocení kvality
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep(user_id, sleep_date);

