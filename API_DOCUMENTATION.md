# FitBud API Dokumentace

## Přehled
FitBud API poskytuje RESTful endpointy pro správu fitness dat - jídel, tréninků a spánku.

**Base URL:** `http://localhost:3000/api`

---

## Autentizace

Všechny endpointy kromě `/auth/register` a `/auth/login` vyžadují JWT token v hlavičce:

```
Authorization: Bearer <token>
```

### POST /auth/register
Registrace nového uživatele.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "heslo123"
}
```

**Response (201):**
```json
{
  "message": "Uživatel vytvořen",
  "userId": 1
}
```

### POST /auth/login
Přihlášení uživatele.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "heslo123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Jídla (Meals)

### GET /meals
Získání všech jídel aktuálního uživatele.

**Response (200):**
```json
{
  "meals": [
    {
      "id": 1,
      "name": "Snídaně",
      "calories": 450,
      "protein": 20,
      "carbs": 50,
      "fats": 15,
      "meal_date": "2026-03-15",
      "meal_time": "08:30",
      "notes": "Ovesná kaše s ovocem"
    }
  ]
}
```

### POST /meals
Přidání nového jídla.

**Request Body:**
```json
{
  "name": "Oběd",
  "calories": 650,
  "protein": 35,
  "carbs": 70,
  "fats": 20,
  "meal_date": "2026-03-15",
  "meal_time": "12:00",
  "notes": "Kuřecí prsa s rýží"
}
```

**Response (201):**
```json
{
  "message": "Jídlo přidáno",
  "mealId": 2
}
```

### PUT /meals/:id
Aktualizace existujícího jídla.

### DELETE /meals/:id
Smazání jídla.

---

## Tréninky (Workouts)

### GET /workouts
Získání všech tréninků.

**Response (200):**
```json
{
  "workouts": [
    {
      "id": 1,
      "name": "Běh",
      "workout_type": "cardio",
      "duration_minutes": 30,
      "calories_burned": 300,
      "workout_date": "2026-03-15",
      "workout_time": "07:00",
      "notes": "Ranní běh v parku"
    }
  ]
}
```

### POST /workouts
Přidání nového tréninku.

**Typy tréninků:** `cardio`, `strength`, `flexibility`, `sports`, `other`

### PUT /workouts/:id
Aktualizace tréninku.

### DELETE /workouts/:id
Smazání tréninku.

---

## Spánek (Sleep)

### GET /sleep
Získání všech záznamů spánku.

**Response (200):**
```json
{
  "sleep": [
    {
      "id": 1,
      "sleep_date": "2026-03-15",
      "bedtime": "22:30",
      "wake_time": "06:30",
      "duration_hours": 8.0,
      "quality": "good",
      "notes": "Klidný spánek"
    }
  ]
}
```

### POST /sleep
Přidání záznamu spánku.

**Kvalita spánku:** `excellent`, `good`, `fair`, `poor`

### PUT /sleep/:id
Aktualizace záznamu.

### DELETE /sleep/:id
Smazání záznamu.

---

## Chybové kódy

- **200** - OK
- **201** - Created
- **400** - Bad Request (chybějící data)
- **401** - Unauthorized (neplatný token)
- **404** - Not Found
- **500** - Internal Server Error

