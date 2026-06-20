# Deployment Guide — Free (Render + Vercel)

## Step 1: GitHub Pe Upload Karo

```bash
cd collab-tool-final
git init
git add .
git commit -m "initial commit"
```

GitHub pe naya repo banao, phir:

```bash
git remote add origin https://github.com/TUMHARA_USERNAME/collab-tool.git
git push -u origin main
```

---

## Step 2: Backend + Database — Render.com (Free)

> `render.yaml` already hai jo **automatically** free Postgres bhi banata hai.

1. [render.com](https://render.com) pe account banao (GitHub se login karo)
2. **New → Blueprint** → apna GitHub repo select karo
3. Render khud `render.yaml` padh kar:
   - ✅ Free PostgreSQL database banayega (`collab-tool-db`)
   - ✅ Backend web service banayega
   - ✅ `DATABASE_URL` auto-connect karega
4. Sirf **ek** env var manually set karo:
   - `CLIENT_URL` = abhi `http://localhost:5173` (baad mein update karein)
5. **Apply** karo → deploy ho jayega

Backend URL note karo, e.g. `https://collab-tool-backend.onrender.com`

Health check: `https://your-backend.onrender.com/api/health` → `{"status":"ok"}`

---

## Step 3: Frontend — Vercel (Free)

1. [vercel.com](https://vercel.com) pe account banao (GitHub se login karo)
2. **New Project** → same GitHub repo import karo
3. Settings:
   - **Root Directory:** `frontend`
   - Framework: Vite (auto-detect hoga)
4. Environment Variables add karo:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-backend.onrender.com`
5. **Deploy** karo

Vercel URL note karo, e.g. `https://collab-tool.vercel.app`

---

## Step 4: Dono Ko Connect Karo

Render service → **Environment** → `CLIENT_URL` update karo:
```
CLIENT_URL = https://collab-tool.vercel.app
```
**Manual Deploy** karo → done! ✅

---

## Step 5: Test Karo

- Frontend kholo, register karo, project banao
- Dusre browser/incognito mein dusra user login karo
- Task move karo → dono screens pe live update aana chahiye (WebSocket test)

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (alag terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000
