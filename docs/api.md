# REST API Reference

Base URL defaults to `http://localhost:5000`. The frontend hits routes through `/api` (e.g., `/api/users/login`). Unless stated otherwise, responses are JSON.

> 🔐 Endpoints marked with a lock require an `Authorization: Bearer <JWT>` header.

## Auth

### POST `/api/users/register`
Registers a new account.

```json
{
  "username": "George",
  "email": "george@example.com",
  "password": "Secret123!"
}
```

**Response**

```json
{ "token": "<jwt>" }
```

### POST `/api/users/login`
Authenticates existing users.

```json
{
  "email": "george@example.com",
  "password": "Secret123!"
}
```

**Response**

```json
{ "token": "<jwt>" }
```

## Fitness data 🔐

### GET `/api/users/fitness`
Returns an array of fitness entries.

```json
{
  "fitnessData": [
    {
      "activityType": "Running",
      "duration": 45,
      "caloriesBurned": 480,
      "distance": 8.2,
      "date": "2025-11-20T08:16:31.215Z"
    }
  ]
}
```

### POST `/api/users/fitness`
Adds a new entry.

```json
{
  "activityType": "Cycling",
  "duration": 30,
  "caloriesBurned": 300,
  "distance": 12.5
}
```

**Response**

```json
{
  "msg": "Fitness data added successfully",
  "fitnessData": [ /* updated array */ ]
}
```

## Meals 🔐

### GET `/api/users/meals`
List logged meals.

```json
{
  "meals": [
    {
      "mealType": "Breakfast",
      "date": "2025-11-20T07:00:00.000Z",
      "foodItems": [
        { "foodName": "Apple", "calories": 95 }
      ]
    }
  ]
}
```

### POST `/api/users/meal`
Log a meal with food items.

```json
{
  "mealType": "Lunch",
  "foodItems": [
    { "foodName": "Grilled Chicken", "calories": 275 },
    { "foodName": "Rice (1 cup)", "calories": 206 }
  ]
}
```

**Response:** `{ "msg": "Meal logged successfully", "meals": [ ... ] }`

## Nutrition lookup 🔐

### GET `/api/users/food-calories?query=<string>`
Returns calorie estimates from CalorieNinjas (if configured) or the local fallback dataset.

```json
{
  "name": "Banana (1 medium)",
  "caloriesPerServing": 105,
  "servingSizeGrams": 118,
  "source": "calorieninjas"
}
```

Errors:
- `400` – missing query
- `404` – not found in DB
- `502` – upstream error

## Health

### GET `/health`
Always public; reports DB connectivity.

```json
{
  "ok": true,
  "db": "connected"
}
```

## Error format

Errors return `{"msg": "description"}` with appropriate HTTP status (400/401/404/500). For unexpected exceptions, Sentry captures additional metadata when configured.*** End Patch
