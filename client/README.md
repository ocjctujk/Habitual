# Habit Tracker Frontend

A modern, responsive frontend for the Habit Tracker application built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Login and Registration pages
- 📊 **Dashboard** - View habit stats, active streaks, and habit list
- ✨ **Interactive** - Create new habits, track daily progress
- 📱 **Responsive** - Works on desktop and mobile
- 🎨 **Modern UI** - Styled with Tailwind CSS

## Tech Stack

- **Build Tool:** Vite
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios

## Getting Started

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment**

Ensure `.env` exists with the correct backend URL:

```env
VITE_API_URL=http://localhost:5000/api
```

3. **Run Development Server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/          # Global state (Auth)
├── pages/            # Page components
├── services/         # API calls
├── types/            # TypeScript interfaces
├── App.tsx           # Routing
└── index.css         # Global styles
```
