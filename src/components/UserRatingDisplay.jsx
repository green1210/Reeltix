import { Star, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const UserRatingDisplay = ({ movieId, imdbRating }) => {
  const [userRatings, setUserRatings] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadUserRatings();
  }, [movieId]);

  const loadUserRatings = () => {
    try {
      const summary = JSON.parse(localStorage.getItem('movieRatingsSummary') || '{}');
      setUserRatings(summary[movieId] || null);
    } catch (error) {
      console.error('Error loading user ratings:', error);
      setUserRatings(null);
    }
  };

  const getRatingDistribution = () => {
    if (!userRatings) return [];
    
    const total = userRatings.totalRatings;
    return Object.entries(userRatings.ratings)
      .map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .reverse(); // Show 10 to 1
  };

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* IMDb Rating */}
        <div className="card-glass p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-yellow-400">IMDb</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{imdbRating}</div>
          <div className="text-xs text-gray-400">Official Rating</div>
        </div>

        {/* User Rating */}
        <div className="card-glass p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Users</span>
          </div>
          <div className="text-2xl font-bold text-primary-400">
            {userRatings ? userRatings.averageRating : '--'}
          </div>
          <div className="text-xs text-gray-400">
            {userRatings ? `${userRatings.totalRatings} ratings` : 'No ratings yet'}
          </div>
        </div>
      </div>

      {/* Rating Details Toggle */}
      {userRatings && userRatings.totalRatings > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>{showDetails ? 'Hide' : 'Show'} Rating Breakdown</span>
        </button>
      )}

      {/* Rating Distribution */}
      {showDetails && userRatings && (
        <div className="card-glass p-4 animate-slide-down">
          <h4 className="text-sm font-bold mb-3 text-center text-gray-300">Rating Distribution</h4>
          <div className="space-y-2">
            {getRatingDistribution().map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="w-6 text-xs text-gray-400 text-right">{rating}</div>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-xs text-gray-400 text-right">{count}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700 text-center">
            <div className="text-xs text-gray-400">
              Average: <span className="text-primary-400 font-semibold">{userRatings.averageRating}/10</span>
              {' • '}
              Total: <span className="text-primary-400 font-semibold">{userRatings.totalRatings}</span> ratings
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRatingDisplay;