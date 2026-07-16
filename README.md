# CineMatch - Movie Recommendation System

CineMatch is a premium Movie Recommendation web application built using React, TypeScript, Vite, Node.js, Express, and MySQL. It features an advanced client-side filtering system, personalized user profiles (watchlists, ratings), collaborative recommendations, and Gemini AI movie critics.

## Setup Instructions

### 1. Database Setup
Ensure you have MySQL installed and running.
1. Run the database initialization schema to create the database and seed the default guest account:
   ```bash
   mysql -u root -p < server/schema.sql
   ```
2. This creates the database `cinematch` and seeds a default guest account:
   - **Username/Email**: `guest` or `guest@cinematch.com`
   - **Password**: `password123`

### 2. Environment Configuration
Create a `.env` file in the `server/` directory (you can copy `server/.env.example` as a template):
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cinematch
DB_PORT=3306
JWT_SECRET=your_jwt_signing_secret_here

# API Keys (Fallback config)
TMDB_API_KEY=YOUR_TMDB_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 3. Running the App Locally

To test the application locally, you must run both the frontend Vite server and the backend Express server.

1. **Start the Backend Server**:
   Open a terminal window and run:
   ```bash
   npm run dev:backend
   ```
2. **Start the Frontend Client**:
   Open a second terminal window and run:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## Production Deployment (Vercel)

The repository contains a `vercel.json` file configuring the Express server as a serverless function and serving the Vite static build from the root.

To deploy live on Vercel:
1. Push your repository to GitHub.
2. In your Vercel Dashboard, import the repository.
3. Configure the following **Environment Variables** in Settings:
   - `DB_HOST` = `<your_public_database_host>`
   - `DB_USER` = `<your_public_database_user>`
   - `DB_PASSWORD` = `<your_public_database_password>`
   - `DB_NAME` = `cinematch`
   - `DB_PORT` = `3306`
   - `JWT_SECRET` = `<your_jwt_secret>`
4. Trigger the deployment. Vercel will build the frontend and serve `/api/*` endpoints via the serverless function.
