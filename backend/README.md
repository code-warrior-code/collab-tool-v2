# Collab Tool - Backend (Complete: Steps 1-5)

The backend is now complete. This package contains everything: data
models, authentication, projects/boards/tasks/comments, WebSockets and
notifications, and the final `server.js` that wires it all together.

## Step 5: Final wiring and deployment (new in this zip)

- `server.js` - creates the Express app and an HTTP server, attaches
  Socket.io to it, registers every route module under `/api/...`, calls
  `initSockets(io)`, syncs the database, and starts listening.
  `app.set('io', io)` is what lets every controller reach the socket
  server through `req.app.get('io')`.
- `render.yaml` - optional one-click config for deploying to Render.

### Running locally

```bash
cd backend
npm install
cp .env.example .env
# open .env and set a real JWT_SECRET (any long random string)
npm run dev
```

The API will be available at `http://localhost:5000/api`, and the
Socket.io server on the same port. A `database.sqlite` file is created
automatically on first run -- no separate database server needed.

Quick smoke test once it's running:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Connecting from a frontend (for Step 6 onward)

REST calls need the JWT in the `Authorization` header:

```js
fetch(`${API_URL}/api/projects`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

Socket.io client connects with the same token and joins a project room:

```js
import { io } from 'socket.io-client';

const socket = io(API_URL, { auth: { token } });
socket.emit('project:join', projectId);
socket.on('task:created', (task) => { /* update UI */ });
socket.on('notification:new', (notification) => { /* show toast */ });
```

### Deploying to Render

1. Push this `backend/` folder to a GitHub repository.
2. On Render, choose "New Web Service" and connect the repo (or use the
   included `render.yaml` for one-click setup via "New Blueprint").
3. Build command: `npm install`, start command: `npm start`.
4. Set environment variables: `JWT_SECRET` (long random string),
   `JWT_EXPIRES_IN` (e.g. `7d`), `CLIENT_URL` (your deployed frontend URL,
   e.g. `https://your-app.vercel.app`).
5. Render assigns `PORT` automatically; `server.js` already reads it from
   `process.env.PORT`.

Note: SQLite stores data in a single file on disk. Render's free instances
have an ephemeral filesystem, so data does not persist across redeploys
unless you attach a paid persistent disk. For a production deployment
where data must survive redeploys, either add a Render persistent disk
mounted at the backend folder, or swap `config/db.js` to a managed
Postgres database (Sequelize supports this by changing `dialect` to
`postgres` and pointing `storage`/connection options at a `DATABASE_URL`).

## Full API reference

**Auth**
- `POST /api/auth/register` - `{ name, email, password }`
- `POST /api/auth/login` - `{ email, password }`
- `GET /api/auth/me`

**Projects**
- `GET /api/projects`
- `POST /api/projects` - `{ title, description?, color? }`
- `GET /api/projects/:id`
- `PUT /api/projects/:id` (owner only)
- `DELETE /api/projects/:id` (owner only)
- `POST /api/projects/:id/members` - `{ email }` (owner only)
- `DELETE /api/projects/:id/members/:userId` (owner only)
- `POST /api/projects/:projectId/boards` - `{ title }`

**Boards**
- `PUT /api/boards/:id` - `{ title }`
- `DELETE /api/boards/:id`
- `PUT /api/boards/reorder` - `{ boards: [{ id, order }] }`
- `POST /api/boards/:boardId/tasks` - `{ title, description?, priority?, dueDate?, assigneeId? }`

**Tasks**
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id` - any of `{ title, description, priority, dueDate, assigneeId, boardId, order }`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/:taskId/comments`
- `POST /api/tasks/:taskId/comments` - `{ content }`

**Comments**
- `DELETE /api/comments/:id` (author only)

**Notifications**
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

All routes except register/login require `Authorization: Bearer <token>`.

## Socket.io events

| Event | Direction | Payload |
|---|---|---|
| `project:join` | client to server | `projectId` |
| `project:leave` | client to server | `projectId` |
| `task:created` | server to client | full task |
| `task:updated` | server to client | full task |
| `task:moved` | server to client | `{ taskId, fromBoardId, toBoardId }` |
| `task:deleted` | server to client | `{ id, boardId }` |
| `comment:created` | server to client | `{ taskId, comment }` |
| `comment:deleted` | server to client | `{ id, taskId }` |
| `board:created` / `board:updated` / `board:deleted` / `board:reordered` | server to client | board(s) |
| `project:member_added` / `project:member_removed` | server to client | member info |
| `notification:new` | server to client | notification |

## Data model overview

```
User ---< ProjectMember >--- Project
Project ---< Board ---< Task >--- User (assignee, creator)
Task ---< Comment >--- User (author)
User ---< Notification
```

## What's next

Backend is fully done. The frontend (Steps 6-9) is complete too - see
`frontend/README.md` and the repo root's `DEPLOYMENT.md` for the deployment
walkthrough:

- Step 6: Frontend base - setup, auth pages, context
- Step 7: Frontend boards + task cards (drag-drop UI)
- Step 8: Frontend comments + notifications + socket integration
- Step 9: Frontend polish (responsive/interactive design) + zip + deployment README
