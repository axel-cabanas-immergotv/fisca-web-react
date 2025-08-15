# Admin Routes - Modular Structure

## Overview

The admin routes have been refactored into a modular structure where each entity has its own dedicated route file. This improves maintainability, reduces file size, and makes the codebase more organized.

## File Structure

```
routes/admin/
├── README.md           # This documentation
├── stories.js          # Stories CRUD routes with pagination
├── pages.js           # Pages CRUD routes  
├── modules.js         # Modules CRUD routes
├── categories.js      # Categories CRUD routes
├── users.js           # Users CRUD routes
├── roles.js           # Roles CRUD routes with permissions
└── permissions.js     # Permissions CRUD routes
```

## Route Structure

Each entity router follows the RESTful convention:

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/admin/{entity}`     | List all entities        |
| GET    | `/api/admin/{entity}/:id` | Get single entity        |
| POST   | `/api/admin/{entity}`     | Create new entity        |
| PUT    | `/api/admin/{entity}/:id` | Update entity            |
| DELETE | `/api/admin/{entity}/:id` | Delete entity            |

## Entity-Specific Features

### Stories (`stories.js`)
- ✅ **Pagination**: Supports `page`, `limit`, `status`, `category_id`, `search` query parameters
- ✅ **Filtering**: Filter by status, category, and search in title/subtitle
- ✅ **Auto-slug generation**: Generates URL-friendly slugs from titles
- ✅ **Ownership checks**: Users can only edit/delete their own stories (unless they have `_all` permissions)
- ✅ **Rich associations**: Includes author and category data

### Pages (`pages.js`)
- ✅ **System page protection**: System pages cannot be deleted or have their slugs modified
- ✅ **Hierarchical support**: Supports parent-child relationships
- ✅ **Ownership checks**: Uses `canEditOwn` middleware
- ✅ **Rich associations**: Includes author and parent/children data

### Modules (`modules.js`)
- ✅ **System modules**: Built-in modules like Header and Footer
- ✅ **Type-based ordering**: Orders by module type and sort order
- ✅ **Update only**: No create/delete operations (modules are system-defined)

### Categories (`categories.js`)
- ✅ **Hierarchical support**: Supports parent-child relationships
- ✅ **Public access**: GET routes don't require specific permissions
- ✅ **Color support**: Categories can have custom colors
- ✅ **Auto-sorting**: Orders by sort_order and name

### Users (`users.js`)
- ✅ **Role associations**: Includes user roles
- ✅ **Password protection**: Excludes password from responses
- ✅ **Self-protection**: Users cannot delete their own accounts
- ✅ **Permission-based access**: Full CRUD with proper permissions

### Roles (`roles.js`)
- ✅ **Permission management**: Can assign/remove permissions from roles
- ✅ **Usage protection**: Cannot delete roles that are assigned to users
- ✅ **Rich associations**: Includes all associated permissions
- ✅ **Batch permission updates**: Updates permissions in single operation

### Permissions (`permissions.js`)
- ✅ **System permissions**: Manages the permission system
- ✅ **Usage protection**: Cannot delete permissions assigned to roles
- ✅ **Entity/Action ordering**: Orders by entity and action for clarity

## Middleware Integration

All routes maintain the same middleware structure:

### Authentication
- `verifyToken`: Applied to all admin routes in the main router

### Authorization
- `hasPermission('{entity}.{action}')`: Applied per route based on action
- `canEditOwn('{Entity}')`: Applied to update/delete routes where applicable

### Entity-Specific Middleware
- **Stories**: Custom ownership checks for edit/delete operations
- **Pages**: System page protection logic
- **Users**: Self-deletion prevention
- **Roles/Permissions**: Usage validation before deletion

## Error Handling

All routes follow consistent error handling patterns:

```javascript
try {
  // Route logic
} catch (error) {
  console.error('Operation error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
```

## Response Format

All routes return consistent response formats:

### Success Response
```javascript
{
  success: true,
  data: entity || entities,
  pagination?: { // Only for paginated endpoints
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description"
}
```

## Migration Benefits

### Before Refactoring
- ❌ Single 506-line file with all routes
- ❌ Duplicate routes (stories had 2 definitions)
- ❌ Difficult to maintain and extend
- ❌ Mixed concerns in single file

### After Refactoring
- ✅ 7 focused files, each under 170 lines
- ✅ No duplicate routes
- ✅ Clear separation of concerns
- ✅ Easy to extend and maintain
- ✅ Consistent patterns across entities
- ✅ Better code organization

## Usage Examples

### Stories with Pagination
```javascript
// Get first page of published stories
GET /api/admin/stories?page=1&limit=10&status=published

// Search stories
GET /api/admin/stories?search=javascript&page=1

// Filter by category
GET /api/admin/stories?category_id=5&page=1
```

### Creating a New Role with Permissions
```javascript
POST /api/admin/roles
{
  "name": "editor",
  "display_name": "Content Editor",
  "permissions": [1, 2, 3, 4] // Permission IDs
}
```

## Extension Guidelines

When adding new entities:

1. Create new file: `routes/admin/{entity}.js`
2. Follow the existing pattern structure
3. Import required models and middleware
4. Implement CRUD operations as needed
5. Add proper error handling and validation
6. Update main `routes/admin.js` to mount the new router
7. Document entity-specific features in this README

This modular structure provides a solid foundation for scaling the admin API while maintaining code clarity and consistency. 