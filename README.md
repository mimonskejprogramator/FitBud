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

### Backend (server)
```bash
cd server
npm install
npm start
# nebo pro dev režim s auto-reloadem:
npm run dev
```
Server poběží na `http://localhost:3000`

### Frontend (client)
```bash
cd client
npm install
npm run dev
```
Frontend poběží na `http://localhost:5173`

### První spuštění
1. Naklonuj repo
2. Nainstaluj závislosti pro server i client (viz výše)
3. Spusť nejdřív server, pak client
4. Otevři prohlížeč na `http://localhost:5173`

## Struktura projektu
- `client/` – React SPA (Vite)
  - `src/` – zdrojové soubory React komponent
  - `vite.config.js` – konfigurace Vite
- `server/` – Express API a SQLite
  - `index.js` – hlavní soubor serveru
  - `package.json` – závislosti backendu
- `README.md` – dokumentace (průběžně doplňuju)
