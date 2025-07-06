import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Calendar, MapPin, Clock, Users, Star, Share2, Mail, CreditCard, Receipt } from 'lucide-react';
import { useBooking } from '../App';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [bookingId, setBookingId] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!booking.movie || !booking.seats.length || !booking.paymentId) {
      navigate('/');
      return;
    }

    // Generate random booking ID
    setBookingId('CND' + Math.random().toString(36).substr(2, 9).toUpperCase());
    
    // Show confetti effect
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [booking, navigate]);

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    alert('Ticket download feature would be implemented here');
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `Movie Ticket - ${booking.movie.title}`,
        text: `I'm watching ${booking.movie.title} at ${booking.theater.name}!`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  const handleEmailTicket = () => {
    const subject = `Movie Ticket Confirmation - ${booking.movie.title}`;
    const body = `Your booking is confirmed!\n\nBooking ID: ${bookingId}\nMovie: ${booking.movie.title}\nTheater: ${booking.theater.name}\nDate: ${booking.date}\nTime: ${booking.showtime}\nSeats: ${booking.seats.map(s => s.id).join(', ')}\nTotal: ₹${booking.finalAmount || booking.totalPrice}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleNewBooking = () => {
    navigate('/');
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Digital Wallet';
      default: return 'Payment';
    }
  };

  if (!booking.movie) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="relative">
          <div className="loading-spinner rounded-full h-32 w-32 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 animate-fade-in bg-gradient-to-b from-dark-950 to-dark-900 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-12 animate-scale-in">
          <div className="relative inline-block">
            <CheckCircle className="h-24 w-24 text-green-400 mx-auto mb-6 animate-bounce-in" />
            <div className="absolute inset-0 h-24 w-24 rounded-full bg-green-400/20 animate-ping"></div>
          </div>
          <h1 className="text-5xl font-bold mb-4 gradient-text">Payment Successful!</h1>
          <p className="text-xl text-gray-300">Your premium cinema experience awaits</p>
          <div className="mt-4 inline-block bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full px-6 py-2 border border-primary-500/30">
            <span className="text-primary-300 font-semibold">Booking ID: {bookingId}</span>
          </div>
        </div>

        {/* Ticket */}
        <div className="relative animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">{booking.movie.title}</h2>
                  <p className="text-primary-100 font-medium">Premium Cinema Experience</p>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-300 fill-current" />
                    <span className="font-semibold">{booking.movie.rating}/10</span>
                  </div>
                </div>
                <img
                  src={booking.movie.poster}
                  alt={booking.movie.title}
                  className="w-20 h-30 object-cover rounded-xl shadow-xl border-2 border-white/20"
                />
              </div>
            </div>

            {/* Details */}
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="card-glass p-6 space-y-4">
                    <h3 className="text-xl font-bold gradient-text mb-4">Show Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-400">Theater</p>
                          <p className="font-semibold">{booking.theater.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-semibold">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-400">Show Time</p>
                          <p className="font-semibold">{booking.showtime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-glass p-6">
                    <h3 className="text-xl font-bold gradient-text mb-4">Seat Information</h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="h-5 w-5 text-primary-400" />
                      <div>
                        <p className="text-sm text-gray-400">Selected Seats</p>
                        <p className="font-semibold text-lg">{booking.seats.map(s => s.id).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.seats.map((seat, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm border border-primary-500/30"
                        >
                          {seat.id} ({seat.tier || 'Standard'})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card-glass p-6">
                    <h3 className="text-xl font-bold gradient-text mb-4">Payment Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Payment Method</span>
                        <span className="font-semibold">{getPaymentMethodName(booking.paymentMethod)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Payment ID</span>
                        <span className="font-semibold text-sm">{booking.paymentId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status</span>
                        <span className="text-green-400 font-semibold flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed</span>
                        </span>
                      </div>
                      {booking.promoCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Promo Code</span>
                          <span className="text-green-400 font-semibold">{booking.promoCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-glass p-6">
                    <h3 className="text-xl font-bold gradient-text mb-4">Amount Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Tickets</span>
                        <span>₹{booking.totalPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Convenience Fee</span>
                        <span>₹{Math.round(booking.totalPrice * 0.02)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">GST (18%)</span>
                        <span>₹{Math.round((booking.totalPrice + Math.round(booking.totalPrice * 0.02)) * 0.18)}</span>
                      </div>
                      {booking.discount > 0 && (
                        <div className="flex justify-between items-center text-green-400">
                          <span>Discount</span>
                          <span>-₹{booking.discount}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-600 pt-3 mt-3">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total Paid</span>
                          <span className="gradient-text">₹{booking.finalAmount || booking.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="card-glass p-6 text-center">
                    <h3 className="text-lg font-bold mb-4">Entry Pass</h3>
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 mx-auto rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-600">
                      <div className="text-xs text-gray-400 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-lg mb-2 mx-auto"></div>
                        QR CODE
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Show this at the theater entrance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-8 bg-gradient-to-r from-dark-800/50 to-dark-900/50 border-t border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={handleDownloadTicket}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleShareTicket}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleEmailTicket}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </button>
                <button
                  onClick={handleNewBooking}
                  className="btn-ghost flex items-center justify-center space-x-2"
                >
                  <span>Book Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center animate-fade-in">
          <div className="card-glass p-6">
            <Clock className="h-8 w-8 text-primary-400 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Arrive Early</h3>
            <p className="text-sm text-gray-400">Please arrive 30 minutes before showtime for a smooth entry.</p>
          </div>
          <div className="card-glass p-6">
            <Users className="h-8 w-8 text-secondary-400 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Valid ID Required</h3>
            <p className="text-sm text-gray-400">Carry a government-issued photo ID for verification.</p>
          </div>
          <div className="card-glass p-6">
            <Star className="h-8 w-8 text-accent-400 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Premium Experience</h3>
            <p className="text-sm text-gray-400">Enjoy premium seating, Dolby Atmos sound, and 4K projection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;