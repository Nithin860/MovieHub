# CineMatch - Movie Recommendation System

CineMatch is a premium movie recommendation web application built with React, TypeScript, Vite, Node.js, Express, and MySQL. It supports authentication, personalized watchlists, ratings, collaborative recommendations, and AI-assisted movie suggestions.

## Local Development

### 1. Database setup
Ensure MySQL is installed and running locally.

```bash
mysql -u root -p < server/schema.sql
```

This creates the database `cinematch` and seeds a guest account:
- Username/Email: `guest`
- Password: `password123`

### 2. Environment configuration
Create a root `.env` file and a server `.env` file from the examples:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Example values:

```env
# Root frontend env
VITE_API_URL=http://localhost:5000
VITE_BASE_PATH=/
TMDB_API_KEY=your_tmdb_api_key_here
```

```env
# Server env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=cinematch
DB_PORT=3306
JWT_SECRET=change_me
TMDB_API_KEY=your_tmdb_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Run the app locally

Open two terminals:

```bash
npm run dev:backend
```

```bash
npm run dev
```

Then open http://localhost:5173.

## Production deployment

### Recommended host: Render
1. Create a Render Web Service for the backend using the contents of the `server` folder.
2. Set the environment variables:
   - `PORT=5000`
   - `DB_HOST=...`
   - `DB_USER=...`
   - `DB_PASSWORD=...`
   - `DB_NAME=cinematch`
   - `DB_PORT=3306`
   - `JWT_SECRET=...`
   - `TMDB_API_KEY=...`
   - `GEMINI_API_KEY=...`
   - `FRONTEND_URL=https://your-frontend-domain` 
3. Deploy the service and note the public HTTPS URL.
4. Deploy the frontend to Vercel or Netlify and set the root env var:
   - `VITE_API_URL=https://your-backend-url`
   - `VITE_BASE_PATH=/`

### Alternative: Vercel
The included Vercel config routes `/api/*` to the Express server entrypoint. Configure the same environment variables in the Vercel project settings.

## Feature checklist
- User signup and login
- JWT-based authenticated sessions
- Watchlist management
- Ratings and profile history
- Collaborative recommendations
- AI recommendations powered by TMDB and Gemini

