import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Calendar, Grid, List } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { movieApi } from '../services/movieApi';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [isSearching, setIsSearching] = useState(false);

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: 'action', name: 'Action' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'horror', name: 'Horror' },
    { id: 'romance', name: 'Romance' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'thriller', name: 'Thriller' },
  ];

  useEffect(() => {
    fetchMovies();
  }, [currentPage, sortBy]);

  useEffect(() => {
    // Reset to page 1 when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchMovies();
    }
  }, [searchTerm]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (searchTerm.trim()) {
        setIsSearching(true);
        response = await movieApi.searchMovies(searchTerm, currentPage);
      } else {
        setIsSearching(false);
        switch (sortBy) {
          case 'rating':
            response = await movieApi.getTopRated(currentPage);
            break;
          case 'release_date':
            response = await movieApi.getUpcoming(currentPage);
            break;
          default:
            response = await movieApi.getPopular(currentPage);
        }
      }
      
      setMovies(response.movies);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredMovies = movies.filter(movie => {
    if (selectedGenre === 'all') return true;
    return movie.genre.toLowerCase().includes(selectedGenre);
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner size="xl" message="Loading movies..." variant="film" fullScreen />;
  }

  return (
    <div className="min-h-screen mobile-section animate-fade-in">
      <div className="mobile-container">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">All Movies</h1>
          <p className="text-base sm:text-lg text-gray-300">Discover your next favorite movie</p>
        </div>

        {/* Search and Filters */}
        <div className="card mobile-card mb-6 sm:mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 pr-16"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-xs"
              >
                Search
              </button>
            </form>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Genre Filter */}
              <div className="relative">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="form-input pl-10 appearance-none"
                >
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id} className="bg-dark-800">
                      {genre.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input pl-10 appearance-none"
                  disabled={isSearching}
                >
                  <option value="popularity" className="bg-dark-800">Most Popular</option>
                  <option value="rating" className="bg-dark-800">Highest Rated</option>
                  <option value="release_date" className="bg-dark-800">Latest Release</option>
                </select>
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-white/5 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">List</span>
                </button>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-center text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2">
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>{filteredMovies.length} movies found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {isSearching && searchTerm && (
          <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
            <p className="text-primary-300 text-sm">
              Showing results for "<span className="font-semibold">{searchTerm}</span>"
              {filteredMovies.length === 0 && ' - No movies found'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state mb-6">
            <p>{error}</p>
            <button 
              onClick={fetchMovies} 
              className="btn-primary mt-3"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Movies Grid/List */}
        {!error && (
          <>
            {filteredMovies.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "mobile-grid gap-4 sm:gap-6" 
                  : "space-y-4"
              }>
                {filteredMovies.map((movie, index) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    index={index} 
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>
            ) : !loading && (
              <div className="text-center py-16">
                <div className="text-gray-400 text-lg mb-3">No movies found</div>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                {(searchTerm || selectedGenre !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedGenre('all');
                      setCurrentPage(1);
                    }}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Loading More */}
            {loading && currentPage > 1 && (
              <div className="text-center py-6">
                <LoadingSpinner size="default" message="Loading more movies..." />
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredMovies.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-sm ${
                            currentPage === pageNum
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Movies;