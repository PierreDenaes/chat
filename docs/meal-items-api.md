# Meal Items API Documentation

## Overview
The Meal Items API provides nested endpoints for managing individual food items within meals. All endpoints require authentication and enforce meal ownership.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/meals/:id/items
```

---

## Endpoints

### POST /api/meals/:id/items
Add one or more food items to a specific meal.

**Path Parameters:**
- `id` (string, required): UUID of the meal

**Request Body (Single Item):**
```json
{
  "name": "Greek Yogurt",
  "quantity": 150,
  "unit": "g",
  "protein": 15,
  "carbs": 10,
  "fat": 5,
  "calories": 140
}
```

**Request Body (Multiple Items):**
```json
{
  "items": [
    {
      "name": "Greek Yogurt",
      "quantity": 150,
      "unit": "g",
      "protein": 15,
      "carbs": 10,
      "fat": 5,
      "calories": 140
    },
    {
      "name": "Banana",
      "quantity": 1,
      "unit": "medium",
      "protein": 1,
      "carbs": 25,
      "fat": 0.5,
      "calories": 105
    }
  ]
}
```

**Validation Rules:**
- `name`: 1-255 characters, required
- `quantity`: Positive number, max 99,999
- `unit`: 1-50 characters, required
- `protein`: Non-negative number, max 9,999 (default: 0)
- `carbs`: Non-negative number, max 9,999 (default: 0)
- `fat`: Non-negative number, max 9,999 (default: 0)
- `calories`: Non-negative number, max 99,999 (default: 0)
- Maximum 50 items per request

**Response (201):**
```json
{
  "message": "2 item(s) added to meal successfully",
  "items": [
    {
      "id": "uuid",
      "meal_id": "uuid",
      "name": "Greek Yogurt",
      "quantity": 150,
      "unit": "g",
      "protein": 15,
      "carbs": 10,
      "fat": 5,
      "calories": 140,
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z"
    },
    {
      "id": "uuid",
      "meal_id": "uuid",
      "name": "Banana",
      "quantity": 1,
      "unit": "medium",
      "protein": 1,
      "carbs": 25,
      "fat": 0.5,
      "calories": 105,
      "created_at": "2024-01-15T08:01:00Z",
      "updated_at": "2024-01-15T08:01:00Z"
    }
  ]
}
```

### PATCH /api/meals/:id/items/:itemId
Update a specific meal item's details.

**Path Parameters:**
- `id` (string, required): UUID of the meal
- `itemId` (string, required): UUID of the meal item

**Request Body (all fields optional):**
```json
{
  "name": "Low-Fat Greek Yogurt",
  "quantity": 200,
  "unit": "g",
  "protein": 20,
  "carbs": 8,
  "fat": 2,
  "calories": 120
}
```

**Validation Rules:**
- All fields are optional
- Same validation rules as POST endpoint
- At least one field must be provided

**Response (200):**
```json
{
  "message": "Meal item updated successfully",
  "item": {
    "id": "uuid",
    "meal_id": "uuid",
    "name": "Low-Fat Greek Yogurt",
    "quantity": 200,
    "unit": "g",
    "protein": 20,
    "carbs": 8,
    "fat": 2,
    "calories": 120,
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T09:00:00Z"
  }
}
```

### DELETE /api/meals/:id/items/:itemId
Remove a specific item from a meal.

**Path Parameters:**
- `id` (string, required): UUID of the meal
- `itemId` (string, required): UUID of the meal item

**Response (200):**
```json
{
  "message": "Meal item deleted successfully"
}
```

---

## Security Features

### Ownership Validation
- All endpoints verify that the authenticated user owns the meal
- Cross-user access is prevented at the database level
- Invalid meal/item combinations return 404 errors

### Input Validation
- UUID format validation for all IDs
- Comprehensive validation for nutritional values
- Protection against negative values and unrealistic quantities
- String length limits to prevent abuse

### Error Handling
- Detailed validation error messages
- Proper HTTP status codes
- Consistent error response format

---

## Error Responses

### 400 Bad Request - Invalid Input
```json
{
  "error": "Validation failed: Quantity must be positive"
}
```

### 400 Bad Request - Invalid UUID
```json
{
  "error": "Invalid meal ID or item ID format"
}
```

### 400 Bad Request - No Updates
```json
{
  "error": "No valid fields to update"
}
```

### 400 Bad Request - Too Many Items
```json
{
  "error": "Too many items (maximum 50 per request)"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization token required"
}
```

### 404 Not Found - Meal
```json
{
  "error": "Meal not found"
}
```

### 404 Not Found - Item
```json
{
  "error": "Meal item not found"
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

### Add items to a meal
```bash
curl -X POST "/api/meals/123e4567-e89b-12d3-a456-426614174000/items" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "Chicken Breast",
        "quantity": 200,
        "unit": "g",
        "protein": 46,
        "carbs": 0,
        "fat": 4,
        "calories": 220
      },
      {
        "name": "Brown Rice",
        "quantity": 100,
        "unit": "g",
        "protein": 8,
        "carbs": 77,
        "fat": 2,
        "calories": 350
      }
    ]
  }'
```

### Update a specific item
```bash
curl -X PATCH "/api/meals/123e4567-e89b-12d3-a456-426614174000/items/789e0123-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 250,
    "protein": 57.5
  }'
```

### Delete an item
```bash
curl -X DELETE "/api/meals/123e4567-e89b-12d3-a456-426614174000/items/789e0123-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

---

## Database Relationships

The meal items are automatically deleted when their parent meal is deleted (CASCADE). All operations maintain referential integrity and ensure proper cleanup of orphaned records.

## Performance Considerations

- Bulk item creation is optimized with Promise.all()
- Database queries include ownership validation in a single query
- Proper indexing on foreign keys ensures fast lookups
- UUID validation prevents unnecessary database calls