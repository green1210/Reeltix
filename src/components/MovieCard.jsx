import { Link } from 'react-router-dom';
import { Star, Play, Clock, Calendar, Youtube, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import TrailerModal from './TrailerModal';
import RatingModal from './RatingModal';

const MovieCard = ({ movie, index, variant = 'default' }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    loadUserRating();
  }, [movie.id]);

  const loadUserRating = () => {
    try {
      const summary = JSON.parse(localStorage.getItem('movieRatingsSummary') || '{}');
      setUserRating(summary[movie.id] || null);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTrailer(true);
  };

  const handleRatingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRating(true);
  };

  const handleRatingSubmit = () => {
    loadUserRating(); // Refresh user rating after submission
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Check if movie is upcoming
  const isUpcoming = (movie) => {
    if (!movie.releaseDate) return false;
    return new Date(movie.releaseDate) > new Date();
  };

  // Format release date for upcoming movies
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // EXACT BookMyShow sizing - matching the reference image perfectly
  const cardClasses = {
    default: "group block animate-fade-in movie-card-hover w-full", 
    compact: "group block animate-fade-in hover:scale-105 transition-transform duration-300 w-full", 
    featured: "group block animate-fade-in movie-card-hover w-full"
  };

  const containerClasses = {
    default: "relative overflow-hidden rounded-lg bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-xl border border-gray-700/50 transition-all duration-500 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/20 h-full",
    compact: "relative overflow-hidden rounded-lg bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-xl border border-gray-700/50 transition-all duration-300 hover:border-primary-500/50 h-full",
    featured: "relative overflow-hidden rounded-xl bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-xl border border-gray-700/50 transition-all duration-500 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/25 h-full"
  };

  // EXACT BookMyShow poster ratio - matching their professional layout
  const aspectRatioClasses = {
    default: "aspect-[3/4] w-full", // BookMyShow uses 3:4 ratio (slightly wider than cinema 2:3)
    compact: "aspect-[3/4] w-full",  // Consistent across all variants
    featured: "aspect-[3/4] w-full"  // BookMyShow standard size
  };

  return (
    <>
      <Link 
        to={`/movie/${movie.id}`}
        className={cardClasses[variant]}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className={containerClasses[variant]}>
          {/* EXACT BookMyShow poster container */}
          <div className={`${aspectRatioClasses[variant]} overflow-hidden relative`}>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton rounded-t-lg" />
            )}
            
            {/* Movie poster - EXACT BookMyShow sizing */}
            <img
              src={imageError ? 'https://images.unsplash.com/photo-1489599797906-352146bdacdd?w=300&h=400&fit=crop' : movie.poster}
              alt={movie.title}
              className={`w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-2 transform scale-75 group-hover:scale-100 transition-transform duration-500 neon-glow">
                <Play className="h-3 w-3 text-white" fill="currentColor" />
              </div>
            </div>

            {/* Action buttons - BookMyShow style */}
            <div className="absolute top-1.5 left-1.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button
                onClick={handleTrailerClick}
                className="bg-red-600/90 hover:bg-red-600 backdrop-blur-md rounded-full p-1 flex items-center text-white text-xs font-bold transition-all duration-300 transform hover:scale-105 focus-ring"
                aria-label={`Watch ${movie.title} trailer`}
              >
                <Youtube className="h-2 w-2" />
              </button>
              
              <button
                onClick={handleRatingClick}
                className="bg-primary-600/90 hover:bg-primary-600 backdrop-blur-md rounded-full p-1 flex items-center text-white text-xs font-bold transition-all duration-300 transform hover:scale-105 focus-ring"
                aria-label={`Rate ${movie.title}`}
              >
                <Star className="h-2 w-2" />
              </button>
            </div>

            {/* Rating badges - BookMyShow style */}
            <div className="absolute top-1.5 right-1.5 space-y-1">
              {/* IMDb Rating */}
              <div className="bg-black/60 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center space-x-0.5">
                <Star className="h-2 w-2 text-yellow-400 fill-current" />
                <span className="text-xs font-bold text-white">{movie.rating}</span>
              </div>
              
              {/* User Rating */}
              {userRating && userRating.totalRatings > 0 && (
                <div className="bg-primary-500/80 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center space-x-0.5">
                  <Users className="h-2 w-2 text-white" />
                  <span className="text-xs font-bold text-white">{userRating.averageRating}</span>
                </div>
              )}
            </div>

            {/* Status badges - BookMyShow style */}
            <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {isUpcoming(movie) ? (
                <div className="bg-gradient-to-r from-accent-500 to-orange-500 backdrop-blur-md rounded-full px-1.5 py-0.5">
                  <span className="text-xs font-bold text-white">Soon</span>
                </div>
              ) : (
                <div className="bg-primary-500/80 backdrop-blur-md rounded-full px-1.5 py-0.5">
                  <span className="text-xs font-bold text-white">{movie.releaseYear}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Movie info section - BookMyShow compact style */}
          <div className="p-2 flex-1 flex flex-col">
            <h3 className="font-bold text-xs mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors duration-300 flex-1 leading-tight">
              {movie.title}
            </h3>
            
            <div className="flex items-center justify-between mb-1 text-xs">
              <div className="flex items-center space-x-0.5">
                <Clock className="h-2 w-2 text-gray-400" />
                <span className="text-gray-400 text-xs">{movie.duration}</span>
              </div>
              <div className="flex items-center space-x-0.5">
                <Calendar className="h-2 w-2 text-gray-400" />
                <span className="text-gray-400 text-xs">
                  {isUpcoming(movie) && movie.releaseDate 
                    ? formatReleaseDate(movie.releaseDate)
                    : movie.releaseYear
                  }
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <span className={`inline-block text-xs px-1 py-0.5 rounded-full border ${
                isUpcoming(movie)
                  ? 'bg-gradient-to-r from-accent-500/20 to-orange-500/20 text-accent-400 border-accent-500/30'
                  : 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border-primary-500/30'
              }`}>
                {movie.genre}
              </span>
              <div className="flex items-center space-x-1">
                {/* IMDb Rating */}
                <div className="flex items-center space-x-0.5">
                  <Star className="h-2 w-2 text-yellow-400 fill-current" />
                  <span className="text-xs font-semibold text-white">{movie.rating}</span>
                </div>
                
                {/* User Rating */}
                {userRating && userRating.totalRatings > 0 && (
                  <div className="flex items-center space-x-0.5 ml-1">
                    <Users className="h-2 w-2 text-primary-400" />
                    <span className="text-xs font-semibold text-primary-400">{userRating.averageRating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Release date for upcoming movies */}
            {isUpcoming(movie) && movie.releaseDate && (
              <div className="mt-1 text-center">
                <div className="text-xs text-accent-400 font-semibold">
                  {formatReleaseDate(movie.releaseDate)}
                </div>
              </div>
            )}

            {/* User rating count */}
            {userRating && userRating.totalRatings > 0 && (
              <div className="mt-0.5 text-xs text-gray-400 text-center">
                {userRating.totalRatings} rating{userRating.totalRatings !== 1 ? 's' : ''}
              </div>
            )}

            {/* Hover effect bottom bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
              isUpcoming(movie)
                ? 'bg-gradient-to-r from-accent-500 via-orange-500 to-yellow-500'
                : 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500'
            }`}></div>
          </div>
        </div>
      </Link>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        movieId={movie.id}
        movieTitle={movie.title}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        movie={movie}
        onRatingSubmit={handleRatingSubmit}
      />
    </>
  );
};

export default MovieCard;