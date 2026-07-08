## HTTP Events
- **POST** `/api/v1/signup` - Creates a new user (admin or standard user).
- **POST** `/api/v1/signin` - Authenticates a user and returns a token.
- **POST** `/api/v1/user/metadata` - Updates the current user's metadata.
- **GET** `/api/v1/avatars` - Retrieves a list of available avatars.
- **GET** `/api/v1/maps` - Retrieves a list of available maps.
- **GET** `/api/v1/user/metadata/bulk` - Retrieves metadata for multiple users by IDs.
- **POST** `/api/v1/space` - Creates a new space with specified dimensions and map.
- **DELETE** `/api/v1/space/:spaceId` - Deletes a specific space by ID.
- **GET** `/api/v1/space/all` - Retrieves all spaces belonging to the user.
- **GET** `/api/v1/space/:spaceId` - Retrieves details and elements of a specific space.
- **POST** `/api/v1/space/element` - Adds a new element to a specific space.
- **DELETE** `/api/v1/space/element` - Removes an element from a specific space.
- **GET** `/api/v1/elements` - Retrieves all available elements to place in spaces.
- **POST** `/api/v1/admin/element` - Admin endpoint to create a new map element.
- **PUT** `/api/v1/admin/element/:elementId` - Admin endpoint to update an existing map element.
- **POST** `/api/v1/admin/avatar` - Admin endpoint to create a new avatar.
- **POST** `/api/v1/admin/map` - Admin endpoint to create a new map with default elements.
- **DELETE** `/api/v1/admin/element/:elementId` - Admin endpoint to delete a map element.
- **DELETE** `/api/v1/admin/avatar/:avatarId` - Admin endpoint to delete an avatar.
- **DELETE** `/api/v1/admin/map/:mapId` - Admin endpoint to delete a map.

*(Note: All authenticated endpoints require an `Authorization: Bearer <token>` header)*

## WebSocket Events

### Client Sent Events
- **join** - Joins a specific space using spaceId and token.
- **move** - Sends updated movement coordinates (x, y) to the server.
- **emote** - Sends an emote action to the server.

### Server Sent Events
- **space-joined** - Acknowledges space join, returning spawn coordinates and existing users.
- **movement-rejected** - Rejects movement due to collision and sends rollback coordinates.
- **movement** - Broadcasts another user's updated movement coordinates.
- **user-left** - Broadcasts that a user has left the space.
- **user-join** - Broadcasts that a new user has joined the space.
- **emote** - Broadcasts an emote action to the space.
- **event-rejected** - Sent if an event fails parsing or validation.
