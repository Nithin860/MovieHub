// 1. Fixed: Added 'type' keyword for type-only imports to satisfy verbatimModuleSyntax
import type { Movie, Recommendation, UserProfile } from '../types';
// 2. Fixed: Removed unused 'getMovieDetails' import
import { searchMovies } from './tmdb';

const LOCAL_STORAGE_KEY = 'movie_app_gemini_key';

export const getGeminiKey = (): string => {
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || localStorage.getItem(LOCAL_STORAGE_KEY) || '';
};

export const setGeminiKey = (key: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, key);
};

export const removeGeminiKey = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

// Generates client-side recommendations when Gemini is not configured
export const getClientRecommendations = (
  userProfile: UserProfile,
  allMovies: Movie[],
  genresList: { id: number; name: string }[]
): Recommendation[] => {
  const { watchlist, ratings } = userProfile;
  const ratedMovieIds = Object.keys(ratings).map(Number);
  const excludes = new Set([...watchlist, ...ratedMovieIds]);

  // If user has no watch history or ratings, recommend highly-rated popular movies
  if (excludes.size === 0) {
    return allMovies
      .slice(0, 5)
      .map((movie, idx) => ({
        movie,
        score: 95 - idx * 3,
        reason: 'Trending movie recommended for new users.',
        source: 'client'
      }));
  }

  // Calculate genre preferences
  const genrePoints: Record<number, number> = {};

  // Weights based on ratings
  Object.entries(ratings).forEach(([idStr, score]) => {
    const id = Number(idStr);
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;

    // Weight: 5 stars = +3, 4 stars = +2, 3 stars = +1, 2 stars = -1, 1 star = -3
    const weight = score >= 4 ? score - 2 : score - 4;

    movie.genre_ids.forEach(gid => {
      genrePoints[gid] = (genrePoints[gid] || 0) + weight;
    });
  });

  // Include watchlist items (weight = +2)
  watchlist.forEach(id => {
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;
    movie.genre_ids.forEach(gid => {
      genrePoints[gid] = (genrePoints[gid] || 0) + 2;
    });
  });

  // Calculate scores for unwatched movies
  const recommendations: Recommendation[] = [];

  allMovies.forEach(movie => {
    if (excludes.has(movie.id)) return;

    let matchScore = 50; // Base score
    let matchedGenres: string[] = [];

    movie.genre_ids.forEach(gid => {
      const pts = genrePoints[gid] || 0;
      matchScore += pts * 5;

      const genreObj = genresList.find(g => g.id === gid);
      if (genreObj && pts > 0) {
        matchedGenres.push(genreObj.name);
      }
    });

    // Add weight for TMDB vote average
    matchScore += (movie.vote_average - 5) * 4;

    // Clamp score between 10 and 99
    const finalScore = Math.max(10, Math.min(99, Math.round(matchScore)));

    if (finalScore >= 60) {
      const reason = matchedGenres.length > 0
        ? `Matches your affinity for ${matchedGenres.slice(0, 2).join(' & ')}.`
        : `Recommended based on its high popularity and rating.`;

      recommendations.push({
        movie,
        score: finalScore,
        reason,
        source: 'client'
      });
    }
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 6);
};

// Calls the official Gemini API to get personalized suggestions
export const getGeminiRecommendations = async (
  // 3. Fixed: Prefixed with an underscore to tell TS this parameter is intentionally unused here
  _userProfile: UserProfile,
  movieHistoryDetails: { title: string; rating: number; year: string }[],
  watchlistDetails: string[]
): Promise<Recommendation[]> => {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  // Build profile context for prompt
  const likesStr = movieHistoryDetails
    .filter(m => m.rating >= 4)
    .map(m => `"${m.title}" (${m.year}, rated ${m.rating}/5 stars)`)
    .join(', ');

  const dislikesStr = movieHistoryDetails
    .filter(m => m.rating <= 2)
    .map(m => `"${m.title}" (${m.year}, rated ${m.rating}/5 stars)`)
    .join(', ');

  const watchlistStr = watchlistDetails.map(t => `"${t}"`).join(', ');

  const prompt = `You are a film critic AI. Recommend exactly 5 movies based on this user's profile:
- Liked Movies: [${likesStr || 'None'}]
- Disliked Movies: [${dislikesStr || 'None'}]
- Watchlist: [${watchlistStr || 'None'}]

Guidelines:
1. Do not recommend any of the movies already listed in the user's liked list or watchlist.
2. Provide movies that range from hidden gems to classics, matching the user's preference style.
3. For each recommendation, provide the title, approximate release year, and a customized 1-2 sentence rationale explaining why the user will enjoy it based on their profile. Do not mention specific actors or directors unless relevant to their profile.
4. Output the results strictly in JSON format matching the schema provided.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
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
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API failed: ${response.statusText}`);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('Gemini API returned an empty response.');
  }

  const parsed = JSON.parse(textContent);
  const rawRecs: Array<{ title: string; year: string; reason: string }> = parsed.recommendations || [];

  const matchedRecommendations: Recommendation[] = [];

  // Match each AI recommendation to TMDB movie objects
  for (const item of rawRecs) {
    try {
      const searchResults = await searchMovies(item.title, undefined, item.year);
      if (searchResults && searchResults.length > 0) {
        // Take the closest match
        const bestMatch = searchResults[0];

        // Calculate similarity score based on ratings context (mock 85-98)
        const randomScore = Math.floor(Math.random() * 14) + 85;

        matchedRecommendations.push({
          movie: bestMatch,
          score: randomScore,
          reason: item.reason,
          source: 'gemini'
        });
      }
    } catch (err) {
      console.warn(`Failed to match Gemini recommendation "${item.title}" to TMDB`, err);
    }
  }

  return matchedRecommendations;
};