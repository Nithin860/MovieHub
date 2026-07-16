export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieDetail extends Movie {
  tagline: string | null;
  runtime: number | null;
  genres: Genre[];
  budget: number;
  revenue: number;
  cast?: CastMember[];
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
    }>;
  };
}

export interface UserRating {
  movieId: number;
  rating: number; // 1 to 5 stars
  timestamp: number;
}

export interface UserProfile {
  watchlist: number[]; // Array of movie IDs
  ratings: Record<number, number>; // movieId -> rating (1-5)
  preferredGenres: number[]; // list of preferred genre IDs
  tmdbApiKey: string;
  geminiApiKey: string;
}

export interface Recommendation {
  movie: Movie;
  score: number; // 0-100 rating strength
  reason: string; // e.g. "Matching your interest in Sci-Fi" or Gemini explanation
  source: 'client' | 'gemini';
}
