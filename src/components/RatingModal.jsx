import { useState, useEffect } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { useAuth } from '../App';

const RatingModal = ({ isOpen, onClose, movie, onRatingSubmit }) => {
  const { isAuthenticated, user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (isOpen && movie && user) {
      // Check if user has already rated this movie
      const existingRating = getUserRating(movie.id, user.id);
      if (existingRating) {
        setUserRating(existingRating.rating);
        setReview(existingRating.review || '');
        setHasRated(true);
      } else {
        setUserRating(0);
        setReview('');
        setHasRated(false);
      }
    }
  }, [isOpen, movie, user]);

  const getUserRating = (movieId, userId) => {
    try {
      const ratings = JSON.parse(localStorage.getItem('userMovieRatings') || '{}');
      return ratings[`${movieId}_${userId}`];
    } catch {
      return null;
    }
  };

  const saveUserRating = (movieId, userId, rating, review) => {
    try {
      const ratings = JSON.parse(localStorage.getItem('userMovieRatings') || '{}');
      ratings[`${movieId}_${userId}`] = {
        rating,
        review,
        timestamp: new Date().toISOString(),
        movieTitle: movie.title
      };
      localStorage.setItem('userMovieRatings', JSON.stringify(ratings));
      
      // Also update movie ratings summary
      updateMovieRatingsSummary(movieId, rating);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const updateMovieRatingsSummary = (movieId, newRating) => {
    try {
      const summary = JSON.parse(localStorage.getItem('movieRatingsSummary') || '{}');
      if (!summary[movieId]) {
        summary[movieId] = {
          totalRatings: 0,
          averageRating: 0,
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
        };
      }
      
      const movieSummary = summary[movieId];
      
      // Remove old rating if updating
      const existingRating = getUserRating(movieId, user.id);
      if (existingRating) {
        movieSummary.ratings[existingRating.rating]--;
        movieSummary.totalRatings--;
      }
      
      // Add new rating
      movieSummary.ratings[newRating]++;
      movieSummary.totalRatings++;
      
      // Calculate new average
      let totalScore = 0;
      for (let i = 1; i <= 10; i++) {
        totalScore += i * movieSummary.ratings[i];
      }
      movieSummary.averageRating = movieSummary.totalRatings > 0 
        ? (totalScore / movieSummary.totalRatings).toFixed(1) 
        : 0;
      
      localStorage.setItem('movieRatingsSummary', JSON.stringify(summary));
    } catch (error) {
      console.error('Error updating movie ratings summary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to rate movies');
      return;
    }
    
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      saveUserRating(movie.id, user.id, userRating, review);
      setHasRated(true);
      
      if (onRatingSubmit) {
        onRatingSubmit(movie.id, userRating, review);
      }
      
      // Show success message
      alert(hasRated ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setHoverRating(0);
    onClose();
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-2xl font-bold gradient-text">{movie.title}</h2>
              <p className="text-gray-400">Rate this movie</p>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">IMDb: {movie.rating}/10</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Login Required</h3>
              <p className="text-gray-400 mb-6">Please login to rate and review movies</p>
              <button
                onClick={() => {
                  handleClose();
                  // Navigate to login - you might want to use navigate here
                  window.location.href = '/login';
                }}
                className="btn-primary"
              >
                Login to Rate
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-lg font-bold mb-4 text-center">
                  {hasRated ? 'Update Your Rating' : 'Rate This Movie'}
                </label>
                <div className="flex justify-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                        star <= (hoverRating || userRating)
                          ? 'text-yellow-400'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      <Star 
                        className="h-8 w-8" 
                        fill={star <= (hoverRating || userRating) ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold gradient-text">
                    {hoverRating || userRating || 0}/10
                  </span>
                  <div className="text-sm text-gray-400 mt-1">
                    {(hoverRating || userRating) === 0 && 'Select a rating'}
                    {(hoverRating || userRating) >= 1 && (hoverRating || userRating) <= 3 && 'Poor'}
                    {(hoverRating || userRating) >= 4 && (hoverRating || userRating) <= 5 && 'Fair'}
                    {(hoverRating || userRating) >= 6 && (hoverRating || userRating) <= 7 && 'Good'}
                    {(hoverRating || userRating) >= 8 && (hoverRating || userRating) <= 9 && 'Great'}
                    {(hoverRating || userRating) === 10 && 'Masterpiece'}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="form-label">
                  Write a Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  className="form-input min-h-[120px] resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {review.length}/500 characters
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setUserRating(8)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors duration-300"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Recommend (8/10)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRating(4)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors duration-300"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Not Recommended (4/10)</span>
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || userRating === 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    hasRated ? 'Update Rating' : 'Submit Rating'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;