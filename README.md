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
- DB: SQLite
- Auth: JWT (httpOnly cookie)
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
