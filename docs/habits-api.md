# Habits API Documentation

## Overview
The Habits API provides endpoints for managing user habits and habit logs with nested routes, proper validation, authentication, and ownership checks.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/habits
```

---

## Habit Management Endpoints

### GET /api/habits
List all habits for the authenticated user with optional filtering.

**Query Parameters:**
- `archived` (string, optional): Filter by archived status ('true', 'false', 'all')
- `limit` (number, optional): Limit results (1-100, default: 20)
- `offset` (number, optional): Skip results (default: 0)

**Response (200):**
```json
{
  "habits": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Drink 8 glasses of water",
      "target_frequency": 7,
      "archived": false,
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "total_logs": 15,
      "completed_logs": 12,
      "completion_rate": 80.00,
      "last_logged": "2024-01-20"
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

### POST /api/habits
Create a new habit.

**Request Body:**
```json
{
  "title": "Drink 8 glasses of water",
  "target_frequency": 7
}
```

**Validation Rules:**
- `title`: 1-255 characters, required, trimmed
- `target_frequency`: Integer 1-7 (days per week)

**Response (201):**
```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Drink 8 glasses of water",
    "target_frequency": 7,
    "archived": false,
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T08:00:00Z",
    "total_logs": 0,
    "completed_logs": 0,
    "completion_rate": 0,
    "last_logged": null
  }
}
```

### PATCH /api/habits/:id
Update a specific habit.

**Path Parameters:**
- `id` (string, required): UUID of the habit

**Request Body (all fields optional):**
```json
{
  "title": "Drink 10 glasses of water",
  "archived": true
}
```

**Response (200):**
```json
{
  "message": "Habit updated successfully",
  "habit": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Drink 10 glasses of water",
    "target_frequency": 7,
    "archived": true,
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-16T09:00:00Z"
  }
}
```

### DELETE /api/habits/:id
Delete a habit and all its associated logs.

**Path Parameters:**
- `id` (string, required): UUID of the habit

**Response (200):**
```json
{
  "message": "Habit deleted successfully"
}
```

---

## Habit Logs Endpoints

### GET /api/habits/:id/logs
Retrieve log history for a specific habit.

**Path Parameters:**
- `id` (string, required): UUID of the habit

**Query Parameters:**
- `start_date` (string, optional): Filter from start date (YYYY-MM-DD)
- `end_date` (string, optional): Filter to end date (YYYY-MM-DD)
- `limit` (number, optional): Limit results (1-100, default: 30)
- `offset` (number, optional): Skip results (default: 0)

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "habit_id": "uuid",
      "log_date": "2024-01-20",
      "completed": true,
      "created_at": "2024-01-20T08:00:00Z"
    },
    {
      "id": "uuid",
      "habit_id": "uuid",
      "log_date": "2024-01-19",
      "completed": false,
      "created_at": "2024-01-19T08:00:00Z"
    }
  ],
  "total": 2,
  "pagination": {
    "limit": 30,
    "offset": 0,
    "has_more": false
  }
}
```

### POST /api/habits/:id/logs
Log completion status for a specific day (upsert behavior).

**Path Parameters:**
- `id` (string, required): UUID of the habit

**Request Body:**
```json
{
  "log_date": "2024-01-20",
  "completed": true
}
```

**Validation Rules:**
- `log_date`: YYYY-MM-DD format, cannot be in future
- `completed`: Boolean (default: false)

**Response (201):**
```json
{
  "message": "Habit log saved successfully",
  "log": {
    "id": "uuid",
    "habit_id": "uuid",
    "log_date": "2024-01-20",
    "completed": true,
    "created_at": "2024-01-20T08:00:00Z"
  }
}
```

### DELETE /api/habits/:id/logs/:logId
Remove a specific log entry.

**Path Parameters:**
- `id` (string, required): UUID of the habit
- `logId` (string, required): UUID of the log entry

**Response (200):**
```json
{
  "message": "Habit log deleted successfully"
}
```

---

## Business Logic

### Upsert Behavior for Logs
When logging for a date that already has an entry, the existing log is updated rather than creating a duplicate. This is handled by the database constraint `UNIQUE(habit_id, log_date)`.

### Archived vs Deleted Habits
- **PATCH with `archived: true`**: Soft deletion - habit remains in database but is marked as archived
- **DELETE**: Hard deletion - permanently removes habit and all associated logs via CASCADE

### Statistics Calculation
The GET /habits endpoint includes calculated statistics:
- `total_logs`: Count of all log entries for the habit
- `completed_logs`: Count of logs where completed = true
- `completion_rate`: Percentage (completed_logs / total_logs * 100)
- `last_logged`: Most recent log date

### Frequency Tracking
- `target_frequency`: Number of days per week the habit should be completed (1-7)
- Actual frequency can be calculated from log history by the frontend
- Completion rate helps track adherence to the target

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed: Habit title is required"
}
```

### 400 Bad Request - Invalid UUID
```json
{
  "error": "Invalid habit ID format"
}
```

### 400 Bad Request - Future Date
```json
{
  "error": "Validation failed: Log date cannot be in the future"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization token required"
}
```

### 404 Not Found - Habit
```json
{
  "error": "Habit not found"
}
```

### 404 Not Found - Log
```json
{
  "error": "Habit log not found"
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

### Create a new habit
```bash
curl -X POST "/api/habits" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning meditation",
    "target_frequency": 5
  }'
```

### Get all active habits
```bash
curl -X GET "/api/habits?archived=false" \
  -H "Authorization: Bearer <token>"
```

### Update a habit title
```bash
curl -X PATCH "/api/habits/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "10-minute morning meditation"
  }'
```

### Archive a habit
```bash
curl -X PATCH "/api/habits/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "archived": true
  }'
```

### Log habit completion
```bash
curl -X POST "/api/habits/123e4567-e89b-12d3-a456-426614174000/logs" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "log_date": "2024-01-20",
    "completed": true
  }'
```

### Get habit logs for last 30 days
```bash
curl -X GET "/api/habits/123e4567-e89b-12d3-a456-426614174000/logs?start_date=2023-12-21&end_date=2024-01-20" \
  -H "Authorization: Bearer <token>"
```

### Delete a log entry
```bash
curl -X DELETE "/api/habits/123e4567-e89b-12d3-a456-426614174000/logs/789e0123-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

---

## Security Features

### Ownership Validation
- All habit operations validate that the authenticated user owns the habit
- Nested log routes validate both habit and log ownership
- Database queries use JOINs to ensure security at the query level

### Input Validation
- UUID format validation for all IDs
- Date validation prevents future log dates
- Title length and frequency range validation
- SQL injection prevention with parameterized queries

### Cascade Operations
- Deleting a habit automatically removes all associated logs
- Database constraints ensure referential integrity
- Prevents orphaned log entries

## Integration Notes
- Habits integrate with dashboard for progress tracking
- Statistics support analytics and reporting features
- Date-based queries optimize for mobile app usage patterns
- Pagination support for users with extensive log history