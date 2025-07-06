import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Star, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { movieApi } from '../services/movieApi';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      // Load recent searches
      loadRecentSearches();
    } else {
      // Clear search when modal closes
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim()) {
      debounceRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const loadRecentSearches = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent.slice(0, 5)); // Show last 5 searches
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = (term) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updatedRecent = [term, ...recent.filter(item => item !== term)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await movieApi.searchMovies(query, 1);
      setSearchResults(response.movies.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    saveRecentSearch(movie.title);
    onClose();
  };

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-dark-800 to-dark-900 border-b border-gray-700/50 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold gradient-text">Search Movies</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recent Searches */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-300">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(term)}
                    className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 rounded-full px-4 py-2 text-sm text-gray-300 hover:text-white transition-all duration-300"
                  >
                    <Clock className="h-4 w-4" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchTerm && (
            <div>
              <h3 className="text-lg font-bold text-gray-300 mb-4">
                {loading ? 'Searching...' : `Results for "${searchTerm}"`}
              </h3>
              
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movie/${movie.id}`}
                      onClick={() => handleMovieClick(movie)}
                      className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-16 h-24 object-cover rounded-lg shadow-lg"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors duration-300 truncate">
                          {movie.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {movie.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-semibold">{movie.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">{movie.releaseYear}</span>
                          </div>
                          <span className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full text-xs">
                            {movie.genre}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !loading && searchTerm && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No movies found</h3>
                  <p className="text-gray-500">Try searching with different keywords</p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchTerm && recentSearches.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Search for Movies</h3>
              <p className="text-gray-500">Find your favorite movies and discover new ones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;