import type { Movie, MovieDetail, Genre, CastMember } from '../types';

export const MOCK_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

export const MOCK_MOVIES: Movie[] = [
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the sub-conscious of his targets, is offered a chance to regain his old life as a payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    poster_path: '/oYuLEt3zVCKq57G2ypVDnpaG693.jpg',
    backdrop_path: '/8Z9W78m55G7e2l928gNsR2cl7gO.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 34500,
    genre_ids: [28, 878, 12, 53],
    popularity: 98.4
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QOcj2GkrgVbRPjSko44zrtN.jpg',
    backdrop_path: '/rAiw1Z5M23Z5Lz6P143W2mHgE0B.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 32000,
    genre_ids: [12, 18, 878],
    popularity: 112.5
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    poster_path: '/qJ2tWBS2Mm2Sj6l5hxm4zIY1Gj5.jpg',
    backdrop_path: '/nMKP8Q51snwYZO90Y6wzTYm97iO.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 30800,
    genre_ids: [28, 80, 18, 53],
    popularity: 88.2
  },
  {
    id: 502356,
    title: 'The Super Mario Bros. Movie',
    overview: 'While working underground to fix a water main, Brooklyn plumbers—and brothers—Mario and Luigi are transported down a mysterious pipe and wander into a spin-tastic new world. But when the brothers are separated, Mario embarks on an epic quest to find Luigi.',
    poster_path: '/qNBA25Xo5qhVg6nsihq6ziqb35i.jpg',
    backdrop_path: '/9n2GoFhxkc5guJ0Hn5p3t8jBOnt.jpg',
    release_date: '2023-04-05',
    vote_average: 7.8,
    vote_count: 8500,
    genre_ids: [16, 12, 10751, 14, 35],
    popularity: 75.9
  },
  {
    id: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    overview: 'Struggling to find his place in the world while juggling school and friends, Brooklyn teenager Miles Morales is unexpectedly bitten by a radioactive spider and develops superpowers. When the infamous Kingpin constructs a portal to other dimensions, multiple Spider-heroes from different timelines are pulled into Miles\' universe, forcing them to team up and save reality itself.',
    poster_path: '/iiZZN643Y6DpqxxJOh4nR8kr3NE.jpg',
    backdrop_path: '/7d62al03D4obgEbmFC2J22Hfk0C.jpg',
    release_date: '2018-12-06',
    vote_average: 8.4,
    vote_count: 14200,
    genre_ids: [28, 12, 16, 878],
    popularity: 85.1
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    poster_path: '/f89U3wLpqHYJXZK7j217ZtE62tq.jpg',
    backdrop_path: '/l5w5cx5bV9oY5pA8G1H28Zco8o4.jpg',
    release_date: '1999-03-30',
    vote_average: 8.2,
    vote_count: 24000,
    genre_ids: [28, 878],
    popularity: 64.7
  },
  {
    id: 13,
    title: 'Forrest Gump',
    overview: 'A man with a low IQ has accomplished great things in his life and been present during significant historical events—in each case, far exceeding what anyone imagined he could do. Yet, despite all the remarkable things he\'s achieved, his one true love eludes him.',
    poster_path: '/arw27qpW315qJeC6f2IY2K6G06F.jpg',
    backdrop_path: '/qdMMN639cCE4HegmQo56q2768QY.jpg',
    release_date: '1994-06-23',
    vote_average: 8.5,
    vote_count: 25500,
    genre_ids: [35, 18, 10749],
    popularity: 58.3
  },
  {
    id: 19995,
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following his orders and protecting the world he feels is his home.',
    poster_path: '/kyeqWzo2vQUgVA2pacy21Z4U6tx.jpg',
    backdrop_path: '/vL56k14n4H1ZpTo1n5g4b0g61gO.jpg',
    release_date: '2009-12-10',
    vote_average: 7.6,
    vote_count: 29800,
    genre_ids: [28, 12, 14, 878],
    popularity: 79.6
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    poster_path: '/7IiTT05EX2PmcIawa6jU6Q9uUu8.jpg',
    backdrop_path: '/fn4n6fgk4xQLQ9vU6v6uiXeSgGb.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 16500,
    genre_ids: [35, 18, 53],
    popularity: 72.1
  },
  {
    id: 129,
    title: 'Spirited Away',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    poster_path: '/39wmItIWsg9sJMyy7A7egU7n3IE.jpg',
    backdrop_path: '/Ab8Zb7feOKECBUL991b146E4Zff.jpg',
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 15000,
    genre_ids: [16, 10751, 14],
    popularity: 66.8
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone survives an attempt on his life, his youngest son, Michael, steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    poster_path: '/3bhkrj6PjOzbGhxyvd741w7wLIk.jpg',
    backdrop_path: '/tmU7B64Xn6J82uVjJ2IITdt36Z2.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 18800,
    genre_ids: [18, 80],
    popularity: 110.4
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll, and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.',
    poster_path: '/d5iIlv4J70J7cRMn9prEOfwYmxt.jpg',
    backdrop_path: '/sua755ssGGE162v292rNIexmON2.jpg',
    release_date: '1994-09-10',
    vote_average: 8.5,
    vote_count: 26000,
    genre_ids: [53, 80],
    popularity: 69.8
  },
  {
    id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    overview: 'Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron\'s forces. Meanwhile, Frodo and Sam bring the Ring closer to the heart of Mordor, the dark lord\'s power realm.',
    poster_path: '/rCzpOCm0n5w7TvPM115paUuJDjC.jpg',
    backdrop_path: '/2u7zboOSBFLVVMxDaa90jv27cQA.jpg',
    release_date: '2003-12-01',
    vote_average: 8.5,
    vote_count: 22400,
    genre_ids: [12, 14, 28],
    popularity: 91.5
  },
  {
    id: 857,
    title: 'Saving Private Ryan',
    overview: 'As U.S. troops storm the beaches of Normandy, three brothers lie dead on the battlefield, with a fourth trapped behind enemy lines. Ranger Captain John Miller and a select group of soldiers are ordered to penetrate German territory to bring the missing private home.',
    poster_path: '/awuaMwz4c5Gg96Y63n2a4P1e2v1.jpg',
    backdrop_path: '/3Yp2bM3Rj9X6gY2R0k8vT0S5H0Y.jpg',
    release_date: '1998-07-21',
    vote_average: 8.4,
    vote_count: 21100,
    genre_ids: [18, 36, 10752],
    popularity: 57.6
  },
  {
    id: 315162,
    title: 'How to Train Your Dragon: The Hidden World',
    overview: 'As Hiccup fulfills his dream of creating a peaceful dragon utopia, Toothless’ discovery of an untamed, elusive mate draws the Night Fury away. When danger mounts at home and Hiccup’s reign as village chief is tested, both dragon and rider must make impossible decisions to save their kind.',
    poster_path: '/x1QZ5bg00hi14LTLg44gMDt6X0L.jpg',
    backdrop_path: '/h3bi2Jjov2o2QzcWgocsg9b3mGf.jpg',
    release_date: '2019-01-03',
    vote_average: 7.8,
    vote_count: 5700,
    genre_ids: [16, 12, 10751],
    popularity: 45.3
  },
  {
    id: 11,
    title: 'Star Wars: Episode IV - A New Hope',
    overview: 'Princess Leia is held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team up with the loveable co-pilot Chewbacca and droid duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Galaxy.',
    poster_path: '/6FfV512pf8vPYg745fJ4Fc1Y67r.jpg',
    backdrop_path: '/zqkmClJb62e4cyfbKzUs79w96JA.jpg',
    release_date: '1977-05-25',
    vote_average: 8.2,
    vote_count: 19500,
    genre_ids: [12, 28, 878],
    popularity: 52.8
  },
  {
    id: 1422,
    title: 'The Departed',
    overview: 'To take down South Boston\'s Irish Mafia, the police send in one of their own to infiltrate the gang, not realizing the syndicate has done the same thing within the police department. When both sides discover they have a mole, life-or-death races begin to uncover each other\'s identities.',
    poster_path: '/5EIsB5nS7u2f2Vf8D22C1J6wVjX.jpg',
    backdrop_path: '/lh5nhqqOyg0chSv4oWcCVI45lSg.jpg',
    release_date: '2006-10-05',
    vote_average: 8.2,
    vote_count: 14000,
    genre_ids: [18, 80, 53],
    popularity: 42.1
  },
  {
    id: 107,
    title: 'Snatch',
    overview: 'Unscrupulous boxing promoters, violent bookmakers, a Russian gangster, incompetent amateur robbers and supposedly Jewish jewelers fight to track down a priceless stolen diamond.',
    poster_path: '/on9JUIuB5qO3qNSagugfsWnIS4w.jpg',
    backdrop_path: '/7rU1j83f5Z8Y8F8Jg93jJqU1j83.jpg',
    release_date: '2000-09-01',
    vote_average: 7.8,
    vote_count: 8200,
    genre_ids: [35, 80],
    popularity: 38.5
  }
];

export const MOCK_CAST: Record<number, CastMember[]> = {
  27205: [ // Inception
    { id: 6193, name: 'Leonardo DiCaprio', character: 'Cobb', profile_path: '/wo2hJUv4h31srA4F7qj4459wIPM.jpg' },
    { id: 1100, name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: '/9K5S6208o32Hk44h11sR62o.jpg' },
    { id: 18050, name: 'Elliot Page', character: 'Ariadne', profile_path: '/44Hkf51g718kHj217hU.jpg' },
    { id: 2524, name: 'Tom Hardy', character: 'Eames', profile_path: '/yVgfcs54718sHkf44h1.jpg' }
  ],
  157336: [ // Interstellar
    { id: 10297, name: 'Matthew McConaughey', character: 'Cooper', profile_path: '/wo2hJUv4h31srA4F7qj4459wIPM.jpg' },
    { id: 1813, name: 'Anne Hathaway', character: 'Brand', profile_path: '/9K5S6208o32Hk44h11sR62o.jpg' },
    { id: 83002, name: 'Jessica Chastain', character: 'Murph', profile_path: '/44Hkf51g718kHj217hU.jpg' },
    { id: 3895, name: 'Michael Caine', character: 'Professor Brand', profile_path: '/yVgfcs54718sHkf44h.jpg' }
  ],
  155: [ // The Dark Knight
    { id: 3894, name: 'Christian Bale', character: 'Bruce Wayne / Batman', profile_path: '/wo2hJUv4h31srA4F7qj4459wIPM.jpg' },
    { id: 1810, name: 'Heath Ledger', character: 'Joker', profile_path: '/9K5S6208o32Hk44h11sR62o.jpg' },
    { id: 10295, name: 'Gary Oldman', character: 'James Gordon', profile_path: '/44Hkf51g718kHj217hU.jpg' },
    { id: 224, name: 'Aaron Eckhart', character: 'Harvey Dent', profile_path: '/yVgfcs54718sHkf44h.jpg' }
  ]
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockGetPopularMovies = async (): Promise<Movie[]> => {
  await delay(400);
  return [...MOCK_MOVIES].sort((a, b) => b.popularity - a.popularity);
};

export const mockGetTrendingMovies = async (): Promise<Movie[]> => {
  await delay(400);
  return [...MOCK_MOVIES].sort(() => 0.5 - Math.random());
};

export const mockGetTopRatedMovies = async (): Promise<Movie[]> => {
  await delay(400);
  return [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
};

export const mockSearchMovies = async (query: string, genreId?: number, year?: string, minRating?: number): Promise<Movie[]> => {
  await delay(500);
  let results = [...MOCK_MOVIES];

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(m => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q));
  }

  if (genreId) {
    results = results.filter(m => m.genre_ids.includes(genreId));
  }

  if (year) {
    results = results.filter(m => m.release_date.startsWith(year));
  }

  if (minRating !== undefined) {
    results = results.filter(m => m.vote_average >= minRating);
  }

  return results;
};

export const mockGetMovieDetails = async (id: number): Promise<MovieDetail> => {
  await delay(300);
  const movie = MOCK_MOVIES.find(m => m.id === id);
  if (!movie) {
    throw new Error('Movie not found in mock database.');
  }

  const movieGenres = MOCK_GENRES.filter(g => movie.genre_ids.includes(g.id));
  const cast = MOCK_CAST[id] || [
    { id: 999, name: 'John Doe', character: 'Supporting Role', profile_path: null },
    { id: 998, name: 'Jane Smith', character: 'Lead Actor', profile_path: null }
  ];

  return {
    ...movie,
    tagline: 'An unforgettable cinematic masterpiece.',
    runtime: 148,
    genres: movieGenres,
    budget: 160000000,
    revenue: 829895144,
    cast,
    videos: {
      results: [
        { key: 'YoHD9OBzBUc', site: 'YouTube', type: 'Trailer' } // Standard trailer key
      ]
    }
  };
};

export const mockGetSimilarMovies = async (id: number): Promise<Movie[]> => {
  await delay(400);
  const movie = MOCK_MOVIES.find(m => m.id === id);
  if (!movie) return MOCK_MOVIES.slice(0, 4);

  // Return movies that share at least one genre
  return MOCK_MOVIES.filter(m => m.id !== id && m.genre_ids.some(gid => movie.genre_ids.includes(gid))).slice(0, 6);
};
