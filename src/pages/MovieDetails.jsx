import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, ChevronRight, ArrowLeft, Users, Shield, Wifi, Car, Film, Youtube, Play } from 'lucide-react';
import { useBooking } from '../App';
import { movieApi } from '../services/movieApi';
import { mockTheaters } from '../data/mockData';
import TrailerModal from '../components/TrailerModal';
import RatingModal from '../components/RatingModal';
import UserRatingDisplay from '../components/UserRatingDisplay';
import StreamingAvailability from '../components/StreamingAvailability';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateBooking } = useBooking();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [activeTab, setActiveTab] = useState('showtimes');
  const [showTrailer, setShowTrailer] = useState(false);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const movieDetails = await movieApi.getMovieDetails(parseInt(id));
        setMovie(movieDetails);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // FIXED: Scroll to top when component mounts (prevents starting from footer)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleBooking = () => {
    if (!selectedTheater || !selectedShowtime) {
      alert('Please select a theater and showtime');
      return;
    }

    const theater = mockTheaters.find(t => t.id === parseInt(selectedTheater));
    
    updateBooking({
      movie,
      theater,
      showtime: selectedShowtime,
      date: selectedDate,
      seats: [],
      totalPrice: 0
    });

    navigate('/seats');
  };

  const handleWatchNow = () => {
    // Navigate to booking with first available theater and showtime
    const firstTheater = mockTheaters[0];
    const firstShowtime = '7:15 PM'; // Prime time slot
    
    updateBooking({
      movie,
      theater: firstTheater,
      showtime: firstShowtime,
      date: selectedDate,
      seats: [],
      totalPrice: 0
    });

    navigate('/seats');
  };

  const handleRatingSubmit = () => {
    // Refresh any rating-related data if needed
    console.log('Rating submitted for movie:', movie.title);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="relative">
          <div className="loading-spinner rounded-full h-32 w-32 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={() => navigate(-1)} 
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="text-center">
          <div className="text-gray-400 text-xl">Movie not found</div>
          <button 
            onClick={() => navigate(-1)} 
            className="btn-primary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const showtimes = ['10:00 AM', '1:30 PM', '4:45 PM', '7:15 PM', '10:30 PM'];

  const tabs = [
    { id: 'showtimes', label: 'Showtimes', icon: Clock },
    { id: 'streaming', label: 'Streaming', icon: Play },
    { id: 'about', label: 'About', icon: Star },
    { id: 'ratings', label: 'Ratings', icon: Users },
    { id: 'theaters', label: 'Theaters', icon: MapPin },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back Button - FIXED positioning to prevent title overlap */}
      <div className="sticky top-16 sm:top-20 z-40 bg-dark-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="font-medium text-sm sm:text-base">Back to Movies</span>
          </button>
        </div>
      </div>

      {/* Movie Header - FIXED spacing and responsive layout */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-end overflow-hidden pt-8">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${movie.backdrop})`,
          }}
        />
        
        {/* Enhanced overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/70 to-dark-950/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-end">
            {/* Movie Poster - FIXED responsive sizing */}
            <div className="relative animate-slide-up order-2 lg:order-1">
              <div className="relative max-w-xs sm:max-w-sm mx-auto lg:mx-0">
                {/* Fixed aspect ratio container with proper responsive sizing */}
                <div className="aspect-[2/3] w-full relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-accent-500/30 rounded-2xl sm:rounded-3xl blur-2xl opacity-60 animate-pulse -z-10"></div>
              </div>
            </div>

            {/* Movie Info - FIXED responsive text and spacing */}
            <div className="space-y-4 sm:space-y-6 animate-slide-right order-1 lg:order-2">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
                    {movie.genre}
                  </span>
                  <span className="text-gray-400 text-sm sm:text-base">{movie.releaseYear}</span>
                </div>
                
                {/* FIXED title sizing and line height for better mobile display */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight break-words">
                  <span className="gradient-text">{movie.title}</span>
                </h1>
                
                <p className="text-sm sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl">
                  {movie.description}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 sm:px-6 sm:py-3">
                  <Star className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 fill-current" />
                  <span className="text-lg sm:text-xl font-bold">{movie.rating}</span>
                  <span className="text-gray-400 text-sm">/10</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 sm:px-6 sm:py-3">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">{movie.duration}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 sm:px-6 sm:py-3">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">All Ages</span>
                </div>
              </div>

              {/* Action Buttons - FIXED responsive layout */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleWatchNow}
                  className="btn-primary flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
                >
                  <Play className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
                  <span>Book Tickets Now</span>
                </button>
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-secondary flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
                >
                  <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                  <span>Watch Trailer</span>
                </button>
                <button
                  onClick={() => setShowRating(true)}
                  className="btn-ghost flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
                >
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
                  <span>Rate Movie</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section - FIXED responsive design */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 sm:p-8 lg:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 gradient-text text-center">Book Your Experience</h2>
            
            {/* Tabs - FIXED responsive scrolling */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10 overflow-x-auto">
                <div className="flex space-x-2 min-w-max">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'streaming' && (
              <div className="animate-fade-in">
                <StreamingAvailability movieId={movie.id} movieTitle={movie.title} />
              </div>
            )}

            {activeTab === 'showtimes' && (
              <div className="space-y-8 sm:space-y-12 animate-fade-in">
                {/* Date Selection - FIXED responsive grid */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
                    <span>Select Date</span>
                  </h3>
                  <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {dates.map((date) => {
                      const dateString = date.toISOString().split('T')[0];
                      const isSelected = selectedDate === dateString;
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNumber = date.getDate();
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      
                      return (
                        <button
                          key={dateString}
                          onClick={() => setSelectedDate(dateString)}
                          className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
                            isSelected
                              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-500/30'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-md border border-white/10'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-medium opacity-80">{dayName}</div>
                          <div className="text-lg sm:text-2xl font-bold">{dayNumber}</div>
                          <div className="text-xs opacity-60">{monthName}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theater Selection - FIXED responsive layout */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
                    <span>Select Theater</span>
                  </h3>
                  <div className="grid gap-4">
                    {mockTheaters.map((theater) => (
                      <button
                        key={theater.id}
                        onClick={() => setSelectedTheater(theater.id.toString())}
                        className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedTheater === theater.id.toString()
                            ? 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-500 shadow-2xl shadow-primary-500/20'
                            : 'bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="font-bold text-base sm:text-lg truncate">{theater.name}</div>
                            <div className="text-gray-400 flex items-center space-x-2 text-sm">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{theater.location}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                              <span className="flex items-center space-x-1">
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                <span className="text-green-400">Safe & Clean</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                <span className="text-blue-400">Free WiFi</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Car className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                                <span className="text-purple-400">Parking</span>
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 flex-shrink-0 ml-4 ${
                            selectedTheater === theater.id.toString() ? 'rotate-90 text-primary-400' : 'text-gray-400'
                          }`} />
                        </div>
                        
                        {selectedTheater === theater.id.toString() && (
                          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 animate-slide-down">
                            <div className="flex flex-wrap gap-2">
                              {theater.amenities.map((amenity) => (
                                <span
                                  key={amenity}
                                  className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-300 text-xs px-2 sm:px-3 py-1 rounded-full border border-primary-500/30"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Showtime Selection - FIXED responsive grid */}
                {selectedTheater && (
                  <div className="animate-slide-up">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
                      <span>Select Showtime</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                      {showtimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedShowtime(time)}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 ${
                            selectedShowtime === time
                              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-500/30'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-md border border-white/10'
                          }`}
                        >
                          <div className="text-sm sm:text-lg">{time}</div>
                          <div className="text-xs opacity-60 mt-1">Available</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue Button - FIXED responsive sizing */}
                <div className="text-center pt-6 sm:pt-8">
                  <button
                    onClick={handleBooking}
                    disabled={!selectedTheater || !selectedShowtime}
                    className="btn-primary text-lg sm:text-xl py-3 sm:py-4 px-8 sm:px-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Continue to Seat Selection →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="animate-fade-in space-y-6 sm:space-y-8">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-bold gradient-text">Movie Details</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Genre</span>
                        <span className="font-semibold">{movie.genre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="font-semibold">{movie.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Release Year</span>
                        <span className="font-semibold">{movie.releaseYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">IMDb Rating</span>
                        <span className="font-semibold flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{movie.rating}/10</span>
                        </span>
                      </div>
                      {movie.tagline && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tagline</span>
                          <span className="font-semibold italic">"{movie.tagline}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-bold gradient-text">Synopsis</h3>
                    <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                    {movie.genres && movie.genres.length > 1 && (
                      <div>
                        <h4 className="text-lg font-bold mb-2">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {movie.genres.map((genre) => (
                            <span
                              key={genre}
                              className="bg-primary-500/20 text-primary-300 text-sm px-3 py-1 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ratings' && (
              <div className="animate-fade-in">
                <UserRatingDisplay movieId={movie.id} imdbRating={movie.rating} />
                <div className="text-center mt-6 sm:mt-8">
                  <button
                    onClick={() => setShowRating(true)}
                    className="btn-primary"
                  >
                    Rate This Movie
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'theaters' && (
              <div className="animate-fade-in">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  {mockTheaters.map((theater) => (
                    <div key={theater.id} className="card-glass p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{theater.name}</h3>
                      <p className="text-gray-400 mb-4 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{theater.location}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {theater.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="bg-primary-500/20 text-primary-300 text-xs px-3 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-400">
                        {theater.screens} Screens Available
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default MovieDetails;