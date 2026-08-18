# NEW - Personal Habit & Goal Tracker

A powerful, offline-first desktop application built to help you build habits, set goals, track study sessions with a Pomodoro timer, save inspirational content, and manage your personal rules and bookmarks - all in one place.

![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?logo=mongodb&logoColor=white)

---

## Features

### Daily Habits
- Create, edit, and delete daily habits with custom icons and time slots
- Toggle completion for today with instant visual feedback
- Track habit history with a weekly star streak system
- View detailed history for any past day
- Celebration animation when all daily habits are completed

### Goals
- **Big Goals** - Set long-term goals with optional target dates and descriptions
- **10-Day Cycle Goals (OOG)** - Break big goals into 10-day cycles with prioritized tasks
- Automatically create and manage 10-day cycles with task tracking
- Mark cycles as complete, incomplete, or let them auto-expire

### Study Tracker with Pomodoro Timer
- Create study tasks with subjects and track progress
- Built-in Pomodoro timer with configurable focus and break durations
- Floating always-on-top timer window that stays above all applications
- Session history with daily and all-time statistics
- Desktop notifications when timer completes

### Dua & Azkar
- Save and organize personal duas and daily azkar
- Categorize into "Dua" and "Zikr" types
- Daily dua suggestion on the dashboard

### Life Rules
- Maintain a personal collection of life rules and principles
- Quick reference for daily motivation and guidance

### Links Library
- Save and organize bookmarks with titles, URLs, and descriptions
- Color-coded categories for visual organization
- Quick-access link management

### Dashboard
- Real-time overview of today's habits, active goals, and cycle progress
- Weekly star streak visualization
- Daily dua/azkar suggestion
- Quick stats at a glance

### Settings & Data Management
- Toggle floating timer on/off
- Export full database backup as JSON
- Import data from a backup file
- Reset all data (with confirmation dialog)
- Database connection status indicator

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|--------|
| Desktop Shell | Electron | 43.x |
| Frontend | Angular | 20.x |
| Backend API | Express.js (ESM) | 5.x |
| Database | MongoDB (local) | 9.x |
| Validation | Joi | 18.x |
| Styling | SCSS | - |
| Build | electron-builder | 26.x |

### Architecture

The application uses a **three-layer architecture**:

```
Electron (Desktop Shell)
  Main Window    -> Angular Frontend (port 5200 in dev / port 3456 in prod)
  Timer Window   -> Static HTML (always-on-top, self-contained)
  Backend Server -> Express API (port 3456)
                       -> MongoDB (localhost:27017)
```

- **In development**: Angular dev server runs on port 5200 with proxy to backend on port 3456
- **In production**: Express serves the built Angular files and the API from a single port (3456)

---

## Prerequisites

- **Node.js** 20+
- **MongoDB** running locally on `localhost:27017`
- **npm** (comes with Node.js)
- **Git** (for cloning)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/NEW.git
cd NEW
```

### 2. Install Dependencies

```bash
# Root (Electron)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Set Up Environment Variables

Create a file at `backend/src/.env`:

```env
PORT=3456
NODE_ENV=development
DB_URI=mongodb://localhost:27017/new
```

### 4. Make Sure MongoDB is Running

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

### 5. Start Development Servers

Open **three separate terminals**:

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Angular Frontend
cd frontend
npm start

# Terminal 3 - Electron (optional, for desktop shell)
npm run electron
```

The app opens at `http://localhost:5200` in development mode.

---

## Building for Production

### 1. Build the Frontend

```bash
cd frontend
npm run build
```

This outputs to `frontend/dist/frontend/browser/`.

### 2. Build the Electron App

```bash
# From the project root
npm run dist
```

This creates a Windows NSIS installer in the `release/` directory.

### Production Mode

In production:
- Express starts on port 3456 and serves both the API and the built Angular frontend
- Electron loads `http://localhost:3456` (no separate Angular dev server needed)
- The backend is bootstrapped inside the Electron main process (no spawn)

---

## Project Structure

```
NEW/
  package.json              # Root Electron config
  icon.ico                  # Application icon
  .gitignore                # Git ignore rules
  README.md                 # This file
  electron/
    main.js                 # Electron main process
    preload.js              # Main window preload (contextBridge)
    timer-preload.js        # Timer window preload (contextBridge)
    timer-window/
      timer.html            # Floating timer UI
  backend/
    package.json             # Backend dependencies
    src/
      index.js              # Entry point
      app.js                # Express app & routes
      config/               # Environment configuration
      db/                   # MongoDB connection & Mongoose models
      modules/              # API modules (CRUD for each feature)
      middleware/            # Error handling & validation
      utils/                # Response helpers, error classes
  frontend/
    package.json             # Frontend dependencies
    angular.json            # Angular CLI configuration
    proxy.conf.json         # Dev proxy to backend
    tsconfig.json           # TypeScript config
    src/
      app/
        features/          # Feature components (habits, goals, study...)
        services/           # Angular HTTP services
        core/               # Core services (toast, pomodoro state, title)
        layout/             # App layout (sidebar, header, base)
        shared/             # Shared components (loading, toast, dialogs...)
        models/             # TypeScript interfaces
        pipes/              # Custom pipes
        app.routes.ts       # Route definitions
      styles.scss           # Global styles
      main.ts               # Angular bootstrap
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Dashboard overview data |
| GET | `/api/dashboard/stats` | Data statistics |
| GET | `/api/dashboard/export` | Export all data as JSON |
| POST | `/api/dashboard/import` | Import data from JSON |
| POST | `/api/dashboard/reset` | Reset all data |
| GET/POST/PUT/DELETE | `/api/habits/*` | Habit CRUD & toggle |
| GET/POST/PUT/DELETE | `/api/goals/*` | OOG 10-day goals & tasks |
| GET/POST/PUT/DELETE | `/api/big-goals/*` | Big goals CRUD |
| GET/POST/PUT/DELETE | `/api/cycles/*` | 10-day cycles & tasks |
| GET/POST/PUT/DELETE | `/api/study/*` | Study tasks & Pomodoro sessions |
| GET/POST/PUT/DELETE | `/api/duas/*` | Dua & Azkar CRUD |
| GET/POST/PUT/DELETE | `/api/rules/*` | Life rules CRUD |
| GET/POST/PUT/DELETE | `/api/links/*` | Bookmarks CRUD |

---

## Data Models

| Model | Collection | Description |
|-------|-----------|-------------|
| Habit | `habits` | Daily habits with name, time, icon, order |
| HabitLog | `habitlogs` | Daily completion records per habit |
| Goal | `goals` | One-off goals with status tracking |
| BigGoal | `biggoals` | Long-term goals with target dates |
| TenDayCycle | `tendaycycles` | 10-day challenge cycles |
| TenDayTask | `tendaytasks` | Tasks within a cycle |
| StudyTask | `studytasks` | Study tasks with subject & Pomodoro count |
| PomodoroSession | `pomodorosessions` | Completed focus/break sessions |
| Dua | `duas` | Supplications and daily azkar |
| Rule | `rules` | Personal life rules |
| Link | `links` | Saved bookmarks with categories |

---

## Key Design Decisions

- **Offline-first**: All data is stored in a local MongoDB instance. No internet required.
- **No authentication**: Single-user desktop app, no login system.
- **Local timezone**: All dates use the system's local timezone (no UTC conversion).
- **Context isolation**: Electron preload scripts use `contextBridge` for secure IPC.
- **ESM modules**: Backend uses `"type": "module"` with `import`/`export` syntax throughout.
- **Single-instance**: Only one instance of the app can run at a time (enforced by Electron lock).
- **SPA fallback**: In production, all non-API routes serve `index.html` for client-side routing.

---

## License

This project is for personal use. All rights reserved.
