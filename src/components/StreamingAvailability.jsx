import { useState, useEffect } from 'react';
import { Play, ExternalLink, Loader2, Tv, DollarSign, Gift } from 'lucide-react';
import { movieApi } from '../services/movieApi';
import { formatStreamingAvailability, openStreamingPlatform } from '../services/streamingService';

const StreamingAvailability = ({ movieId, movieTitle }) => {
  const [streamingData, setStreamingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (movieId) {
      fetchStreamingData();
    }
  }, [movieId]);

  const fetchStreamingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const availability = await movieApi.getMovieWatchProviders(movieId);
      setStreamingData(availability);
    } catch (err) {
      console.error('Error fetching streaming data:', err);
      setError('Failed to load streaming information');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformClick = (platform) => {
    openStreamingPlatform(platform);
  };

  const renderPlatformButton = (platform, type) => {
    const typeIcons = {
      subscription: <Tv className="h-4 w-4" />,
      rent: <DollarSign className="h-4 w-4" />,
      buy: <DollarSign className="h-4 w-4" />,
      free: <Gift className="h-4 w-4" />
    };

    const typeColors = {
      subscription: 'from-green-500 to-emerald-600',
      rent: 'from-blue-500 to-cyan-600',
      buy: 'from-purple-500 to-violet-600',
      free: 'from-orange-500 to-amber-600'
    };

    return (
      <button
        key={platform.id}
        onClick={() => handlePlatformClick(platform)}
        className={`group relative flex items-center space-x-3 p-4 bg-gradient-to-r ${typeColors[type]} rounded-2xl hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl text-white min-w-0 flex-1`}
        title={`Watch on ${platform.name}`}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {platform.logoPath ? (
            <img
              src={platform.logoPath}
              alt={platform.name}
              className="w-8 h-8 rounded-lg object-cover bg-white/10"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg"
            style={{ display: platform.logoPath ? 'none' : 'flex' }}
          >
            {platform.logo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate">{platform.name}</div>
            <div className="text-xs opacity-80 capitalize">{type.replace('_', ' ')}</div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="card-glass p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
          <span className="text-gray-400">Loading streaming options...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-6">
        <div className="text-center text-gray-400">
          <Tv className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!streamingData) {
    return null;
  }

  const hasAnyStreaming = streamingData.subscription.length > 0 || 
                         streamingData.rent.length > 0 || 
                         streamingData.buy.length > 0 || 
                         streamingData.free.length > 0;

  if (!hasAnyStreaming) {
    return (
      <div className="card-glass p-6">
        <div className="text-center">
          <Tv className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-300 mb-2">Not Available for Streaming</h3>
          <p className="text-sm text-gray-400">
            This movie is not currently available on major streaming platforms.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Check back later or look for it in theaters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Play className="h-6 w-6 text-primary-400" />
        <h3 className="text-xl font-bold gradient-text">Watch Now</h3>
      </div>

      {/* Subscription Platforms */}
      {streamingData.subscription.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center space-x-2">
            <Tv className="h-5 w-5" />
            <span>Stream with Subscription</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {streamingData.subscription.map(platform => 
              renderPlatformButton(platform, 'subscription')
            )}
          </div>
        </div>
      )}

      {/* Free Platforms */}
      {streamingData.free.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Watch Free (with ads)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {streamingData.free.map(platform => 
              renderPlatformButton(platform, 'free')
            )}
          </div>
        </div>
      )}

      {/* Rental Platforms */}
      {streamingData.rent.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Rent</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {streamingData.rent.map(platform => 
              renderPlatformButton(platform, 'rent')
            )}
          </div>
        </div>
      )}

      {/* Purchase Platforms */}
      {streamingData.buy.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Buy</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {streamingData.buy.map(platform => 
              renderPlatformButton(platform, 'buy')
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-700/50">
        Streaming availability may vary by region. Prices and availability are subject to change.
      </div>
    </div>
  );
};

export default StreamingAvailability;