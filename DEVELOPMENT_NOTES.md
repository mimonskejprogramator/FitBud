# Poznámky k vývoji FitBud

## Technologie
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Databáze:** SQLite3
- **Autentizace:** JWT (jsonwebtoken)
- **Grafy:** Chart.js + react-chartjs-2

## Struktura projektu

```
FitBud/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Znovupoužitelné komponenty
│   │   ├── pages/       # Stránky aplikace
│   │   ├── utils/       # Pomocné funkce
│   │   ├── App.jsx      # Hlavní komponenta s routingem
│   │   └── main.jsx     # Entry point
│   └── package.json
├── server/              # Express backend
│   ├── index.js         # Hlavní soubor serveru
│   └── package.json
└── README.md
```

## Spuštění projektu

### Backend (port 3000)
```bash
cd server
npm install
node index.js
```

### Frontend (port 5173)
```bash
cd client
npm install
npm run dev
```

## Databázové schéma

### users
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password (TEXT) - hashované bcrypt
- created_at (DATETIME)

### meals
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- name (TEXT)
- calories (INTEGER)
- protein, carbs, fats (INTEGER)
- meal_date (TEXT)
- meal_time (TEXT)
- notes (TEXT)
- created_at (DATETIME)

### workouts
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- name (TEXT)
- workout_type (TEXT)
- duration_minutes (INTEGER)
- calories_burned (INTEGER)
- workout_date (TEXT)
- workout_time (TEXT)
- notes (TEXT)
- created_at (DATETIME)

### sleep
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- sleep_date (TEXT)
- bedtime (TEXT)
- wake_time (TEXT)
- duration_hours (REAL)
- quality (TEXT)
- notes (TEXT)
- created_at (DATETIME)

## Bezpečnost

- Hesla jsou hashována pomocí bcrypt (10 rounds)
- JWT token má expiraci 7 dní
- Všechny API endpointy kromě login/register vyžadují autentizaci
- SQL injection prevence pomocí prepared statements

## Validace

### Frontend
- Kontrola povinných polí
- Validace číselných hodnot (min/max)
- Kontrola logických limitů (např. spánek max 24h)

### Backend
- Kontrola přítomnosti povinných polí
- Ověření vlastnictví dat (user_id)

## Export dat

- CSV soubory s BOM pro správné zobrazení češtiny v Excelu
- Automatické pojmenování souborů s datem
- Export jednotlivých kategorií nebo všech dat najednou

## Responzivní design

- Mobile-first přístup
- Breakpointy: 480px, 768px, 1024px
- Grid layouty se mění na jeden sloupec na mobilu
- Tlačítka mají plnou šířku na malých obrazovkách

## Známé limitace

- Databáze SQLite není vhodná pro produkci s více uživateli
- Žádné real-time aktualizace
- Obrázky jídel nejsou podporovány
- Offline režim není implementován

## Možná vylepšení do budoucna

- [ ] Přidání profilových obrázků
- [ ] Cíle a milníky (např. cílová váha)
- [ ] Notifikace a připomínky
- [ ] Sociální funkce (sdílení pokroku)
- [ ] Integrace s fitness trackery
- [ ] Databáze potravin s vyhledáváním
- [ ] Pokročilé statistiky a trendy
- [ ] Export do PDF
- [ ] Dark mode
- [ ] Vícejazyčnost

## Testování

Aplikace byla testována manuálně:
- ✅ Registrace a přihlášení
- ✅ CRUD operace pro všechny entity
- ✅ Validace formulářů
- ✅ Export dat
- ✅ Responzivní design na různých zařízeních
- ✅ Grafy a statistiky

## Kontakt

Autor: Martin Rývora
Email: [tvůj email]
GitHub: [tvůj GitHub]

