# Stackline

A full-stack collaborative project management tool (Trello/Asana style):
group projects, boards, draggable task cards, task comments, notifications,
and live updates over WebSockets.

```
collab-tool/
  backend/    Express + Sequelize (SQLite) + Socket.io API
  frontend/   React + Vite + Tailwind client
```

## Features

- Email/password auth with JWT
- Create projects and invite teammates by email
- Boards (columns) per project, draggable and reorderable
- Task cards with title, description, priority, due date, and an assignee,
  draggable between/within boards
- Comment threads on each task
- In-app notifications (task assigned, comment posted, added to a project, ...)
- Real-time sync over Socket.io: every connected collaborator's board updates
  live as tasks, boards, comments, and members change
- Dark, responsive UI with a 3D-tilt hover effect on project/task cards

## Quick start (local)

**Backend**

```bash
cd backend
npm install
cp .env.example .env   # set a real JWT_SECRET
npm run dev
```

Runs on `http://localhost:5000`. A `database.sqlite` file is created
automatically on first run, so there's nothing else to install.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:5173` and talks to the backend above out of the box.

See `backend/README.md` and `frontend/README.md` for the API reference,
Socket.io event list, and a tour of the codebase.

## Build progress

- Steps 1-5: backend (auth, projects/boards/tasks/comments, Socket.io, notifications)
- Steps 6-8: frontend (auth pages, boards/drag-and-drop, comments + notifications + sockets)
- Step 9 (this step): 3D/responsive visual polish, production build config, and
  deployment to Vercel (frontend) + Render (backend)

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step instructions to deploy
the backend to Render and the frontend to Vercel.
