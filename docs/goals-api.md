# Goals API Documentation

## Overview
The Goals API provides endpoints for managing user protein goals with validation and business logic to ensure only one active goal per user at a time.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/goals
```

---

## Endpoints

### GET /api/goals
Get the current active protein goal for the authenticated user.

**Response (200):**
```json
{
  "goal": {
    "id": "uuid",
    "target_protein": 150.50,
    "start_date": "2024-01-15",
    "end_date": null,
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T08:00:00Z"
  }
}
```

**Response (404) - No Active Goal:**
```json
{
  "error": "No active goal found"
}
```

### POST /api/goals
Create a new protein goal. This will automatically close any existing active goals.

**Request Body:**
```json
{
  "target_protein": 150.50,
  "start_date": "2024-01-15",
  "end_date": "2024-12-31"
}
```

**Validation Rules:**
- `target_protein`: 5-500 grams, up to 2 decimal places
- `start_date`: YYYY-MM-DD format, cannot be in future
- `end_date`: Optional, YYYY-MM-DD format, must be ≥ start_date

**Response (201):**
```json
{
  "message": "Goal created successfully",
  "goal": {
    "id": "uuid",
    "target_protein": 150.50,
    "start_date": "2024-01-15",
    "end_date": "2024-12-31",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T08:00:00Z"
  }
}
```

### GET /api/goals/history
Get previous goals by date range with pagination.

**Query Parameters:**
- `start_date` (string, optional): Filter from start date (YYYY-MM-DD)
- `end_date` (string, optional): Filter to end date (YYYY-MM-DD)
- `limit` (number, optional): Limit results (1-100, default: 20)
- `offset` (number, optional): Skip results (default: 0)

**Response (200):**
```json
{
  "goals": [
    {
      "id": "uuid",
      "target_protein": 150.50,
      "start_date": "2024-01-15",
      "end_date": "2024-12-31",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "is_active": true
    },
    {
      "id": "uuid",
      "target_protein": 120.00,
      "start_date": "2023-06-01",
      "end_date": "2024-01-14",
      "created_at": "2023-06-01T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "is_active": false
    }
  ],
  "total": 2,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

---

## Business Logic

### One Active Goal Rule
- When creating a new goal, any existing active goals are automatically closed
- The end_date of previous goals is set to one day before the new goal's start_date
- This ensures no overlapping active periods

### Goal States
- **Active Goal**: end_date is NULL or end_date >= today
- **Historical Goal**: end_date < today
- Only one goal can be active at any given time

### Date Validation
- start_date cannot be in the future
- end_date must be on or after start_date
- All dates must be in YYYY-MM-DD format

### Protein Validation
- Minimum: 5 grams (prevents unrealistic values)
- Maximum: 500 grams (reasonable upper limit)
- Precision: Up to 2 decimal places
- Type: Decimal number

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed: Target protein must be at least 5 grams"
}
```

### 400 Bad Request - Date Constraint
```json
{
  "error": "Validation failed: End date must be on or after start date"
}
```

### 400 Bad Request - Future Start Date
```json
{
  "error": "Validation failed: Start date cannot be in the future"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization token required"
}
```

### 404 Not Found
```json
{
  "error": "No active goal found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Example Usage

### Get current active goal
```bash
curl -X GET "/api/goals" \
  -H "Authorization: Bearer <token>"
```

### Create a new goal
```bash
curl -X POST "/api/goals" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "target_protein": 150.50,
    "start_date": "2024-01-15",
    "end_date": "2024-12-31"
  }'
```

### Create an open-ended goal (no end date)
```bash
curl -X POST "/api/goals" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "target_protein": 120.00,
    "start_date": "2024-01-15"
  }'
```

### Get goal history for a date range
```bash
curl -X GET "/api/goals/history?start_date=2023-01-01&end_date=2023-12-31&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Get all historical goals with pagination
```bash
curl -X GET "/api/goals/history?limit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

---

## Database Transactions
The goal creation process uses database transactions to ensure consistency:
1. Begin transaction
2. Close existing active goals
3. Create new goal
4. Commit transaction

If any step fails, all changes are rolled back to maintain data integrity.

## Security Features
- JWT authentication required on all endpoints
- User ownership validation for all operations
- Input sanitization and validation
- SQL injection prevention with parameterized queries
- Date constraint validation to prevent logical errors

## Integration Notes
- Goals integrate with meal tracking for progress calculation
- Historical data preservation for analytics and reporting
- Decimal precision maintained for accurate tracking
- Timezone-aware date handling for global users