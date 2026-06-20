# Stackline - Frontend (Complete: Steps 6-9)

React + Vite + Tailwind frontend for the Stackline collaborative project tool.

## Build progress

- Step 6: project setup, auth pages (login/register), AuthContext, protected
  routes, API client wired to the Step 1-5 backend.
- Step 7: project list/dashboard, project board view, board columns,
  task cards, drag-and-drop (tasks between/within columns, column reordering),
  project members/invite.
- Step 8: task detail comments, notifications, Socket.io integration.
- Step 9 (this step): 3D-tilt hover effects on cards and the auth illustration,
  ambient motion, staggered entrance animations, fully responsive board view
  (scroll-snapping, narrower columns on small screens), production build
  config, and deployment to Vercel.

## Visual polish (Step 9)

- `src/components/Tilt.jsx` - reusable cursor-driven 3D tilt wrapper
  (`perspective` + `rotateX/rotateY`), used by `ProjectCard`. Disabled on
  touch devices via `(pointer: coarse)`.
- `TaskCard` gets its own lightweight tilt (smaller angle, drag-aware - it
  flattens the instant a drag starts so it never fights the native HTML5
  drag image).
- `AuthLayout`'s brand panel illustration tilts toward the cursor, and its
  background glow blobs drift with a slow `float` animation
  (`tailwind.config.js` -> `keyframes.float`).
- `Modal` opens with a `modalPop` 3D entrance (perspective + rotateX) instead
  of a flat fade.
- Dashboard project cards fade/slide in with a short stagger
  (`animate-fadeInUp`, delayed per index).
- All motion respects `prefers-reduced-motion` (see `index.css`).
- Board columns are `82vw` (capped at `300px`) on small screens instead of a
  fixed `300px`, so a column fits comfortably on a phone, with scroll-snap
  (`snap-x snap-mandatory`) for clean one-column-at-a-time swiping. Columns
  go back to a fixed `300px` with free scrolling from `sm:` up.
- `vercel.json` - SPA rewrite so client-side routes don't 404 on a hard
  refresh once deployed.

See the repo root's `DEPLOYMENT.md` for the full Vercel + Render deployment
walkthrough.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app expects the backend from Steps 1-5 to be running and reachable at the URL set in
`VITE_API_URL` (defaults to `http://localhost:5000/api`). Socket.io connects to
`VITE_SOCKET_URL` (defaults to `http://localhost:5000`).

## What's included

- `src/api/axios.js` - shared axios instance, attaches the JWT to every request, redirects
  to `/login` on a 401.
- `src/api/auth.js` - `register`, `login`, `me` calls matching `backend/routes/auth.routes.js`.
- `src/api/projects.js`, `src/api/boards.js`, `src/api/tasks.js`, `src/api/comments.js`,
  `src/api/notifications.js` - REST calls matching the corresponding backend route files.
- `src/socket.js` - singleton Socket.io client, authenticated with the same JWT used for
  REST calls.
- `src/context/AuthContext.jsx` - holds the current user/token, restores the session on
  page load by calling `/auth/me`, exposes `login`, `register`, `logout`.
- `src/context/SocketContext.jsx` - opens the socket connection once a user is
  authenticated and tears it down on logout; exposes `useSocket()`.
- `src/context/NotificationContext.jsx` - loads notifications, listens for
  `notification:new` over the socket, exposes unread count and `markAsRead`/
  `markAllAsRead`; backs `NotificationBell`.
- `src/context/ProjectContext.jsx` - loads one project (with its boards and tasks),
  exposes board/task CRUD plus `moveTask` / `moveBoard` drag-and-drop reorder helpers
  with optimistic local state updates, joins the project's socket room and applies
  live `task:*` / `board:*` / `project:member_*` broadcasts from other collaborators.
- `src/components/ProtectedRoute.jsx` / `PublicOnlyRoute.jsx` - route guards.
- `src/pages/Login.jsx`, `src/pages/Register.jsx` - auth forms with client-side validation
  and inline error states.
- `src/pages/Dashboard.jsx` - project list grid with a create-project modal.
- `src/pages/ProjectBoard.jsx` + `src/components/board/` - the board view: draggable
  columns (`BoardColumn`), draggable task cards (`TaskCard`), an add-board ghost column,
  and a task detail/edit modal (`TaskModal`) with title, description, priority, due date,
  assignee, and a live comment thread (`TaskComments`).
- `src/components/notifications/NotificationBell.jsx` - navbar bell with unread badge and
  a dropdown of recent notifications; clicking one marks it read and navigates to the
  linked task.
- `src/components/project/` - `ProjectCard`, `ProjectHeader` (member avatars + invite),
  `CreateProjectModal`, `InviteMemberModal`.
- `src/components/layout/` - `Navbar` (now includes `NotificationBell`), `AppShell`,
  `AuthLayout` (the split-screen auth shell with the card-stack illustration).

## Real-time updates

`src/socket.js` opens a single Socket.io connection per session, sending the JWT as
`auth.token` (matching `backend/sockets/index.js`). `SocketProvider` owns that connection
and exposes it through `useSocket()`.

- `ProjectContext` joins the `project:<id>` room on mount (`project:join`) and leaves it
  on unmount, then listens for `task:created` / `task:updated` / `task:deleted`,
  `board:created` / `board:updated` / `board:deleted` / `board:reordered`, and
  `project:member_added` / `project:member_removed` to keep every connected collaborator's
  board in sync without a page refresh. Handlers dedupe by id, since the action that
  originates a change also applies it locally via its own API response.
- `TaskComments` listens for `comment:created` / `comment:deleted` (filtered to its own
  task) so a comment thread updates live while the task modal is open.
- `NotificationContext` listens on the user's personal room for `notification:new` and
  prepends it to the list immediately.

## Drag-and-drop notes

Drag-and-drop is implemented with the native HTML5 drag events (no extra dependency).
Dragging a task updates its column/position optimistically in local state, then persists
the change with `PUT /api/tasks/:id` (the moved task's `boardId`/`order`, plus an `order`
update for any sibling task whose position shifted). Dragging a board column header
reorders columns and persists with `PUT /api/boards/reorder`.

## Design tokens

Defined in `tailwind.config.js`: a dark slate surface (`bg` / `surface` / `border`), an
indigo primary (`#6c63ff`, matching the backend's default project color) and an amber
accent. Display headings use Space Grotesk, body text uses Inter.
