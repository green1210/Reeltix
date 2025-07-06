import axios from 'axios';

// TMDB API configuration with updated API key
const API_KEY = '4672ec882d98437249a40185012dac40';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US', // Ensure English content
    region: 'US', // Get US release dates and availability
  },
  timeout: 8000,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API may be slow');
    } else if (error.response?.status === 401) {
      console.error('Invalid API key');
    }
    return Promise.reject(error);
  }
);

// Helper function to get full image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1489599797906-352146bdacdd?w=400&h=600&fit=crop';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// FIXED: Enhanced streaming platform mapping WITHOUT Apple TV (removed problematic platforms)
const streamingPlatforms = {
  8: { 
    name: 'Netflix', 
    logo: '🎬', 
    color: '#E50914', 
    type: 'subscription',
    searchUrl: 'https://www.netflix.com/search?q='
  },
  119: { 
    name: 'Amazon Prime Video', 
    logo: '📺', 
    color: '#00A8E1', 
    type: 'subscription',
    searchUrl: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase='
  },
  337: { 
    name: 'Disney+', 
    logo: '🏰', 
    color: '#113CCF', 
    type: 'subscription',
    searchUrl: 'https://www.disneyplus.com/search?q='
  },
  384: { 
    name: 'HBO Max', 
    logo: '🎭', 
    color: '#8A2BE2', 
    type: 'subscription',
    searchUrl: 'https://www.hbomax.com/search?q='
  },
  15: { 
    name: 'Hulu', 
    logo: '📱', 
    color: '#1CE783', 
    type: 'subscription',
    searchUrl: 'https://www.hulu.com/search?q='
  },
  // REMOVED: Apple TV+ and Apple iTunes (causing download issues)
  // 350: Apple TV+
  // 2: Apple iTunes
  3: { 
    name: 'Google Play Movies', 
    logo: '▶️', 
    color: '#4285F4', 
    type: 'rent/buy',
    searchUrl: 'https://play.google.com/store/search?q='
  },
  192: { 
    name: 'YouTube Movies', 
    logo: '📹', 
    color: '#FF0000', 
    type: 'rent/buy',
    searchUrl: 'https://www.youtube.com/results?search_query='
  },
  // Indian platforms
  444: { 
    name: 'Hotstar', 
    logo: '⭐', 
    color: '#0F1419', 
    type: 'subscription',
    searchUrl: 'https://www.hotstar.com/in/search?q='
  },
  122: { 
    name: 'Zee5', 
    logo: '🎭', 
    color: '#6C2C91', 
    type: 'subscription',
    searchUrl: 'https://www.zee5.com/search?q='
  },
  283: { 
    name: 'Jio Cinema', 
    logo: '📱', 
    color: '#0066CC', 
    type: 'subscription',
    searchUrl: 'https://www.jiocinema.com/search?q='
  }
};

// Helper function to format movie data with current information
const formatMovie = (movie) => {
  const releaseDate = movie.release_date ? new Date(movie.release_date) : new Date();
  const currentYear = new Date().getFullYear();
  
  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview || 'An exciting movie experience awaits you.',
    poster: getImageUrl(movie.poster_path),
    backdrop: getImageUrl(movie.backdrop_path, 'w1280'),
    rating: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : 0,
    duration: '2h 30m', // Will be updated with actual runtime in details
    releaseYear: releaseDate.getFullYear(),
    genre: movie.genre_ids && movie.genre_ids.length > 0 ? getGenreName(movie.genre_ids[0]) : 'Action',
    releaseDate: movie.release_date,
    popularity: movie.popularity,
    voteCount: movie.vote_count,
    isNewRelease: releaseDate.getFullYear() === currentYear,
    isUpcoming: releaseDate > new Date(),
    adult: movie.adult || false
  };
};

// Updated genre mapping
const genreMap = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

const getGenreName = (genreId) => genreMap[genreId] || 'Action';

// Helper function to get current date ranges
const getCurrentDateRanges = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // For "now playing" - movies released in the last 6 weeks
  const sixWeeksAgo = new Date(now.getTime() - (6 * 7 * 24 * 60 * 60 * 1000));
  const nowPlayingStart = sixWeeksAgo.toISOString().split('T')[0];
  
  // For "upcoming" - movies releasing in the next 3 months
  const threeMonthsFromNow = new Date(now.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
  const upcomingEnd = threeMonthsFromNow.toISOString().split('T')[0];
  
  return {
    today,
    nowPlayingStart,
    upcomingEnd
  };
};

// FIXED streaming availability formatter with proper direct links (Apple TV removed)
const formatStreamingAvailability = (watchProviders, movieTitle) => {
  const availability = {
    subscription: [],
    rent: [],
    buy: [],
    free: []
  };

  if (!watchProviders) return availability;

  // Enhanced link creation with better search terms
  const createDirectLink = (platform, movieTitle, providerId) => {
    const cleanTitle = movieTitle.replace(/[^\w\s]/gi, '').trim();
    const searchTerm = encodeURIComponent(cleanTitle);
    
    // Special handling for specific platforms (Apple TV removed)
    switch (providerId) {
      case 192: // YouTube Movies
        return `https://www.youtube.com/results?search_query=${searchTerm}+movie`;
      case 3: // Google Play Movies
        return `https://play.google.com/store/search?q=${searchTerm}&c=movies`;
      case 8: // Netflix
        return `https://www.netflix.com/search?q=${searchTerm}`;
      case 119: // Amazon Prime Video
        return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${searchTerm}`;
      case 337: // Disney+
        return `https://www.disneyplus.com/search?q=${searchTerm}`;
      case 384: // HBO Max
        return `https://www.hbomax.com/search?q=${searchTerm}`;
      case 15: // Hulu
        return `https://www.hulu.com/search?q=${searchTerm}`;
      case 444: // Hotstar
        return `https://www.hotstar.com/in/search?q=${searchTerm}`;
      case 122: // Zee5
        return `https://www.zee5.com/search?q=${searchTerm}`;
      case 283: // Jio Cinema
        return `https://www.jiocinema.com/search?q=${searchTerm}`;
      default:
        return platform.searchUrl ? `${platform.searchUrl}${searchTerm}` : 
               `https://www.google.com/search?q=${searchTerm}+${encodeURIComponent(platform.name)}+movie`;
    }
  };

  // Process different types of availability (filtering out Apple platforms)
  if (watchProviders.flatrate) {
    watchProviders.flatrate.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.subscription.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          logoPath: getImageUrl(provider.logo_path, 'w92'),
          link: createDirectLink(platform, movieTitle, provider.provider_id)
        });
      }
    });
  }

  if (watchProviders.rent) {
    watchProviders.rent.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.rent.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          logoPath: getImageUrl(provider.logo_path, 'w92'),
          link: createDirectLink(platform, movieTitle, provider.provider_id)
        });
      }
    });
  }

  if (watchProviders.buy) {
    watchProviders.buy.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.buy.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          logoPath: getImageUrl(provider.logo_path, 'w92'),
          link: createDirectLink(platform, movieTitle, provider.provider_id)
        });
      }
    });
  }

  if (watchProviders.ads) {
    watchProviders.ads.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.free.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          logoPath: getImageUrl(provider.logo_path, 'w92'),
          link: createDirectLink(platform, movieTitle, provider.provider_id)
        });
      }
    });
  }

  return availability;
};

// Retry mechanism for failed requests
const retryRequest = async (requestFn, maxRetries = 1) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// API functions with enhanced error handling and current data focus
export const movieApi = {
  // Get popular movies (currently trending and popular)
  getPopular: async (page = 1) => {
    try {
      const response = await retryRequest(() => 
        api.get('/movie/popular', { 
          params: { 
            page,
            sort_by: 'popularity.desc',
            'vote_count.gte': 100, // Ensure movies have enough votes
            'primary_release_date.gte': '2020-01-01' // Focus on recent movies
          } 
        })
      );
      
      // Filter out adult content and sort by popularity
      const filteredMovies = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path)
        .map(formatMovie)
        .sort((a, b) => b.popularity - a.popularity);
      
      return {
        movies: filteredMovies,
        totalPages: Math.min(response.data.total_pages, 500),
        totalResults: response.data.total_results,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return { movies: [], totalPages: 0, totalResults: 0, currentPage: page };
    }
  },

  // Get now playing movies (currently in theaters)
  getNowPlaying: async (page = 1) => {
    try {
      const { today, nowPlayingStart } = getCurrentDateRanges();
      
      const response = await retryRequest(() =>
        api.get('/movie/now_playing', { 
          params: { 
            page,
            'primary_release_date.gte': nowPlayingStart,
            'primary_release_date.lte': today,
            'vote_count.gte': 50
          } 
        })
      );
      
      // Filter and sort by release date (newest first)
      const filteredMovies = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path)
        .map(formatMovie)
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      
      return {
        movies: filteredMovies,
        totalPages: Math.min(response.data.total_pages, 500),
        totalResults: response.data.total_results,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      return { movies: [], totalPages: 0, totalResults: 0, currentPage: page };
    }
  },

  // Get upcoming movies with release dates (future releases)
  getUpcoming: async (page = 1) => {
    try {
      const { today, upcomingEnd } = getCurrentDateRanges();
      
      const response = await retryRequest(() =>
        api.get('/movie/upcoming', { 
          params: { 
            page,
            'primary_release_date.gte': today,
            'primary_release_date.lte': upcomingEnd,
            sort_by: 'primary_release_date.asc'
          } 
        })
      );
      
      // Filter and sort by release date (soonest first)
      const filteredMovies = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path)
        .map(movie => ({
          ...formatMovie(movie),
          releaseDate: movie.release_date,
          isUpcoming: true
        }))
        .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
      
      return {
        movies: filteredMovies,
        totalPages: Math.min(response.data.total_pages, 500),
        totalResults: response.data.total_results,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      return { movies: [], totalPages: 0, totalResults: 0, currentPage: page };
    }
  },

  // Get top rated movies (highest rated recent movies)
  getTopRated: async (page = 1) => {
    try {
      const response = await retryRequest(() =>
        api.get('/movie/top_rated', { 
          params: { 
            page,
            'vote_count.gte': 500, // Ensure movies have substantial votes
            'primary_release_date.gte': '2015-01-01', // Focus on relatively recent movies
            sort_by: 'vote_average.desc'
          } 
        })
      );
      
      // Filter and sort by rating
      const filteredMovies = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path && movie.vote_average >= 7.0)
        .map(formatMovie)
        .sort((a, b) => b.rating - a.rating);
      
      return {
        movies: filteredMovies,
        totalPages: Math.min(response.data.total_pages, 500),
        totalResults: response.data.total_results,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      return { movies: [], totalPages: 0, totalResults: 0, currentPage: page };
    }
  },

  // Get movie details with enhanced current information
  getMovieDetails: async (movieId) => {
    try {
      const response = await retryRequest(() =>
        api.get(`/movie/${movieId}`, {
          params: {
            append_to_response: 'videos,credits,watch/providers,release_dates,keywords'
          }
        })
      );
      const movie = response.data;
      
      return {
        ...formatMovie(movie),
        duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '2h 30m',
        genres: movie.genres ? movie.genres.map(g => g.name) : ['Action'],
        productionCompanies: movie.production_companies || [],
        budget: movie.budget,
        revenue: movie.revenue,
        tagline: movie.tagline,
        homepage: movie.homepage,
        imdbId: movie.imdb_id,
        originalLanguage: movie.original_language,
        originalTitle: movie.original_title,
        spokenLanguages: movie.spoken_languages || [],
        videos: movie.videos?.results || [],
        cast: movie.credits?.cast?.slice(0, 10) || [],
        crew: movie.credits?.crew || [],
        watchProviders: movie['watch/providers']?.results || {},
        keywords: movie.keywords?.keywords || [],
        releaseDates: movie.release_dates?.results || []
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw new Error('Failed to load movie details');
    }
  },

  // Get movie streaming availability with FIXED direct links (Apple TV removed)
  getMovieWatchProviders: async (movieId, region = 'US') => {
    try {
      const [providersResponse, movieResponse] = await Promise.all([
        retryRequest(() => api.get(`/movie/${movieId}/watch/providers`)),
        retryRequest(() => api.get(`/movie/${movieId}`))
      ]);
      
      const providers = providersResponse.data.results[region] || 
                       providersResponse.data.results['US'] || {};
      const movieTitle = movieResponse.data.title;
      
      return formatStreamingAvailability(providers, movieTitle);
    } catch (error) {
      console.error('Error fetching watch providers:', error);
      return { subscription: [], rent: [], buy: [], free: [] };
    }
  },

  // Search movies with current focus
  searchMovies: async (query, page = 1) => {
    try {
      if (!query.trim()) {
        return { movies: [], totalPages: 0, totalResults: 0, currentPage: page };
      }
      
      const response = await retryRequest(() =>
        api.get('/search/movie', { 
          params: { 
            query: query.trim(), 
            page,
            include_adult: false,
            'primary_release_date.gte': '2010-01-01' // Focus on relatively recent movies
          } 
        })
      );
      
      // Filter and sort by popularity and relevance
      const filteredMovies = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path)
        .map(formatMovie)
        .sort((a, b) => {
          // Prioritize newer movies and higher popularity
          const aScore = (a.popularity || 0) + (a.isNewRelease ? 100 : 0);
          const bScore = (b.popularity || 0) + (b.isNewRelease ? 100 : 0);
          return bScore - aScore;
        });
      
      return {
        movies: filteredMovies,
        totalPages: Math.min(response.data.total_pages, 500),
        totalResults: response.data.total_results,
        currentPage: page
      };
    } catch (error) {
      console.error('Error searching movies:', error);
      return { movies: [], totalPages: 0, totalResults: 0, currentPage: page };
    }
  },

  // Get trending movies (daily updated - most current)
  getTrending: async (timeWindow = 'day') => {
    try {
      const response = await retryRequest(() =>
        api.get(`/trending/movie/${timeWindow}`, {
          params: {
            'vote_count.gte': 100 // Ensure trending movies have enough votes
          }
        })
      );
      
      // Filter and sort by trending score
      const filteredMovies = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path)
        .map(formatMovie)
        .sort((a, b) => b.popularity - a.popularity);
      
      return {
        movies: filteredMovies,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      };
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return { movies: [], totalPages: 0, totalResults: 0 };
    }
  },

  // Get movie videos (trailers, etc.) - prioritize recent trailers
  getMovieVideos: async (movieId) => {
    try {
      const response = await retryRequest(() =>
        api.get(`/movie/${movieId}/videos`)
      );
      
      // Sort videos to prioritize official trailers and recent uploads
      const sortedVideos = response.data.results
        .filter(video => video.site === 'YouTube')
        .sort((a, b) => {
          // Prioritize trailers over other types
          if (a.type === 'Trailer' && b.type !== 'Trailer') return -1;
          if (b.type === 'Trailer' && a.type !== 'Trailer') return 1;
          
          // Then prioritize official content
          if (a.official && !b.official) return -1;
          if (b.official && !a.official) return 1;
          
          // Finally sort by published date (if available)
          return new Date(b.published_at || 0) - new Date(a.published_at || 0);
        });
      
      return sortedVideos;
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return [];
    }
  },

  // Get movie credits with enhanced information
  getMovieCredits: async (movieId) => {
    try {
      const response = await retryRequest(() =>
        api.get(`/movie/${movieId}/credits`)
      );
      return {
        cast: response.data.cast.slice(0, 20), // Limit to top 20 cast members
        crew: response.data.crew.filter(person => 
          ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer'].includes(person.job)
        )
      };
    } catch (error) {
      console.error('Error fetching movie credits:', error);
      return { cast: [], crew: [] };
    }
  },

  // Get current movie releases (this week's releases)
  getCurrentReleases: async () => {
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const startDate = oneWeekAgo.toISOString().split('T')[0];
      const endDate = oneWeekFromNow.toISOString().split('T')[0];
      
      const response = await retryRequest(() =>
        api.get('/discover/movie', {
          params: {
            'primary_release_date.gte': startDate,
            'primary_release_date.lte': endDate,
            sort_by: 'primary_release_date.desc',
            'vote_count.gte': 10
          }
        })
      );
      
      const currentReleases = response.data.results
        .filter(movie => !movie.adult && movie.poster_path && movie.backdrop_path)
        .map(formatMovie)
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      
      return {
        movies: currentReleases,
        totalResults: response.data.total_results
      };
    } catch (error) {
      console.error('Error fetching current releases:', error);
      return { movies: [], totalResults: 0 };
    }
  }
};

export default movieApi;