import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import db from './db.js';
import { getCollaborativeRecommendations, getGeminiAIRecommendations } from './recommendation.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cinematch_super_secret_secret';
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cinematch-api' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'CineMatch API is running.' });
});

// Helper to query TMDB API proxy securely
const fetchFromTMDB = async (endpoint, params = {}) => {
  const tmdbKey = process.env.TMDB_API_KEY || 'f7f4fea187e43720972be14e61291cd2';
  const isToken = tmdbKey.length > 40;
  const url = `https://api.themoviedb.org/3${endpoint}`;
  
  const headers = { 'Content-Type': 'application/json;charset=utf-8' };
  const queryParams = { ...params };
  
  if (isToken) {
    headers['Authorization'] = `Bearer ${tmdbKey}`;
  } else {
    queryParams.api_key = tmdbKey;
  }
  
  const response = await axios.get(url, { params: queryParams, headers });
  return response.data;
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// ================= AUTH ROUTES =================

// Register User
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  
  try {
    // Check if username or email already exists
    const [existingUsername] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert User
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, user: { id: userId, username, email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body; // username can be username or email
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required.' });
  }
  
  try {
    // Find User by username OR email
    const [users] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    
    const user = users[0];
    
    // Check Password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Logout User
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Get Current User profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// ================= SECURE PROXY MOVIE ROUTES =================

// Get Popular Movies
app.get('/api/movies/popular', async (req, res) => {
  try {
    const data = await fetchFromTMDB('/movie/popular');
    res.json(data.results || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular movies.' });
  }
});

// Get Trending Movies
app.get('/api/movies/trending', async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/movie/day');
    res.json(data.results || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending movies.' });
  }
});

// Get Top Rated Movies
app.get('/api/movies/top_rated', async (req, res) => {
  try {
    const data = await fetchFromTMDB('/movie/top_rated');
    res.json(data.results || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated movies.' });
  }
});

// Search and Discovery Movies
app.get('/api/movies/search', async (req, res) => {
  const { query, genreId, year, minRating } = req.query;
  
  try {
    if (query && query.trim()) {
      const data = await fetchFromTMDB('/search/movie', {
        query,
        primary_release_year: year || undefined
      });
      let results = data.results || [];
      
      if (genreId) {
        results = results.filter(m => m.genre_ids.includes(parseInt(genreId)));
      }
      if (minRating) {
        results = results.filter(m => m.vote_average >= parseFloat(minRating));
      }
      res.json(results);
    } else {
      const discoverParams = {
        sort_by: 'popularity.desc'
      };
      if (genreId) discoverParams.with_genres = genreId;
      if (year) discoverParams.primary_release_year = year;
      if (minRating) discoverParams['vote_average.gte'] = minRating;
      
      const data = await fetchFromTMDB('/discover/movie', discoverParams);
      res.json(data.results || []);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute movie search.' });
  }
});

// Get Movie Details with Cast and Videos
app.get('/api/movies/detail/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const details = await fetchFromTMDB(`/movie/${id}`);
    const credits = await fetchFromTMDB(`/movie/${id}/credits`);
    const videos = await fetchFromTMDB(`/movie/${id}/videos`);

    const cast = credits.cast.slice(0, 10).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path
    }));

    res.json({
      ...details,
      cast,
      videos: { results: videos.results || [] }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve details for movie.' });
  }
});

// Get Similar Movies
app.get('/api/movies/similar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fetchFromTMDB(`/movie/${id}/similar`);
    res.json((data.results || []).slice(0, 6));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch similar movies.' });
  }
});

// Get Genres List
app.get('/api/movies/genres', async (req, res) => {
  try {
    const data = await fetchFromTMDB('/genre/movie/list');
    res.json(data.genres || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres.' });
  }
});

// ================= USER WATCHLIST CONTROLLERS =================

// Get Watchlist
app.get('/api/profile/watchlist', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT movie_id AS id, title, poster_path, release_date, vote_average FROM watchlist WHERE user_id = ? ORDER BY added_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist.' });
  }
});

// Add to Watchlist
app.post('/api/profile/watchlist', authenticateToken, async (req, res) => {
  const { id, title, poster_path, release_date, vote_average } = req.body;
  
  if (!id || !title) {
    return res.status(400).json({ error: 'Movie ID and Title are required.' });
  }

  try {
    await db.query(
      `INSERT INTO watchlist (user_id, movie_id, title, poster_path, release_date, vote_average) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = title`,
      [req.user.id, id, title, poster_path, release_date, vote_average]
    );
    res.json({ success: true, message: 'Added to watchlist.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to watchlist.' });
  }
});

// Remove from Watchlist
app.delete('/api/profile/watchlist/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?', [req.user.id, id]);
    res.json({ success: true, message: 'Removed from watchlist.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from watchlist.' });
  }
});

// ================= USER RATINGS CONTROLLERS =================

// Get Ratings
app.get('/api/profile/ratings', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT movie_id, rating, title, poster_path, release_date, vote_average, timestamp 
       FROM ratings 
       WHERE user_id = ? 
       ORDER BY timestamp DESC`,
      [req.user.id]
    );
    
    // Map database columns to the frontend RatedMovie interface signature
    const formatted = rows.map(r => ({
      movie: {
        id: r.movie_id,
        title: r.title,
        poster_path: r.poster_path,
        release_date: r.release_date,
        vote_average: r.vote_average
      },
      rating: r.rating,
      timestamp: r.timestamp
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ratings.' });
  }
});

// Add/Update Rating
app.post('/api/profile/ratings', authenticateToken, async (req, res) => {
  const { movie, rating } = req.body;
  
  if (!movie || !movie.id || !movie.title || !rating) {
    return res.status(400).json({ error: 'Movie ID, Title, and Rating are required.' });
  }

  try {
    await db.query(
      `INSERT INTO ratings (user_id, movie_id, rating, title, poster_path, release_date, vote_average, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), timestamp = VALUES(timestamp)`,
      [
        req.user.id,
        movie.id,
        rating,
        movie.title,
        movie.poster_path,
        movie.release_date,
        movie.vote_average,
        Date.now()
      ]
    );
    res.json({ success: true, message: 'Rating saved.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save rating.' });
  }
});

// Delete Rating
app.delete('/api/profile/ratings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM ratings WHERE user_id = ? AND movie_id = ?', [req.user.id, id]);
    res.json({ success: true, message: 'Rating removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove rating.' });
  }
});

// Clear Profile Watch History
app.delete('/api/profile/reset', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM watchlist WHERE user_id = ?', [req.user.id]);
    await db.query('DELETE FROM ratings WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'User history cleared successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset profile.' });
  }
});

// ================= RECOMMENDATIONS ENDPOINTS =================

// Collaborative Filtering Recommendations
app.get('/api/profile/recommendations', authenticateToken, async (req, res) => {
  try {
    const recs = await getCollaborativeRecommendations(req.user.id);
    res.json(recs);
  } catch (error) {
    console.error('CF Recommendation error:', error);
    res.status(500).json({ error: 'Failed to compile recommendations.' });
  }
});

// Gemini AI Critic Recommendations
app.post('/api/profile/ai-recommendations', authenticateToken, async (req, res) => {
  const { ratedDetails, watchlistDetails } = req.body;
  
  try {
    const recs = await getGeminiAIRecommendations(ratedDetails, watchlistDetails);
    res.json(recs);
  } catch (error) {
    console.error('AI Recommendation error:', error);
    res.status(500).json({ error: error.message || 'AI recommendations failed.' });
  }
});

// Start Server
const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineMatch Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default app;
