import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, Calendar, Users, Shield, Wifi, Car, Coffee } from 'lucide-react';
import { useBooking } from '../App';
import { mockTheaters } from '../data/mockData';
import { movieApi } from '../services/movieApi';

const TheaterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateBooking } = useBooking();
  const [theater, setTheater] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get theater details
        const theaterData = mockTheaters.find(t => t.id === parseInt(id));
        if (!theaterData) {
          navigate('/theaters');
          return;
        }
        setTheater(theaterData);

        // Get popular movies for this theater
        const moviesResponse = await movieApi.getPopular(1);
        setMovies(moviesResponse.movies.slice(0, 6));
      } catch (error) {
        console.error('Error fetching theater data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleBooking = () => {
    if (!selectedMovie || !selectedShowtime) {
      alert('Please select a movie and showtime');
      return;
    }

    const movie = movies.find(m => m.id === parseInt(selectedMovie));
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="relative">
          <div className="loading-spinner rounded-full h-32 w-32 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!theater) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="text-center">
          <div className="text-gray-400 text-xl">Theater not found</div>
          <button 
            onClick={() => navigate('/theaters')} 
            className="btn-primary mt-4"
          >
            Back to Theaters
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

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
        return <Wifi className="h-5 w-5 text-blue-400" />;
      case 'parking':
        return <Car className="h-5 w-5 text-purple-400" />;
      case 'food court':
        return <Coffee className="h-5 w-5 text-orange-400" />;
      default:
        return <Star className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      {/* Back Button */}
      <div className="sticky top-20 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/theaters')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium">Back to Theaters</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Theater Header */}
        <div className="card p-8 mb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-4">{theater.name}</h1>
                <div className="flex items-center space-x-2 text-gray-400 mb-6">
                  <MapPin className="h-6 w-6" />
                  <span className="text-xl">{theater.location}</span>
                </div>
                
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary-400" />
                    <span className="text-gray-300">{theater.screens} Screens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-green-400">Safe & Clean</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-400">Open 24/7</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary-400">Premium Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {theater.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-4 border border-primary-500/20"
                    >
                      {getAmenityIcon(amenity)}
                      <span className="font-medium text-primary-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating & Info */}
            <div className="space-y-6">
              <div className="card-glass p-6 text-center">
                <div className="text-5xl font-bold gradient-text mb-2">4.8</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-gray-400">Based on 2,847 reviews</div>
              </div>

              <div className="card-glass p-6">
                <h4 className="font-bold mb-4 text-primary-400">Contact Info</h4>
                <div className="text-gray-300 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <span>info@theater.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🕒</span>
                    <span>9:00 AM - 12:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="card p-8">
          <h2 className="text-3xl font-bold gradient-text text-center mb-8">Book Your Show</h2>
          
          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary-400" />
              <span>Select Date</span>
            </h3>
            <div className="grid grid-cols-7 gap-3">
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
                    className={`p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-md border border-white/10'
                    }`}
                  >
                    <div className="text-sm font-medium opacity-80">{dayName}</div>
                    <div className="text-2xl font-bold">{dayNumber}</div>
                    <div className="text-xs opacity-60">{monthName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Movie Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary-400" />
              <span>Select Movie</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movies.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie.id.toString())}
                  className={`p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedMovie === movie.id.toString()
                      ? 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-500 shadow-2xl shadow-primary-500/20'
                      : 'bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1 line-clamp-1">{movie.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{movie.rating}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                      </div>
                      <span className="inline-block bg-primary-500/20 text-primary-300 text-xs px-2 py-1 rounded-full">
                        {movie.genre}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Showtime Selection */}
          {selectedMovie && (
            <div className="mb-8 animate-slide-up">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary-400" />
                <span>Select Showtime</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {showtimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedShowtime(time)}
                    className={`p-4 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 ${
                      selectedShowtime === time
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-md border border-white/10'
                    }`}
                  >
                    <div className="text-lg">{time}</div>
                    <div className="text-xs opacity-60 mt-1">Available</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleBooking}
              disabled={!selectedMovie || !selectedShowtime}
              className="btn-primary text-xl py-4 px-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue to Seat Selection →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterDetails;