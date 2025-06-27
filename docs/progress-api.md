# Progress API Documentation

## Overview
The Progress API provides endpoints for tracking and managing user physical measurements including weight, body fat percentage, and height. The API automatically calculates BMI when both weight and height are available and provides historical data with change calculations for easy frontend integration.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/progress
```

---

## Endpoints

### GET /api/progress
Retrieve all physical progress entries for the authenticated user with optional filtering.

**Query Parameters:**
- `start_date` (string, optional): Filter from start date (YYYY-MM-DD)
- `end_date` (string, optional): Filter to end date (YYYY-MM-DD)  
- `limit` (number, optional): Limit results (1-100, default: 30)
- `offset` (number, optional): Skip results (default: 0)

**Response (200):**
```json
{
  "progress": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "logged_at": "2024-01-20T08:30:00Z",
      "weight_kg": 75.5,
      "body_fat_pct": 18.2,
      "height_cm": 175.0,
      "bmi": 24.65,
      "created_at": "2024-01-20T08:30:00Z",
      "weight_change": -0.8,
      "body_fat_change": -0.5,
      "bmi_change": -0.26,
      "days_since_last": 7
    },
    {
      "id": "uuid",
      "user_id": "uuid", 
      "logged_at": "2024-01-13T09:15:00Z",
      "weight_kg": 76.3,
      "body_fat_pct": 18.7,
      "height_cm": null,
      "bmi": 24.91,
      "created_at": "2024-01-13T09:15:00Z",
      "weight_change": null,
      "body_fat_change": null,
      "bmi_change": null,
      "days_since_last": null
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

### POST /api/progress
Log a new physical progress entry with automatic BMI calculation.

**Request Body:**
```json
{
  "weight_kg": 75.5,
  "body_fat_pct": 18.2,
  "height_cm": 175.0
}
```

**Validation Rules:**
- `weight_kg` (optional): Positive number, max 999.99, 2 decimal places
- `body_fat_pct` (optional): 0-100, 2 decimal places  
- `height_cm` (optional): Positive number, max 299.99, 2 decimal places
- At least one measurement must be provided

**Response (201):**
```json
{
  "message": "Progress entry logged successfully",
  "progress": {
    "id": "uuid",
    "user_id": "uuid",
    "logged_at": "2024-01-20T08:30:00Z",
    "weight_kg": 75.5,
    "body_fat_pct": 18.2,
    "height_cm": 175.0,
    "bmi": 24.65,
    "created_at": "2024-01-20T08:30:00Z"
  }
}
```

---

## Business Logic

### Automatic BMI Calculation
- BMI is automatically calculated when both weight and height are provided
- If only weight is provided, the system looks up the user's most recent height to calculate BMI
- BMI formula: weight (kg) / (height (m))²
- Results are rounded to 2 decimal places

### Change Calculations
Progress entries include calculated changes from the previous entry:
- `weight_change`: Difference in kg from previous weight measurement
- `body_fat_change`: Difference in percentage from previous body fat measurement
- `bmi_change`: Difference from previous BMI calculation
- `days_since_last`: Number of days since the previous progress entry

### Data Flexibility
- All measurements are optional, but at least one must be provided per entry
- Users can log weight-only, body fat-only, or height-only entries
- Missing measurements are stored as null values
- Historical data is preserved even if users don't consistently log all metrics

### Frontend Integration Features
- Change calculations help display progress trends
- `days_since_last` enables streak and frequency tracking
- Pagination support for users with extensive history
- Date filtering for specific time period analysis

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed: At least one measurement (weight, body fat, or height) is required"
}
```

### 400 Bad Request - Invalid Values
```json
{
  "error": "Validation failed: Weight must be positive"
}
```

### 400 Bad Request - Date Range Error  
```json
{
  "error": "Validation failed: End date must be on or after start date"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization token required"
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

### Log weight and body fat
```bash
curl -X POST "/api/progress" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weight_kg": 75.5,
    "body_fat_pct": 18.2
  }'
```

### Log complete measurements with BMI calculation
```bash
curl -X POST "/api/progress" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weight_kg": 75.5,
    "body_fat_pct": 18.2,
    "height_cm": 175.0
  }'
```

### Get all progress entries
```bash
curl -X GET "/api/progress" \
  -H "Authorization: Bearer <token>"
```

### Get progress for specific date range
```bash
curl -X GET "/api/progress?start_date=2024-01-01&end_date=2024-01-31&limit=50" \
  -H "Authorization: Bearer <token>"
```

### Get recent progress with pagination
```bash
curl -X GET "/api/progress?limit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

---

## Integration Notes

### Dashboard Analytics
- Change calculations enable progress charts and trend analysis
- BMI categories can be displayed (underweight, normal, overweight, obese)
- Time-based filtering supports weekly/monthly progress reviews

### Mobile App Features
- `days_since_last` supports reminder scheduling
- Optional measurements allow flexible tracking habits
- Automatic BMI calculation reduces manual entry requirements

### Data Export
- All historical data is preserved for export functionality
- Date filtering enables custom reporting periods
- Change calculations provide ready-to-use analytics data

## Security Features

### Input Validation
- Strict numeric validation with reasonable limits
- Date format validation for query parameters
- SQL injection prevention with parameterized queries

### Ownership Protection
- All queries filter by authenticated user ID
- No cross-user data access possible
- Database constraints ensure data integrity

### Privacy Considerations
- Physical measurements are sensitive health data
- All data is user-specific and access-controlled
- Historical data preserved for user benefit