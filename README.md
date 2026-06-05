# 🌸 AniVerse

**AniVerse** is a full-stack anime tracking platform that helps users discover, organize, and track anime in one place.

Built with React, FastAPI, PostgreSQL, AniList GraphQL, and OpenAI, AniVerse delivers personalized recommendations, detailed analytics, and a modern user experience for anime enthusiasts.

---

## Overview

AniVerse allows users to:

* Search anime using the AniList GraphQL API
* Build and manage personal watchlists
* Track progress and completion status
* View detailed statistics and viewing insights
* Receive AI-powered anime recommendations
* Discover trending and popular anime

---

## Screenshots

> Add screenshots here. This is the single biggest improvement you can make to the repository.

### Home Page

![Home Page](screenshots/home.png)

### Anime Details

![Anime Details](screenshots/details.png)

### Watchlist

![Watchlist](screenshots/watchlist.png)

### Statistics Dashboard

![Statistics](screenshots/stats.png)

---

## Features

### Anime Discovery

* Search thousands of anime through AniList
* Browse trending and popular titles
* View ratings, genres, and descriptions

### Watchlist Management

* Add anime to personal lists
* Track watching progress
* Organize titles by status:

  * Watching
  * Completed
  * Planning
  * On Hold
  * Dropped

### AI Recommendations

* Personalized anime recommendations
* Suggestions based on user preferences and watch history
* OpenAI-powered recommendation engine

### Analytics

* Viewing statistics
* Completion tracking
* Genre distribution insights
* Personalized viewing trends

### Authentication

* Secure JWT-based authentication
* Protected routes and user data

### Responsive Design

* Desktop and mobile support
* Modern, intuitive interface

---

## Tech Stack

### Frontend

* React
* Vite
* Zustand
* Axios
* React Router

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication

### APIs & Services

* AniList GraphQL API
* OpenAI API

### Deployment

* Vercel
* Railway
* PostgreSQL

---

## Architecture

```text
React Frontend
       │
       ▼
FastAPI Backend
       │
       ├── PostgreSQL
       ├── AniList GraphQL API
       └── OpenAI API
```

---

## Getting Started

### Prerequisites

* Node.js 18+
* Python 3.11+
* PostgreSQL 15+

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## Environment Variables

### Backend

```env
DATABASE_URL=
SECRET_KEY=
OPENAI_API_KEY=
```

### Frontend

```env
VITE_API_URL=
```

---

## Future Improvements

* Social features and user profiles
* Anime reviews and ratings
* Collaborative watchlists
* Seasonal anime calendar
* Enhanced recommendation engine
* Real-time notifications

---

## Author

Built by Husnain Shakil 
email: husnainshkl@gmail.com
