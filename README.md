# FitBud

Webová aplikace pro sledování zdravého životního stylu - jídla, tréninky a spánek na jednom místě.

## O projektu

FitBud je moje ročníková práce. Chtěl jsem něco, kde můžu sledovat kalorie, tréninky i spánek dohromady, protože existující aplikace buď dělají jen jedno, nebo jsou moc komplikované. Tak jsem si udělal vlastní verzi, která je jednoduchá a dělá přesně to, co potřebuju.

## Co to umí

- Registrace a přihlášení (bezpečné, s JWT tokeny)
- Evidence jídel s makroživinami (kalorie, bílkoviny, sacharidy, tuky)
- Tracking tréninků (cardio, posilovna, sport...)
- Sledování spánku (délka, kvalita)
- Sledování váhy s grafem trendu
- Pitný režim - rychlé přidání +250/+500/+750 ml
- Denní cíl kalorií s progress barem
- Dashboard s přehledem dne
- Grafy a statistiky za posledních 7 dní
- Export dat do CSV (pro Excel)
- Tmavý režim (dark mode)

## Jak to spustit

### Varianta 1: Docker (nejjednodušší)

Pokud máš Docker, stačí:

```bash
docker-compose up
```

Aplikace poběží na:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Varianta 2: Manuálně (bez Dockeru)

**1. Backend:**
```bash
cd server
npm install
# Vytvoř .env podle .env.example a nastav JWT_SECRET
cp .env.example .env
npm start
```

**2. Frontend (v novém terminálu):**
```bash
cd client
npm install
npm run dev
```

Aplikace poběží na stejných portech jako u Dockeru.

### První spuštění

1. Otevři http://localhost:5173
2. Klikni na "Registrovat se"
3. Vytvoř účet (email + heslo)
4. Přihlaš se a můžeš začít přidávat jídla, tréninky a spánek

## Technologie

**Frontend:**
- React 18 + Vite (rychlý dev server)
- Shadcn/ui komponenty (moderní UI)
- Tailwind CSS (utility-first styling)
- Chart.js (grafy)
- React Router (navigace)

**Backend:**
- Node.js + Express (REST API)
- SQLite (databáze v jednom souboru)
- JWT (autentizace)
- bcrypt (bezpečné hashování hesel)

## Struktura projektu

```
FitBud/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/     # UI komponenty (navigace, karty...)
│   │   ├── pages/          # Stránky (Dashboard, Meals, Workouts, Sleep, Stats)
│   │   ├── utils/          # Pomocné funkce (export CSV)
│   │   └── App.jsx         # Routing
│   └── package.json
│
├── server/                 # Backend (Express)
│   ├── routes/             # API endpointy (auth, meals, workouts, sleep)
│   ├── middleware/         # JWT autentizace
│   ├── data/               # SQLite databáze (fitbud.db)
│   └── index.js
│
└── docker-compose.yml      # Docker konfigurace
```

## API

Backend běží na `http://localhost:3000` a poskytuje REST API.

**Autentizace:**
- `POST /api/auth/register` - Registrace nového uživatele
- `POST /api/auth/login` - Přihlášení (vrací JWT token)

**Data (vyžadují JWT token v hlavičce):**
- `GET/POST/PUT/DELETE /api/meals` - Jídla
- `GET/POST/PUT/DELETE /api/workouts` - Tréninky
- `GET/POST/PUT/DELETE /api/sleep` - Spánek
- `GET/POST/DELETE /api/water` - Pitný režim
- `GET/POST/DELETE /api/weight` - Záznamy o váze

Všechny requesty kromě login/register musí mít v hlavičce:
```
Authorization: Bearer <token>
```


## Bezpečnost

- Hesla se ukládají hashovaná pomocí bcrypt (nikdy ne v plain textu)
- JWT secret je povinně načítaný z `.env` souboru (nesmí být v kódu)
- Rate limiting na login endpointu (ochrana proti brute-force)
- Každý uživatel vidí jen svoje data (kontrola `user_id` v každé route)

## Problémy, které jsem řešil

- **CORS** - musel jsem nastavit CORS middleware, aby frontend mohl volat backend
- **Spánek přes půlnoc** - výpočet délky spánku, když čas usnutí > čas probuzení
- **CSV export s češtinou** - musel jsem přidat BOM (Byte Order Mark) pro Excel
- **Responzivní navigace** - na mobilu se navigace přesouvá dolů jako bottom bar
- **Dark mode bez bliknutí** - aplikace tématu v `main.jsx` před prvním renderem

## Autor

Martin Rývora - ročníková práce 2026
