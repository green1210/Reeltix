import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CreditCard, Clock, MapPin, Star, Shield } from 'lucide-react';
import { useBooking } from '../App';

const SeatSelection = () => {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);

  useEffect(() => {
    if (!booking.movie || !booking.theater) {
      navigate('/');
      return;
    }

    // Generate seat map with different pricing tiers
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 14;
    const occupiedSeats = ['A5', 'A6', 'B8', 'C2', 'C3', 'D10', 'E7', 'F12', 'F13', 'G5', 'H9'];
    
    const seats = rows.map(row => {
      return Array.from({ length: seatsPerRow }, (_, index) => {
        const seatNumber = index + 1;
        const seatId = `${row}${seatNumber}`;
        
        // Pricing tiers based on row
        let price = 150; // Back rows
        let tier = 'Economy';
        
        if (row >= 'G') {
          price = 200;
          tier = 'Standard';
        }
        if (row >= 'D' && row <= 'F') {
          price = 300;
          tier = 'Premium';
        }
        if (row <= 'C') {
          price = 400;
          tier = 'VIP';
        }
        
        return {
          id: seatId,
          row,
          number: seatNumber,
          isOccupied: occupiedSeats.includes(seatId),
          isSelected: false,
          price,
          tier
        };
      });
    });

    setSeatMap(seats);
  }, [booking, navigate]);

  const handleSeatClick = (seatId) => {
    const seat = seatMap.flat().find(s => s.id === seatId);
    if (seat.isOccupied) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        if (prev.length >= 8) {
          alert('Maximum 8 seats can be selected');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seatMap.flat().find(s => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const getSeatDetails = () => {
    return selectedSeats.map(seatId => {
      const seat = seatMap.flat().find(s => s.id === seatId);
      return {
        id: seatId,
        price: seat.price,
        tier: seat.tier
      };
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    const seats = selectedSeats.map(seatId => {
      const seat = seatMap.flat().find(s => s.id === seatId);
      return {
        id: seatId,
        price: seat.price,
        tier: seat.tier
      };
    });

    updateBooking({
      seats,
      totalPrice: getTotalPrice()
    });

    navigate('/payment');
  };

  if (!booking.movie) {
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

  const seatTiers = [
    { name: 'VIP', color: 'bg-gradient-to-r from-accent-500 to-yellow-500', price: '₹400', rows: 'A-C' },
    { name: 'Premium', color: 'bg-gradient-to-r from-primary-500 to-secondary-500', price: '₹300', rows: 'D-F' },
    { name: 'Standard', color: 'bg-gradient-to-r from-green-500 to-blue-500', price: '₹200', rows: 'G-I' },
    { name: 'Economy', color: 'bg-gradient-to-r from-gray-500 to-gray-600', price: '₹150', rows: 'J' },
  ];

  return (
    <div className="min-h-screen py-8 animate-fade-in bg-gradient-to-b from-dark-950 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card mb-8 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">{booking.movie.title}</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.theater.name}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{booking.date} • {booking.showtime}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{booking.movie.rating}</span>
                </span>
              </div>
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="grid xl:grid-cols-4 gap-8">
          {/* Seat Map */}
          <div className="xl:col-span-3">
            <div className="card p-8">
              {/* Screen */}
              <div className="text-center mb-12">
                <div className="relative">
                  <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 h-3 rounded-full mb-4 shadow-lg shadow-primary-500/30"></div>
                  <div className="bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 h-1 rounded-full mb-2"></div>
                </div>
                <p className="text-lg font-bold gradient-text">IMAX SCREEN</p>
                <p className="text-sm text-gray-400">Best view from center seats</p>
              </div>

              {/* Seat Tier Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {seatTiers.map((tier) => (
                  <div key={tier.name} className="card-glass p-4 text-center">
                    <div className={`w-6 h-6 ${tier.color} rounded-t-lg mx-auto mb-2`}></div>
                    <div className="text-sm font-bold">{tier.name}</div>
                    <div className="text-xs text-gray-400">{tier.price}</div>
                    <div className="text-xs text-gray-500">Rows {tier.rows}</div>
                  </div>
                ))}
              </div>

              {/* Seat Map */}
              <div className="space-y-3 max-w-4xl mx-auto">
                {seatMap.map((row, rowIndex) => {
                  const rowLetter = row[0]?.row;
                  let seatClass = 'bg-gray-600 hover:bg-gray-500';
                  
                  if (rowLetter <= 'C') {
                    seatClass = 'bg-gradient-to-r from-accent-500 to-yellow-500 hover:from-accent-600 hover:to-yellow-600';
                  } else if (rowLetter <= 'F') {
                    seatClass = 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600';
                  } else if (rowLetter <= 'I') {
                    seatClass = 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600';
                  }

                  return (
                    <div key={rowIndex} className="flex items-center justify-center space-x-2">
                      <span className="text-lg font-bold text-gray-400 w-8 text-center">
                        {rowLetter}
                      </span>
                      
                      <div className="flex space-x-1">
                        {row.slice(0, 7).map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id)}
                            disabled={seat.isOccupied}
                            className={`w-8 h-8 rounded-t-lg text-xs font-bold transition-all duration-300 relative ${
                              seat.isOccupied
                                ? 'bg-red-500 cursor-not-allowed opacity-60'
                                : selectedSeats.includes(seat.id)
                                ? 'bg-white text-gray-900 shadow-lg transform scale-110 z-10'
                                : seatClass + ' text-white transform hover:scale-105'
                            }`}
                          >
                            {seat.number}
                            {selectedSeats.includes(seat.id) && (
                              <div className="absolute -inset-1 bg-white/30 rounded-t-lg animate-pulse"></div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Aisle gap */}
                      <div className="w-6"></div>

                      <div className="flex space-x-1">
                        {row.slice(7).map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id)}
                            disabled={seat.isOccupied}
                            className={`w-8 h-8 rounded-t-lg text-xs font-bold transition-all duration-300 relative ${
                              seat.isOccupied
                                ? 'bg-red-500 cursor-not-allowed opacity-60'
                                : selectedSeats.includes(seat.id)
                                ? 'bg-white text-gray-900 shadow-lg transform scale-110 z-10'
                                : seatClass + ' text-white transform hover:scale-105'
                            }`}
                          >
                            {seat.number}
                            {selectedSeats.includes(seat.id) && (
                              <div className="absolute -inset-1 bg-white/30 rounded-t-lg animate-pulse"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-8 mt-12 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-600 rounded-t-lg"></div>
                  <span className="text-gray-400">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-t-lg"></div>
                  <span className="text-gray-400">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 rounded-t-lg"></div>
                  <span className="text-gray-400">Occupied</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="xl:col-span-1">
            <div className="card p-6 sticky top-32 space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold gradient-text mb-2">Booking Summary</h3>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Secure & Safe</span>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="card-glass p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Movie</span>
                    <span className="font-semibold text-right max-w-32 truncate">{booking.movie.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Theater</span>
                    <span className="font-semibold text-right max-w-32 truncate">{booking.theater.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time</span>
                    <span className="font-semibold text-right">{booking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Show</span>
                    <span className="font-semibold">{booking.showtime}</span>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="card-glass p-4">
                    <h4 className="font-semibold mb-3 text-primary-400">Selected Seats</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getSeatDetails().map((seat, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="font-medium">{seat.id}</span>
                          <div className="text-right">
                            <div className="font-semibold">₹{seat.price}</div>
                            <div className="text-gray-400">{seat.tier}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedSeats.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="gradient-text">₹{getTotalPrice()}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Excluding convenience fee & taxes
                  </div>
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Payment ({selectedSeats.length})</span>
              </button>

              {selectedSeats.length === 0 && (
                <p className="text-center text-gray-400 text-sm">
                  Select seats to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;