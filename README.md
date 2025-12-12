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
- Inline styles (plánuju přejít na Tailwind)

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
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/   # Login, Register, Dashboard
│   │   └── App.jsx
│   └── package.json
├── server/          # Express backend
│   ├── routes/      # API endpointy
│   ├── middleware/  # JWT auth
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

## TODO

- [ ] Grafy a statistiky
- [ ] Export dat do CSV
- [ ] Mobilní responzivita
- [ ] Dark mode
- [ ] Notifikace a připomínky
