## HTTP Endpoints

### Authentication & User
- **POST** `/api/v1/signup` - Creates a new user account (admin or standard user).
- **POST** `/api/v1/signin` - Authenticates a user (via username or email) and returns a JWT token, user ID, and role.
- **POST** `/api/v1/google-signin` - Authenticates or registers a user via a Google OAuth credential token.
- **GET** `/api/v1/user/me` - Retrieves current authenticated user details (`id`, `username`, `email`, `googleId`, `avatarId`).
- **POST** `/api/v1/user/metadata` - Updates the current user's metadata (sets `avatarId`).
- **GET** `/api/v1/user/metadata/bulk` - Retrieves avatar metadata for multiple users by IDs query parameter (`?ids=[...]`).

### General Data & Catalog
- **GET** `/api/v1/avatars` - Retrieves a list of available avatars.
- **GET** `/api/v1/maps` - Retrieves a list of available maps with creator details.
- **GET** `/api/v1/elements` - Retrieves all available map elements to place in spaces.

### Space Operations
- **POST** `/api/v1/space` - Creates a new space with specified dimensions or from an existing map.
- **GET** `/api/v1/space/all` - Retrieves all spaces belonging to the current user.
- **GET** `/api/v1/space/:spaceId` - Retrieves details, settings (`weather`, `timeOfDay`), and elements of a specific space.
- **DELETE** `/api/v1/space/:spaceId` - Deletes a specific space by ID (creator only).
- **POST** `/api/v1/space/element` - Adds a new element to a specific space with collision and bounds checking.
- **DELETE** `/api/v1/space/element` - Removes an element from a specific space.

### Admin Endpoints
- **POST** `/api/v1/admin/element` - Admin endpoint to create a new map element.
- **PUT** `/api/v1/admin/element/:elementId` - Admin endpoint to update an existing map element image URL.
- **DELETE** `/api/v1/admin/element/:elementId` - Admin endpoint to delete a map element.
- **POST** `/api/v1/admin/avatar` - Admin endpoint to create a new avatar.
- **DELETE** `/api/v1/admin/avatar/:avatarId` - Admin endpoint to delete an avatar.
- **POST** `/api/v1/admin/map` - Admin endpoint to create a new map with default elements.
- **DELETE** `/api/v1/admin/map/:mapId` - Admin endpoint to delete a map.

*(Note: All authenticated endpoints require an `Authorization: Bearer <token>` header)*

## WebSocket Events

### Client Sent Events
- **join** - Joins a specific space using `spaceId` and `token`.
- **move** - Sends updated movement coordinates (`x`, `y`) to move 1 step in the grid.
- **emote** - Sends an emote action string to the space.
- **update-settings** - Updates space environment settings (`weather`: `"none"` | `"rain"` | `"snow"`, `timeOfDay`: `"day"` | `"night"`). *(Space creator only)*
- **element-added** - Broadcasts a newly placed element (`id`, `elementId`, `spaceId`, `x`, `y`) to clients in the space.
- **element-deleted** - Broadcasts an element removal (`id`) to clients in the space.

### Server Sent Events
- **space-joined** - Acknowledges space join, returning spawn coordinates, existing room users, and space settings (`weather`, `timeOfDay`).
- **movement-rejected** - Rejects movement due to collision or out-of-bounds, sending rollback coordinates.
- **movement** - Broadcasts another user's updated movement coordinates (`userId`, `x`, `y`).
- **user-left** - Broadcasts that a user has left the space (`userId`).
- **user-join** - Broadcasts that a new user has joined the space (`userId`, `x`, `y`).
- **emote** - Broadcasts an emote action to the space (`userId`, `emote`).
- **settings-changed** - Broadcasts updated space settings (`weather`, `timeOfDay`) to all users in the space.
- **element-added** - Broadcasts a newly added space element to all users in the space.
- **element-deleted** - Broadcasts a deleted space element ID to all users in the space.
- **event-rejected** - Sent if an event fails parsing, validation, or authorization (`message`, `code`, `event`).
