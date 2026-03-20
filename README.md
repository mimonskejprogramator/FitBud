# FitBud

Webová aplikace pro sledování zdravého životního stylu - jídla, tréninky a spánek na jednom místě.

## O projektu

FitBud je moje ročníková práce. Chtěl jsem něco, kde můžu sledovat kalorie, tréninky i spánek dohromady, protože existující aplikace buď dělají jen jedno, nebo jsou moc komplikované. Tak jsem si udělal vlastní verzi, která je jednoduchá a dělá přesně to, co potřebuju.

## Co to umí

- Registrace a přihlášení (bezpečné, s JWT tokeny)
- Evidence jídel s makroživinami (kalorie, bílkoviny, sacharidy, tuky)
- Tracking tréninků (cardio, posilovna, sport...)
- Sledování spánku (délka, kvalita)
- Dashboard s přehledem dne
- Grafy a statistiky za posledních 7 dní
- Export dat do CSV (pro Excel)

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

Všechny requesty kromě login/register musí mít v hlavičce:
```
Authorization: Bearer <token>
```

## Co funguje

- ✅ Bezpečná autentizace (bcrypt + JWT)
- ✅ Evidence jídel s makroživinami
- ✅ Tracking tréninků (5 typů aktivit)
- ✅ Sledování spánku s hodnocením kvality
- ✅ Dashboard s denním přehledem
- ✅ Grafy za posledních 7 dní
- ✅ Export do CSV
- ✅ Responzivní design (funguje na mobilu i desktopu)
- ✅ Moderní UI (Shadcn/ui komponenty)

## Co chci ještě přidat

- [ ] Pitný režim (sledování vody)
- [ ] Dark mode (CSS proměnné jsou připravené)
- [ ] Toast notifikace (komponenta je připravená)
- [ ] Týdenní/měsíční statistiky
- [ ] Cíle a milníky
- [ ] Filtry a vyhledávání

## Problémy, které jsem řešil

- **CORS** - musel jsem nastavit CORS middleware, aby frontend mohl volat backend
- **Spánek přes půlnoc** - výpočet délky spánku, když čas usnutí > čas probuzení
- **CSV export s češtinou** - musel jsem přidat BOM (Byte Order Mark) pro Excel
- **Responzivní navigace** - na mobilu se navigace přesouvá dolů jako bottom bar

## Autor

Martin Rývora - ročníková práce 2026
