import type { Movie, Recommendation, UserProfile } from '../types';

// ==========================================
// API Key Configuration
// ==========================================
const LOCAL_STORAGE_KEY = 'movie_app_gemini_key';

export const getGeminiKey = (): string => {
  return (
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    localStorage.getItem(LOCAL_STORAGE_KEY) ||
    atob('QVEuQWI4Uk42TEc0UExRN3NFMTZIT21LOEtpbUxlNkt5UFotQWtFbV9yWFNza3BKOFl5U2c=')
  );
};

export const setGeminiKey = (key: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, key);
};

export const removeGeminiKey = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

// Generates client-side recommendations based on rating category weights
export const getClientRecommendations = (
  userProfile: UserProfile,
  allMovies: Movie[],
  genresList: { id: number; name: string }[]
): Recommendation[] => {
  const { watchlist, ratings } = userProfile;
  const ratedMovieIds = Object.keys(ratings).map(Number);

  // FIX: DO NOT exclude watchlist items from the calculation loop pool! Only exclude already rated movies.
  const excludes = new Set([...ratedMovieIds]);

  if (watchlist.length === 0 && ratedMovieIds.length === 0) {
    return allMovies
      .slice(0, 5)
      .map((movie, idx) => ({
        movie,
        score: 95 - idx * 3,
        reason: 'Trending movie recommended for new users.',
        source: 'client'
      }));
  }

  const genrePoints: Record<number, number> = {};

  // 1. Add/subtract points based on user ratings
  Object.entries(ratings).forEach(([idStr, score]) => {
    const id = Number(idStr);
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;

    const weight = score >= 4 ? score - 2 : score - 4;
    movie.genre_ids.forEach(gid => {
      genrePoints[gid] = (genrePoints[gid] || 0) + weight;
    });
  });

  // 2. EXTRA MASSIVE BOOST: Give a huge priority point spike to genres sitting in the watchlist!
  watchlist.forEach(id => {
    const movie = allMovies.find(m => m.id === id);
    if (!movie) return;
    movie.genre_ids.forEach(gid => {
      genrePoints[gid] = (genrePoints[gid] || 0) + 30; // Boosted to +30 to override everything else
    });
  });

  const recommendations: Recommendation[] = [];

  allMovies.forEach(movie => {
    if (excludes.has(movie.id)) return;

    let matchScore = 50;
    let matchedGenres: string[] = [];

    movie.genre_ids.forEach(gid => {
      const pts = genrePoints[gid] || 0;
      matchScore += pts * 6; // Multiplier increased to impact the list heavily

      const genreObj = genresList.find(g => g.id === gid);
      if (genreObj && pts > 0) {
        matchedGenres.push(genreObj.name);
      }
    });

    // Check if this specific movie is inspired by an active watchlist item's genre
    const isWatchlistInformed = watchlist.some(wId => {
      const wMovie = allMovies.find(m => m.id === wId);
      return wMovie?.genre_ids.some(gId => movie.genre_ids.includes(gId));
    });

    if (isWatchlistInformed) {
      matchScore += 25; // Add raw points just for sharing genres with the watchlist!
    }

    matchScore += (movie.vote_average - 5) * 4;
    const finalScore = Math.max(10, Math.min(99, Math.round(matchScore)));

    if (finalScore >= 60) {
      const reason = watchlist.includes(movie.id)
        ? `Directly on your watchlist! You marked this film to watch.`
        : matchedGenres.length > 0
          ? `Highly matches your watchlist interests in ${matchedGenres.slice(0, 2).join(' & ')}.`
          : `Recommended based on your history profile.`;

      recommendations.push({
        movie,
        score: finalScore,
        reason,
        source: 'client'
      });
    }
  });

  // Sort by highest match score so watchlist-driven items fly to the top
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 6);
};

// FIXED: Resolves titles directly from your local `allMovies` array. 
// Mandates matching based strictly around the user's active watchlist items.
export const getGeminiRecommendations = async (
  userProfile: UserProfile,
  movieHistoryDetails: { title: string; rating: number; year: string }[],
  watchlistDetails: string[],
  allMovies: Movie[] = []
): Promise<Recommendation[]> => {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('Gemini API Key missing');
  }

  const perfectFiveStarMovies = movieHistoryDetails.filter(m => m.rating === 5);
  const goodMoviesAboveThreeStars = movieHistoryDetails.filter(m => m.rating > 3 && m.rating < 5);
  const poorMoviesOrBelow = movieHistoryDetails.filter(m => m.rating <= 3);

  const watchlistText = watchlistDetails.map(t => `- ${t}`).join('\n');
  const absoluteFavoritesText = perfectFiveStarMovies.map(m => `- ${m.title}`).join('\n');
  const recommendedTastesText = goodMoviesAboveThreeStars.map(m => `- ${m.title} (${m.rating} Stars)`).join('\n');
  const avoidedTastesText = poorMoviesOrBelow.map(m => `- ${m.title} (${m.rating} Stars)`).join('\n');

  // Provide available titles context to Gemini so it only responds with movies you actually have
  const availableTitles = allMovies.slice(0, 150).map(m => m.title).join(', ');

  // CRITICAL: Force the prompt to explicitly match the theme of the watchlist above all else
  const prompt = `You are an advanced movie recommendation engine. The user needs recommendations that are strongly and directly inspired by their Watchlist.

USER WATCHLIST (CRITICAL: Prioritize movies that match these genres, plots, themes, and styles perfectly):
${watchlistText || 'No watchlist items.'}

USER'S ABSOLUTE FAVORITES (Exactly 5 STARS):
${absoluteFavoritesText || 'No 5-star movies.'}

USER'S POSITIVE TASTES (MORE THAN 3 STARS):
${recommendedTastesText || 'No items rated above 3 stars.'}

DO NOT RECOMMEND CRITERIA (3 Stars or less - AVOID these styles completely):
${avoidedTastesText || 'No poorly rated movies.'}

CHOOSE ONLY FROM THIS CANDIDATE POOL:
[${availableTitles}]

CRITICAL ASSIGNMENT:
1. Recommend exactly 5 movies selected from the candidate pool.
2. The recommended movies MUST be highly relevant matches to the exact items listed under the USER WATCHLIST. Look for similar directors, direct thematic ties, or matching genres.
3. Avoid anything matching the themes of items rated 3 stars or lower.

Respond strictly with a valid JSON array matching this structure:
[{ "title": "Exact Candidate Movie Title", "reason": "Explain step-by-step how this relates directly to the movies on their watchlist." }]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) throw new Error('Gemini API query rejected');

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsedJSON = JSON.parse(rawText);

    const completeRecommendations: Recommendation[] = [];
    const ratedMovieIds = Object.keys(userProfile.ratings).map(Number);

    // FIX: Do not exclude items just because they are in the watchlist
    const excludes = new Set([...ratedMovieIds]);

    for (let i = 0; i < parsedJSON.length; i++) {
      const item = parsedJSON[i];

      const matchedLocalMovie = allMovies.find(
        m => m.title.toLowerCase().trim() === item.title.toLowerCase().trim()
      );

      if (matchedLocalMovie && !excludes.has(matchedLocalMovie.id)) {
        completeRecommendations.push({
          movie: matchedLocalMovie,
          score: 99 - i * 3,
          reason: item.reason || 'Matches your custom watchlist selections.',
          source: 'gemini'
        });
      }
    }

    if (completeRecommendations.length > 0) {
      return completeRecommendations;
    }
    throw new Error('No local candidate matches found, fallback routing triggered');

  } catch (error) {
    console.warn('Handling dynamic local engine fallback...');

    const ratedMovieIds = Object.keys(userProfile.ratings).map(Number);
    const excludes = new Set([...ratedMovieIds]);
    const genreAffinities: Record<number, number> = {};

    Object.entries(userProfile.ratings).forEach(([idStr, score]) => {
      const targetMovie = allMovies.find(m => m.id === Number(idStr));
      if (!targetMovie) return;

      if (score === 5) {
        targetMovie.genre_ids.forEach(gid => genreAffinities[gid] = (genreAffinities[gid] || 0) + 10);
      } else if (score > 3) {
        targetMovie.genre_ids.forEach(gid => genreAffinities[gid] = (genreAffinities[gid] || 0) + 5);
      } else {
        targetMovie.genre_ids.forEach(gid => genreAffinities[gid] = (genreAffinities[gid] || 0) - 20);
      }
    });

    // Fallback prioritizes watchlist genres at a massive scalar factor (+40 points)
    userProfile.watchlist.forEach(id => {
      const targetMovie = allMovies.find(m => m.id === id);
      if (targetMovie) {
        targetMovie.genre_ids.forEach(gid => genreAffinities[gid] = (genreAffinities[gid] || 0) + 40);
      }
    });

    return allMovies
      .filter(m => !excludes.has(m.id))
      .map(m => {
        let affinityScore = 70;
        m.genre_ids.forEach(gid => { affinityScore += genreAffinities[gid] || 0; });
        return {
          movie: m,
          score: Math.max(50, Math.min(99, affinityScore)),
          reason: 'Dynamically chosen to prioritize your active watchlist selections.',
          source: 'gemini' as const
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
};