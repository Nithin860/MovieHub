import db from './db.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Calculates user-based collaborative filtering recommendations
 * @param {number} userId - The active user's ID
 * @returns {Promise<Array>} - Recommended movie IDs with score and reason
 */
export const getCollaborativeRecommendations = async (userId) => {
  // 1. Get current user's ratings
  const [currentUserRatings] = await db.query(
    'SELECT movie_id, rating FROM ratings WHERE user_id = ?',
    [userId]
  );

  if (currentUserRatings.length === 0) {
    return []; // Cold start, no local ratings to compare
  }

  const currentUserMap = new Map(currentUserRatings.map(r => [r.movie_id, r.rating]));

  // 2. Fetch all other users' ratings for users who have rated at least one of the same movies
  const movieIds = Array.from(currentUserMap.keys());
  const [otherRatings] = await db.query(
    'SELECT user_id, movie_id, rating, title, poster_path, release_date, vote_average FROM ratings WHERE movie_id IN (?) AND user_id != ?',
    [movieIds, userId]
  );

  if (otherRatings.length === 0) {
    return []; // No overlap with any other user
  }

  // Group ratings by other user_id
  const otherUsersMap = {};
  otherRatings.forEach(r => {
    if (!otherUsersMap[r.user_id]) {
      otherUsersMap[r.user_id] = [];
    }
    otherUsersMap[r.user_id].push(r);
  });

  const similarities = [];

  // 3. Compute similarity (mean absolute difference similarity) for each overlapping user
  for (const [otherUserId, ratings] of Object.entries(otherUsersMap)) {
    let absoluteDiffSum = 0;
    let overlapCount = 0;

    ratings.forEach(r => {
      const currentRating = currentUserMap.get(r.movie_id);
      if (currentRating !== undefined) {
        absoluteDiffSum += Math.abs(currentRating - r.rating);
        overlapCount++;
      }
    });

    if (overlapCount > 0) {
      // Average difference: range is 0 (identical) to 4 (maximum difference)
      const avgDiff = absoluteDiffSum / overlapCount;
      // Convert difference to a similarity score between 0 and 100
      const similarity = Math.round((1 - avgDiff / 4) * 100);
      
      similarities.push({
        user_id: parseInt(otherUserId),
        similarity,
        overlapCount
      });
    }
  }

  // Sort by similarity descending, taking those with at least 1 overlap
  similarities.sort((a, b) => b.similarity - a.similarity);
  const topSimilarUsers = similarities.slice(0, 5); // top 5 neighbors

  if (topSimilarUsers.length === 0) {
    return [];
  }

  const neighborIds = topSimilarUsers.map(u => u.user_id);

  // 4. Fetch movies highly rated (4-5 stars) by these top neighbors, which the current user hasn't seen
  const [candidateMovies] = await db.query(
    `SELECT r.movie_id, r.rating, r.title, r.poster_path, r.release_date, r.vote_average, r.user_id
     FROM ratings r
     WHERE r.user_id IN (?) 
       AND r.rating >= 4
       AND r.movie_id NOT IN (
         SELECT movie_id FROM ratings WHERE user_id = ?
         UNION
         SELECT movie_id FROM watchlist WHERE user_id = ?
       )`,
    [neighborIds, userId, userId]
  );

  if (candidateMovies.length === 0) {
    return [];
  }

  // 5. Aggregate candidate scores weighted by neighbor similarity
  const recommendationsMap = {};
  const similarityWeightMap = {};

  candidateMovies.forEach(item => {
    const similarity = topSimilarUsers.find(u => u.user_id === item.user_id)?.similarity || 0;
    
    if (!recommendationsMap[item.movie_id]) {
      recommendationsMap[item.movie_id] = {
        movie: {
          id: item.movie_id,
          title: item.title,
          poster_path: item.poster_path,
          release_date: item.release_date,
          vote_average: item.vote_average,
          overview: '', // loaded later or optional
          genre_ids: [],
          popularity: 50.0
        },
        weightedSum: 0,
        similaritySum: 0,
        recommendingUsers: []
      };
    }

    recommendationsMap[item.movie_id].weightedSum += item.rating * similarity;
    recommendationsMap[item.movie_id].similaritySum += similarity;
    recommendationsMap[item.movie_id].recommendingUsers.push(item.user_id);
  });

  const finalRecs = Object.values(recommendationsMap)
    .map(item => {
      const avgRating = item.weightedSum / item.similaritySum;
      // Calculate a recommendation percentage score between 60 and 98
      const score = Math.min(99, Math.max(60, Math.round((avgRating / 5) * 100)));
      return {
        movie: item.movie,
        score,
        reason: `Highly rated by users with similar cinematic taste.`,
        source: 'client'
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return finalRecs;
};

/**
 * Calls Gemini API to get personalized suggestions
 */
export const getGeminiAIRecommendations = async (ratedDetails, watchlistDetails) => {
  const apiKey = process.env.TMDB_API_KEY; // TMDB key
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error('Gemini API key is not configured on the server.');
  }

  const likesStr = ratedDetails
    .filter(m => m.rating >= 4)
    .map(m => `"${m.title}" (${m.year}, rated ${m.rating}/5 stars)`)
    .join(', ');

  const dislikesStr = ratedDetails
    .filter(m => m.rating <= 2)
    .map(m => `"${m.title}" (${m.year}, rated ${m.rating}/5 stars)`)
    .join(', ');

  const watchlistStr = watchlistDetails.join(', ');

  const prompt = `You are a film critic AI. Recommend exactly 5 movies based on this user's profile:
- Liked Movies: [${likesStr || 'None'}]
- Disliked Movies: [${dislikesStr || 'None'}]
- Watchlist: [${watchlistStr || 'None'}]

Guidelines:
1. Do not recommend any of the movies already listed in the user's liked list or watchlist.
2. Provide movies that range from hidden gems to classics, matching the user's preference style.
3. For each recommendation, provide the title, approximate release year, and a customized 1-2 sentence rationale explaining why the user will enjoy it based on their profile. Do not mention specific actors or directors unless relevant to their profile.
4. Output the results strictly in JSON format matching the schema:
{
  "recommendations": [
    { "title": "Movie Title", "year": "2010", "reason": "Rationale paragraph" }
  ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;

  const response = await axios.post(
    url,
    {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            recommendations: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  year: { type: 'STRING' },
                  reason: { type: 'STRING' }
                },
                required: ['title', 'year', 'reason']
              }
            }
          },
          required: ['recommendations']
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey
      }
    }
  );

  const textContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini API returned an empty response.');
  }

  const parsed = JSON.parse(textContent);
  const rawRecs = parsed.recommendations || [];

  const matchedRecommendations = [];

  // Query TMDB to get metadata for each suggestion
  const tmdbKey = process.env.TMDB_API_KEY;
  if (!tmdbKey) {
    throw new Error('TMDB Key missing on server.');
  }

  for (const item of rawRecs) {
    try {
      const isToken = tmdbKey.length > 40;
      const searchUrl = `https://api.themoviedb.org/3/search/movie`;
      const searchParams = {
        query: item.title,
        primary_release_year: item.year
      };

      const headers = { 'Content-Type': 'application/json;charset=utf-8' };
      if (isToken) {
        headers['Authorization'] = `Bearer ${tmdbKey}`;
      } else {
        searchParams.api_key = tmdbKey;
      }

      const tmdbRes = await axios.get(searchUrl, { params: searchParams, headers });
      const results = tmdbRes.data?.results || [];

      if (results.length > 0) {
        const bestMatch = results[0];
        matchedRecommendations.push({
          movie: {
            id: bestMatch.id,
            title: bestMatch.title,
            overview: bestMatch.overview,
            poster_path: bestMatch.poster_path,
            backdrop_path: bestMatch.backdrop_path,
            release_date: bestMatch.release_date,
            vote_average: bestMatch.vote_average,
            vote_count: bestMatch.vote_count,
            genre_ids: bestMatch.genre_ids,
            popularity: bestMatch.popularity
          },
          score: Math.floor(Math.random() * 14) + 85,
          reason: item.reason,
          source: 'gemini'
        });
      }
    } catch (err) {
      console.warn(`Failed to resolve AI suggestion "${item.title}" to TMDB`, err.message);
    }
  }

  return matchedRecommendations;
};
