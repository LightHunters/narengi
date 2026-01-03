# CafiSearch (Tehran Edition)

A production-ready Node.js web app optimized for searching cafés in Tehran using MapLibre GL JS and OpenStreetMap data. Features a cinematic search experience with fly-to animations and Persian language support.

## Features

*   **Cinematic Search:** Smooth camera transitions ("fly" effect) and marker highlight animations.
*   **Tehran Optimized:** 
    *   **Map:** MapLibre GL JS with high-performance CartoDB Voyager tiles.
    *   **Search:** Persian-first search using OpenStreetMap (Nominatim).
    *   **UI:** RTL support with Vazirmatn font.
*   **Search:** Debounced text input, type-ahead suggestions, and keyboard navigation.
*   **Responsive UI:** Works on desktop and mobile.
*   **Backend Proxy:** Securely proxies search requests to Nominatim or uses offline seed data.
*   **Offline Mode:** Comes with a seed database of 20 cafés in Tehran.

## Tech Stack

*   **Frontend:** React, MapLibre GL JS (CDN), Axios, Lodash (debounce).
*   **Backend:** Node.js, Express, MongoDB, Mongoose.

## Prerequisites

*   Node.js (v14+)
*   MongoDB (running locally or a connection string)

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd cafisearch
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configuration (.env):**
Create a `.env` file in the `backend` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/cafisearch
USE_OSM=true
# USE_GOOGLE_PLACES=false (Optional legacy)
```

*   `USE_OSM=true`: Uses OpenStreetMap (Nominatim) for search (Recommended for Tehran).
*   `USE_OSM=false`: Uses local MongoDB seed data.

**Seed Data (Optional):**
If you want to use the local database:

```bash
npm run seed
```

**Start Server:**

```bash
npm start
```
The backend runs on `http://localhost:5001`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Configuration:**
No API keys required! The map uses free OpenStreetMap tiles.

**Start Client:**

```bash
npm run dev
```
The frontend runs on `http://localhost:5173`.

## Usage

1.  Open `http://localhost:5173`.
2.  Type "Cafe" or "کافه" in the search box.
3.  Select a result to see the cinematic transition!
