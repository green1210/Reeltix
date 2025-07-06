import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Clock, Calendar, TrendingUp, Award, Zap, Film, Youtube, ArrowRight } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import RatingModal from '../components/RatingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { movieApi } from '../services/movieApi';
import { useBooking } from '../App';
import { mockTheaters } from '../data/mockData';

const Home = () => {
  const navigate = useNavigate();
  const { updateBooking } = useBooking();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]); // Additional popular movies
  const [topRatedMovies, setTopRatedMovies] = useState([]); // NEW: Top-rated movies to fill space
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const [selectedRatingMovie, setSelectedRatingMovie] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  // Auto-scroll for featured movies
  useEffect(() => {
    if (featuredMovies.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredMovies.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change movie every 5 seconds

      return () => clearInterval(interval);
    }
  }, [featuredMovies.length]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // ENHANCED: Fetch MORE movie data to completely fill all empty spaces
        const [
          nowPlayingResponse,
          upcomingResponse,
          trendingResponse,
          popularResponse,
          topRatedResponse // NEW: Additional top-rated movies
        ] = await Promise.all([
          movieApi.getNowPlaying(1), // Latest movies currently in theaters
          movieApi.getUpcoming(1),   // Upcoming releases
          movieApi.getTrending('day'), // Trending movies
          movieApi.getPopular(1), // Popular movies for additional content
          movieApi.getTopRated(1) // NEW: Top-rated movies for filling space
        ]);

        // Prioritize now playing movies first, then upcoming for hero carousel
        const latestMovies = nowPlayingResponse.movies.slice(0, 3);
        const upcomingMovies = upcomingResponse.movies.slice(0, 2);
        const heroMovies = [...latestMovies, ...upcomingMovies];

        if (heroMovies.length > 0) {
          setFeaturedMovies(heroMovies);
        }

        // ENHANCED: Set movie lists with MORE movies to fill ALL empty spaces
        setNowPlaying(nowPlayingResponse.movies.slice(0, 15)); // Increased from 12 to 15
        setComingSoon(upcomingResponse.movies.slice(0, 12)); // Increased from 10 to 12
        setTrending(trendingResponse.movies.slice(0, 15)); // Increased from 12 to 15
        setPopularMovies(popularResponse.movies.slice(0, 12)); // Popular movies section
        setTopRatedMovies(topRatedResponse.movies.slice(0, 10)); // NEW: Top-rated movies section

      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleBookNow = () => {
    const currentMovie = featuredMovies[currentFeaturedIndex];
    if (!currentMovie) return;
    
    // Navigate to booking with first available theater and showtime
    const firstTheater = mockTheaters[0];
    const firstShowtime = '7:15 PM'; // Prime time slot
    const today = new Date().toISOString().split('T')[0];
    
    updateBooking({
      movie: currentMovie,
      theater: firstTheater,
      showtime: firstShowtime,
      date: today,
      seats: [],
      totalPrice: 0
    });

    navigate('/seats');
  };

  const handleTrailerClick = () => {
    const currentMovie = featuredMovies[currentFeaturedIndex];
    if (!currentMovie) return;
    
    setSelectedTrailerMovie(currentMovie);
    setShowTrailer(true);
  };

  const handleRatingClick = () => {
    const currentMovie = featuredMovies[currentFeaturedIndex];
    if (!currentMovie) return;
    
    setSelectedRatingMovie(currentMovie);
    setShowRating(true);
  };

  const handleTrailerClose = () => {
    setShowTrailer(false);
    setSelectedTrailerMovie(null);
  };

  const handleRatingClose = () => {
    setShowRating(false);
    setSelectedRatingMovie(null);
  };

  const handleRatingSubmit = () => {
    // Refresh any rating-related data if needed
    console.log('Rating submitted for featured movie');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterStatus('subscribing');
    
    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 3000);
    }, 1000);
  };

  const handleNextMovie = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === featuredMovies.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentFeaturedIndex(index);
  };

  // Format release date for upcoming movies
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Check if movie is upcoming
  const isUpcoming = (movie) => {
    if (!movie.releaseDate) return false;
    return new Date(movie.releaseDate) > new Date();
  };

  if (loading) {
    return <LoadingSpinner size="xl" message="Loading amazing movies..." variant="film" fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern container-safe">
        <div className="text-center max-w-md">
          <div className="error-state mb-6">
            <Film className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Movies</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!featuredMovies.length) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern container-safe">
        <div className="text-center">
          <div className="text-gray-400 text-xl">No movies available</div>
        </div>
      </div>
    );
  }

  const currentMovie = featuredMovies[currentFeaturedIndex];

  return (
    <div className="animate-fade-in container-safe">
      {/* Hero Section with Movie Carousel - CLEANED UP */}
      <section className="relative min-h-[70vh] flex items-center hero-pattern overflow-hidden hero-section">
        {/* Background Images with Transition */}
        <div className="absolute inset-0">
          {featuredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat bg-cover-safe transition-opacity duration-1000 ${
                index === currentFeaturedIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                backgroundImage: `url(${movie.backdrop})`,
              }}
            />
          ))}
        </div>
        
        {/* Multiple overlay layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/60 to-dark-950/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-950/80" />
        
        <div className="relative mobile-container py-8 sm:py-12">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center grid-safe">
            {/* Content */}
            <div className="space-y-4 sm:space-y-6 animate-fade-in-left">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-1.5">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-primary-400 font-semibold text-xs uppercase tracking-wider">
                  {isUpcoming(currentMovie) ? 'Coming Soon' : 'Now Playing'}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight hero-title">
                <span className="gradient-text">{currentMovie.title}</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl hero-subtitle">
                {currentMovie.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                  <span className="text-sm sm:text-base font-bold">{currentMovie.rating}</span>
                  <span className="text-xs text-gray-400">/10</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <span className="text-gray-300 font-medium text-xs sm:text-sm">{currentMovie.duration}</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <span className="text-gray-300 font-medium text-xs sm:text-sm">{currentMovie.releaseYear}</span>
                </div>
              </div>

              {/* Release Date for Upcoming Movies */}
              {isUpcoming(currentMovie) && currentMovie.releaseDate && (
                <div className="bg-gradient-to-r from-accent-500/20 to-orange-500/20 border border-accent-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-accent-400" />
                    <span className="text-accent-400 font-bold text-sm">Releases On</span>
                  </div>
                  <div className="text-white font-bold text-lg">
                    {formatReleaseDate(currentMovie.releaseDate)}
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    Mark your calendar for this epic release!
                  </div>
                </div>
              )}

              <div className="mobile-flex gap-3 flex-safe">
                <button
                  onClick={handleBookNow}
                  className="btn-primary mobile-flex items-center justify-center space-x-2 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 animate-glow flex-1 sm:flex-none"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" />
                  <span>{isUpcoming(currentMovie) ? 'Pre-Book' : 'Book Tickets'}</span>
                </button>
                <button 
                  onClick={handleTrailerClick}
                  className="btn-ghost mobile-flex items-center justify-center space-x-2 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 flex-1 sm:flex-none"
                >
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  <span className="hidden sm:inline">Trailer</span>
                  <span className="sm:hidden">Play</span>
                </button>
                <button 
                  onClick={handleRatingClick}
                  className="btn-secondary mobile-flex items-center justify-center space-x-2 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 flex-1 sm:flex-none"
                >
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                  <span className="hidden sm:inline">Rate</span>
                  <span className="sm:hidden">★</span>
                </button>
              </div>
            </div>

            {/* Movie Poster */}
            <div className="relative animate-fade-in-right">
              <div className="relative max-w-xs mx-auto lg:max-w-sm">
                <img
                  src={currentMovie.poster}
                  alt={currentMovie.title}
                  className="w-full rounded-xl sm:rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                <div className="absolute -inset-3 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 rounded-xl sm:rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                
                {/* Upcoming Badge */}
                {isUpcoming(currentMovie) && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-accent-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Movie Carousel Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2">
            {featuredMovies.map((movie, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentFeaturedIndex
                    ? 'bg-primary-500 scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to movie ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Movie Counter & Status */}
        <div className="absolute bottom-8 right-8 z-20 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
          <div className="flex items-center space-x-2">
            <span>{currentFeaturedIndex + 1} / {featuredMovies.length}</span>
            {isUpcoming(currentMovie) && (
              <>
                <span>•</span>
                <span className="text-accent-400">Upcoming</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Now Playing - ENHANCED with MORE movies */}
      <section className="mobile-section">
        <div className="mobile-container">
          <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in-up flex-safe">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-1.5 sm:p-2">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="currentColor" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Now Playing</h2>
            </div>
            <Link 
              to="/movies" 
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center space-x-1 group transition-colors duration-300 text-xs sm:text-sm"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          <div className="movie-grid-compact">
            {nowPlaying.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Movies - ENHANCED with MORE movies */}
      <section className="mobile-section bg-gradient-to-b from-transparent to-dark-900/50">
        <div className="mobile-container">
          <div className="flex items-center space-x-2 mb-6 sm:mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-full p-1.5 sm:p-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Trending Now</h2>
          </div>
          <div className="movie-grid-standard">
            {trending.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon - ENHANCED with MORE movies */}
      <section className="mobile-section bg-gradient-to-b from-dark-900/50 to-transparent">
        <div className="mobile-container">
          <div className="flex items-center space-x-2 mb-6 sm:mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full p-1.5 sm:p-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Coming Soon</h2>
          </div>
          <div className="movie-grid-standard">
            {comingSoon.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Movies Section - FILLS EMPTY SPACE */}
      {popularMovies.length > 0 && (
        <section className="mobile-section bg-gradient-to-b from-transparent to-dark-900/30">
          <div className="mobile-container">
            <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in-up flex-safe">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full p-1.5 sm:p-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Popular Movies</h2>
              </div>
              <Link 
                to="/movies" 
                className="text-primary-400 hover:text-primary-300 font-semibold flex items-center space-x-1 group transition-colors duration-300 text-xs sm:text-sm"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="movie-grid-standard">
              {popularMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} variant="default" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW: Top Rated Movies Section - COMPLETELY FILLS REMAINING SPACE */}
      {topRatedMovies.length > 0 && (
        <section className="mobile-section bg-gradient-to-b from-dark-900/30 to-transparent">
          <div className="mobile-container">
            <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in-up flex-safe">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-accent-500 to-secondary-500 rounded-full p-1.5 sm:p-2">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Top Rated</h2>
              </div>
              <Link 
                to="/movies" 
                className="text-primary-400 hover:text-primary-300 font-semibold flex items-center space-x-1 group transition-colors duration-300 text-xs sm:text-sm"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="movie-grid-standard">
              {topRatedMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} variant="default" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="mobile-section">
        <div className="max-w-3xl mx-auto mobile-padding text-center">
          <div className="card-glass mobile-card animate-scale-in">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-3 gradient-text">Stay Updated</h2>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Get notified about the latest movies, exclusive offers, and premium screenings.</p>
            
            <form onSubmit={handleNewsletterSubmit} className="mobile-flex gap-3 max-w-sm mx-auto flex-safe">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="form-input flex-1"
                required
                disabled={newsletterStatus === 'subscribing'}
              />
              <button 
                type="submit"
                className="btn-primary whitespace-nowrap mobile-button disabled:opacity-50"
                disabled={newsletterStatus === 'subscribing' || !newsletterEmail}
              >
                {newsletterStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {newsletterStatus === 'success' && (
              <div className="success-state mt-3">
                <p>Thank you for subscribing! You'll receive updates about the latest movies and offers.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={handleTrailerClose}
        movieId={selectedTrailerMovie?.id}
        movieTitle={selectedTrailerMovie?.title}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRating}
        onClose={handleRatingClose}
        movie={selectedRatingMovie}
        onRatingSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default Home;