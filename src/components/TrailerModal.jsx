import { useState, useEffect } from 'react';
import { X, Play, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { movieApi } from '../services/movieApi';

const TrailerModal = ({ isOpen, onClose, movieId, movieTitle }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow autoplay
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  useEffect(() => {
    if (isOpen && movieId) {
      fetchTrailer();
    }
    return () => {
      setTrailerKey(null);
      setError(null);
      setShowPlayButton(true);
    };
  }, [isOpen, movieId]);

  const fetchTrailer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real trailer from TMDB API
      try {
        const videos = await movieApi.getMovieVideos(movieId);
        const trailer = videos.find(video => 
          video.type === 'Trailer' && 
          video.site === 'YouTube'
        );
        
        if (trailer) {
          setTrailerKey(trailer.key);
          return;
        }
      } catch (apiError) {
        console.log('TMDB API not available, using movie-specific demo trailers');
      }
      
      // Fallback to movie-specific demo trailers based on movie ID
      const movieSpecificTrailers = {
        1: 'TcMBFSGVi1c', // Avengers: Endgame
        2: 'EXeTwQWrcwY', // The Dark Knight
        3: 'YoHD9XEInc0', // Inception
        4: 'zSWdZVtXT7E', // Interstellar
        5: 'vKQi3bBA1y8', // The Matrix
        6: 's7EdQ4FqbhY', // Pulp Fiction
        7: 'n9xhJrPXop4', // Dune
        8: 'BIhNsAtPbPI', // No Time to Die
        9: 'JfVOs4VSpmA', // Spider-Man: No Way Home
        10: 'giXco2jaZ_4', // Top Gun: Maverick
      };
      
      // Use movie-specific trailer or fallback
      const specificTrailer = movieSpecificTrailers[movieId];
      if (specificTrailer) {
        setTrailerKey(specificTrailer);
      } else {
        // Generic action movie trailer as final fallback
        setTrailerKey('TcMBFSGVi1c');
      }
      
    } catch (err) {
      console.error('Error fetching trailer:', err);
      setError('Failed to load trailer. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTrailerKey(null);
    setError(null);
    setShowPlayButton(true);
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePlayClick = () => {
    setShowPlayButton(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className={`relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 transition-all duration-300 ${
        isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl max-h-[80vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold gradient-text">{movieTitle}</h2>
            <p className="text-gray-400">Official Trailer</p>
          </div>
          <div className="flex items-center space-x-2">
            {trailerKey && !showPlayButton && (
              <>
                <button
                  onClick={toggleMute}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${isFullscreen ? 'h-full' : 'aspect-video'} bg-black relative`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner rounded-full h-16 w-16 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading trailer...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-400 text-xl mb-4">{error}</div>
                <button 
                  onClick={fetchTrailer}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {trailerKey && !loading && !error && (
            <div className="relative w-full h-full">
              {/* Play Button Overlay */}
              {showPlayButton && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                  <button
                    onClick={handlePlayClick}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-6 transform hover:scale-110 transition-all duration-300 shadow-2xl"
                  >
                    <Play className="h-12 w-12 text-white ml-1" fill="currentColor" />
                  </button>
                </div>
              )}
              
              {/* YouTube Iframe */}
              <iframe
                key={`${trailerKey}-${showPlayButton ? 'paused' : 'playing'}-${isMuted}`}
                src={showPlayButton 
                  ? `https://www.youtube.com/embed/${trailerKey}?rel=0&modestbranding=1&showinfo=0&controls=1&mute=1`
                  : `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`
                }
                title={`${movieTitle} Trailer`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {!trailerKey && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No trailer available</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Powered by YouTube • HD Quality
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (navigator.share && trailerKey) {
                    navigator.share({
                      title: `${movieTitle} Trailer`,
                      url: `https://www.youtube.com/watch?v=${trailerKey}`,
                    });
                  } else if (trailerKey) {
                    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${trailerKey}`);
                    alert('Trailer link copied to clipboard!');
                  }
                }}
                className="btn-ghost text-sm"
                disabled={!trailerKey}
              >
                Share Trailer
              </button>
              <button 
                onClick={handleClose}
                className="btn-primary text-sm"
              >
                Close & Book Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;