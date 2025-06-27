# Users API Documentation

## Overview
The Users API provides endpoints for managing user profiles with strict ownership validation and security controls. Users can view, update, and delete their own profiles with appropriate authentication and authorization checks.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/users
```

---

## Endpoints

### GET /api/users/:id
Retrieve the authenticated user's profile information including height data from physical progress.

**Path Parameters:**
- `id` (string, required): UUID of the user (must match authenticated user)

**Authorization:**
- Users can only access their own profile data
- Request will be rejected if token user ID doesn't match path parameter

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "auth_provider": "local",
    "height_cm": 175.0,
    "last_height_logged": "2024-01-20T08:30:00Z",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-20T09:15:00Z"
  }
}
```

**Profile Data:**
- `height_cm`: Most recent height from physical_progress table (null if never logged)
- `last_height_logged`: Timestamp of most recent height entry
- `auth_provider`: Authentication method used (local, google, apple, facebook)

### PATCH /api/users/:id
Update user profile fields with validation and security checks.

**Path Parameters:**
- `id` (string, required): UUID of the user (must match authenticated user)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "new@example.com",
  "current_password": "user_password"
}
```

**Validation Rules:**
- `name` (optional): 1-255 characters, trimmed
- `email` (optional): Valid email format, unique across system
- `current_password` (required if email provided): Current password for verification
- At least one field (name or email) must be provided

**Security Requirements:**
- Email updates require current password verification
- Social login accounts cannot update email without password
- Email uniqueness is enforced across all users

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "new@example.com",
    "name": "Updated Name",
    "auth_provider": "local",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-21T10:30:00Z"
  }
}
```

### DELETE /api/users/:id
Permanently delete user account and all associated data.

**Path Parameters:**
- `id` (string, required): UUID of the user (must match authenticated user)

**Request Body:**
```json
{
  "password": "user_password",
  "confirmation": "DELETE"
}
```

**Validation Rules:**
- `password`: Current password for verification
- `confirmation`: Must be exactly "DELETE" to confirm deletion

**Security Requirements:**
- Password verification required for local accounts
- Social login accounts must contact support for deletion
- All related data is deleted via CASCADE constraints

**Response (200):**
```json
{
  "message": "User account deleted successfully"
}
```

**Data Deletion:**
The following data is automatically deleted when a user account is deleted:
- All meals and meal items
- All daily goals
- All habits and habit logs
- All physical progress entries
- User authentication data

---

## Security Features

### Ownership Validation
- **Strict Access Control**: Users can only access their own profile data
- **UUID Validation**: All user IDs are validated for proper UUID format
- **Token Verification**: JWT token user ID must match requested user ID

### Password Requirements
- **Email Updates**: Current password required when changing email
- **Account Deletion**: Password required for permanent account deletion
- **Social Accounts**: Special handling for accounts without passwords

### Data Protection
- **Email Uniqueness**: Prevents duplicate email addresses
- **Cascade Deletion**: Ensures complete data removal on account deletion
- **Transaction Safety**: Database transactions ensure data consistency

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed: At least one field (name or email) must be provided for update"
}
```

### 400 Bad Request - Invalid UUID
```json
{
  "error": "Validation failed: Invalid user ID format"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "error": "Authorization token required"
}
```

### 401 Unauthorized - Wrong Password
```json
{
  "error": "Current password is incorrect"
}
```

### 403 Forbidden - Access Denied
```json
{
  "error": "Access denied: You can only access your own profile"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict - Email Exists
```json
{
  "error": "Email already exists"
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

### Get user profile
```bash
curl -X GET "/api/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

### Update user name
```bash
curl -X PATCH "/api/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Display Name"
  }'
```

### Update email with password verification
```bash
curl -X PATCH "/api/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "current_password": "current_password"
  }'
```

### Delete user account
```bash
curl -X DELETE "/api/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "user_password",
    "confirmation": "DELETE"
  }'
```

---

## Integration Notes

### Profile Management
- Height information is pulled from the physical_progress table
- Profile updates trigger updated_at timestamp changes
- Email changes require re-authentication for security

### Data Relationships
- User profiles integrate with all app modules (meals, goals, habits, progress)
- Account deletion removes all user data via database CASCADE
- Height data from progress tracking is included in profile view

### Frontend Considerations
- Implement confirmation dialogs for account deletion
- Validate email format on frontend before submission
- Handle social login account limitations gracefully
- Display height information when available

## Best Practices

### Security
- Always validate user ownership before allowing operations
- Require password verification for sensitive changes
- Use HTTPS in production for all profile operations
- Implement rate limiting for profile update operations

### User Experience
- Provide clear error messages for validation failures
- Show confirmation dialogs for destructive operations
- Indicate which fields require password verification
- Gracefully handle social login account limitations

### Data Management
- Regular backups before allowing account deletions
- Audit logging for profile changes
- Consider soft delete options for compliance requirements
- Monitor for suspicious profile update patterns