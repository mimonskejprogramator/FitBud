# FitBud 

Tohle je můj projekt FitBud – webová appka, ve které si můžu trackovat kalorie, tréninky a spánek. Chci mít jednoduchý dashboard, kde uvidím denní přehledy a poslední aktivity. 

## Funkce (MVP)
- Uživatelské účty (registrace/přihlášení) – email + heslo
- Tracking kalorií (CRUD)
- Tracking tréninku (CRUD)
- Tracking spánku (CRUD)
- Dashboard s denním souhrnem
- Export dat do CSV

## Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- DB: SQLite (běží v Docker containeru s persistent volume)
- Auth: JWT tokens
- Deployment: Docker + Docker Compose
- (TS zvažuji tam, kde to dává value. Jinak čistý JS kvůli rychlosti práce.)

## Jak spustit lokálně

### Varianta 1: Docker (doporučeno)
```bash
# Spuštění celé aplikace (backend + frontend + databáze)
docker-compose up --build

# Nebo na pozadí:
docker-compose up -d

# Zastavení:
docker-compose down
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Databáze: SQLite soubor je uložený v Docker volume `fitbud-data` pro perzistenci dat

### Varianta 2: Bez Dockeru
**Backend (server)**
```bash
cd server
npm install
npm start
# nebo pro dev režim s auto-reloadem:
npm run dev
```
Server poběží na `http://localhost:3000`

**Frontend (client)**
```bash
cd client
npm install
npm run dev
```
Frontend poběží na `http://localhost:5173`

### První spuštění
1. Naklonuj repo
2. Ujisti se, že máš nainstalovaný Docker Desktop (nebo Node.js pro variantu bez Dockeru)
3. Spusť `docker-compose up --build`
4. Otevři prohlížeč na `http://localhost:5173`

## Struktura projektu
- `client/` – React SPA (Vite)
  - `src/` – zdrojové soubory React komponent
  - `vite.config.js` – konfigurace Vite
- `server/` – Express API a SQLite
  - `index.js` – hlavní soubor serveru
  - `routes/` – API endpointy
  - `middleware/` – JWT autentizace
  - `utils/` – pomocné funkce (bcrypt)
  - `package.json` – závislosti backendu
- `README.md` – dokumentace (průběžně doplňuju)

## API Endpointy

### Autentizace

**Registrace**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"heslo123","name":"Test User"}'
```

**Přihlášení**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"heslo123"}'
```

Odpověď obsahuje JWT token, který se používá pro autentizované requesty.

### Jídla (Meals)

**Získání všech jídel**
```bash
curl -X GET http://localhost:3000/api/meals \
  -H "Authorization: Bearer <token>"
```

**Přidání jídla**
```bash
curl -X POST http://localhost:3000/api/meals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Snídaně","calories":450,"protein":20,"carbs":50,"fats":15,"meal_date":"2024-12-01","meal_time":"08:00"}'
```

### Tréninky (Workouts)

**Získání všech tréninků**
```bash
curl -X GET http://localhost:3000/api/workouts \
  -H "Authorization: Bearer <token>"
```

**Přidání tréninku**
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Běh","type":"cardio","duration_minutes":30,"calories_burned":300,"workout_date":"2024-12-01","workout_time":"07:00"}'
```

### Spánek (Sleep)

**Získání všech záznamů spánku**
```bash
curl -X GET http://localhost:3000/api/sleep \
  -H "Authorization: Bearer <token>"
```

**Přidání záznamu spánku**
```bash
curl -X POST http://localhost:3000/api/sleep \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sleep_date":"2024-12-01","bedtime":"23:00","wake_time":"07:00","duration_hours":8,"quality":4}'
```
