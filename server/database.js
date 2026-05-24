import pg from 'pg';

const { Pool, types } = pg;

types.setTypeParser(1082, (value) => value);

let pool = null;

function buildPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10
    });
  }
  return new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'fitbud',
    password: process.env.PGPASSWORD || 'fitbud',
    database: process.env.PGDATABASE || 'fitbud',
    max: 10
  });
}

function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function wrap(rawPool) {
  return {
    async run(sql, params = []) {
      const converted = convertPlaceholders(sql);
      const isInsert = /^\s*INSERT\s/i.test(converted);
      const finalSql = isInsert && !/RETURNING\s/i.test(converted)
        ? `${converted} RETURNING id`
        : converted;
      const result = await rawPool.query(finalSql, params);
      return {
        lastID: result.rows[0]?.id,
        changes: result.rowCount
      };
    },
    async get(sql, params = []) {
      const result = await rawPool.query(convertPlaceholders(sql), params);
      return result.rows[0];
    },
    async all(sql, params = []) {
      const result = await rawPool.query(convertPlaceholders(sql), params);
      return result.rows;
    },
    async exec(sql) {
      await rawPool.query(sql);
    }
  };
}

export async function initDatabase() {
  try {
    pool = buildPool();
    await pool.query('SELECT 1');
    console.log('📦 Databáze připojena (PostgreSQL)');
    await createTables();
    return wrap(pool);
  } catch (error) {
    console.error('❌ Chyba při inicializaci databáze:', error);
    throw error;
  }
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fats REAL DEFAULT 0,
      meal_date DATE NOT NULL,
      meal_time TIME,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      workout_type TEXT,
      duration_minutes INTEGER NOT NULL,
      calories_burned INTEGER DEFAULT 0,
      workout_date DATE NOT NULL,
      workout_time TIME,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sleep (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sleep_date DATE NOT NULL,
      bedtime TIME,
      wake_time TIME,
      duration_hours REAL,
      quality TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS water_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount_ml INTEGER NOT NULL,
      log_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      weight_kg REAL NOT NULL,
      log_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log('✅ Databázové tabulky vytvořeny/ověřeny');
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Databáze není inicializována. Zavolej initDatabase() nejdřív.');
  }
  return wrap(pool);
}

export default { initDatabase, getDatabase };
