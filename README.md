# FitBud

Webová aplikace pro sledování zdravého životního stylu - kalorie, tréninky a spánek.

## O projektu

FitBud je moje ročníková práce, která kombinuje tracking výživy, fyzické aktivity a spánku do jedné aplikace. Cílem je mít přehledný dashboard s denními statistikami a možností dlouhodobě sledovat pokrok.

## Hlavní funkce

- Uživatelské účty (registrace/přihlášení)
- Evidence jídel a kalorií
- Tracking tréninků
- Sledování spánku
- Dashboard s denním přehledem

## Technologie

**Frontend:**
- React 18 + Vite
- React Router pro navigaci
- Shadcn/ui komponenty (Radix UI primitives)
- Tailwind CSS pro styling
- Chart.js pro grafy a statistiky
- Lucide React pro ikony

**Backend:**
- Node.js + Express
- SQLite databáze
- JWT autentizace
- bcrypt pro hashování hesel

**Deployment:**
- Docker + Docker Compose
- Persistent volume pro databázi

## Struktura projektu

```
FitBud/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI komponenty
│   │   │   ├── ui/         # Shadcn/ui komponenty
│   │   │   ├── AppNav.jsx  # Navigace
│   │   │   ├── Layout.jsx  # Layout wrapper
│   │   │   ├── Loading.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/          # Stránky aplikace
│   │   ├── utils/          # Pomocné funkce (export CSV)
│   │   ├── hooks/          # Custom hooks (toast)
│   │   ├── lib/            # Utility funkce
│   │   ├── App.jsx         # Routing
│   │   └── main.jsx        # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── routes/             # API endpointy
│   ├── middleware/         # JWT auth
│   ├── utils/              # Password hashing
│   ├── data/               # SQLite databáze
│   ├── database.js
│   └── index.js
└── docker-compose.yml
```

## API Dokumentace

Kompletní API dokumentace je dostupná po spuštění serveru na `http://localhost:3000/api/health`

### Základní endpointy:

- `POST /api/auth/register` - Registrace
- `POST /api/auth/login` - Přihlášení
- `GET /api/meals` - Seznam jídel (vyžaduje JWT)
- `POST /api/meals` - Přidání jídla (vyžaduje JWT)
- `GET /api/workouts` - Seznam tréninků (vyžaduje JWT)
- `POST /api/workouts` - Přidání tréninku (vyžaduje JWT)
- `GET /api/sleep` - Záznamy spánku (vyžaduje JWT)
- `POST /api/sleep` - Přidání záznamu (vyžaduje JWT)

Všechny endpointy kromě autentizace vyžadují JWT token v hlavičce:
```
Authorization: Bearer <token>
```

## Hotové funkce

- ✅ Uživatelské účty s bezpečnou autentizací (bcrypt + JWT)
- ✅ Evidence jídel s makroživinami
- ✅ Tracking tréninků s různými typy aktivit
- ✅ Sledování spánku s hodnocením kvality
- ✅ Dashboard s denním přehledem a statistikami
- ✅ Export dat do CSV
- ✅ Moderní UI s Shadcn/ui komponentami
- ✅ Responzivní design (desktop + mobil)
- ✅ Grafy a vizualizace dat (Chart.js)

## TODO

- [ ] Dark mode
- [ ] Notifikace a připomínky
- [ ] Týdenní/měsíční statistiky
- [ ] Cíle a milníky
