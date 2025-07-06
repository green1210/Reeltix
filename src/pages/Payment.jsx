import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Building, Wallet, Shield, Lock, CheckCircle, AlertCircle, Clock, Star } from 'lucide-react';
import { useBooking, useAuth } from '../App';
import PaymentModal from '../components/PaymentModal';

const Payment = () => {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  useEffect(() => {
    if (!booking.movie || !booking.seats.length) {
      navigate('/');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [booking, isAuthenticated, navigate]);

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay, American Express',
      popular: true,
      offers: '5% cashback on select cards'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      popular: true,
      offers: 'Instant payment, no charges'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building,
      description: 'All major banks supported',
      popular: false,
      offers: 'Secure bank transfer'
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      icon: Wallet,
      description: 'Paytm, Amazon Pay, MobiKwik',
      popular: false,
      offers: 'Wallet cashback available'
    }
  ];

  // Promo codes
  const promoCodes = {
    'FIRST10': { discount: 10, type: 'percentage', description: 'First booking discount' },
    'SAVE50': { discount: 50, type: 'fixed', description: '₹50 off on bookings above ₹200' },
    'WEEKEND20': { discount: 20, type: 'percentage', description: 'Weekend special offer' },
    'STUDENT15': { discount: 15, type: 'percentage', description: 'Student discount' }
  };

  const calculateTotals = () => {
    const subtotal = booking.totalPrice;
    const convenienceFee = Math.round(subtotal * 0.02); // 2% convenience fee
    const taxes = Math.round((subtotal + convenienceFee) * 0.18); // 18% GST
    const discountAmount = appliedPromo ? 
      (promoCodes[appliedPromo].type === 'percentage' ? 
        Math.round(subtotal * promoCodes[appliedPromo].discount / 100) : 
        promoCodes[appliedPromo].discount) : 0;
    
    const total = subtotal + convenienceFee + taxes - discountAmount;
    
    return {
      subtotal,
      convenienceFee,
      taxes,
      discount: discountAmount,
      total: Math.max(total, 0)
    };
  };

  const handlePromoCode = () => {
    if (promoCodes[promoCode.toUpperCase()]) {
      const promo = promoCodes[promoCode.toUpperCase()];
      if (promo.type === 'fixed' && booking.totalPrice < 200 && promoCode.toUpperCase() === 'SAVE50') {
        alert('Minimum booking amount ₹200 required for this promo code');
        return;
      }
      setAppliedPromo(promoCode.toUpperCase());
      setPromoCode('');
      alert(`Promo code applied! You saved ₹${promo.type === 'percentage' ? Math.round(booking.totalPrice * promo.discount / 100) : promo.discount}`);
    } else {
      alert('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo('');
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = async (paymentData) => {
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update booking with payment details
      const totals = calculateTotals();
      updateBooking({
        paymentMethod: selectedPaymentMethod,
        paymentDetails: paymentData,
        finalAmount: totals.total,
        promoCode: appliedPromo,
        discount: totals.discount,
        paymentId: 'PAY_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        paymentStatus: 'completed',
        paymentTimestamp: new Date().toISOString()
      });
      
      navigate('/confirmation');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!booking.movie) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="relative">
          <div className="loading-spinner rounded-full h-32 w-32 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen py-8 animate-fade-in bg-gradient-to-b from-dark-950 to-dark-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="font-medium">Back to Seats</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">Secure Payment</h1>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mt-1">
                <Shield className="h-4 w-4 text-green-400" />
                <span>256-bit SSL Encrypted</span>
              </div>
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 gradient-text">Booking Summary</h2>
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                <img
                  src={booking.movie.poster}
                  alt={booking.movie.title}
                  className="w-16 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{booking.movie.title}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{booking.movie.rating}/10</span>
                    </div>
                    <div>{booking.theater.name}</div>
                    <div>{booking.date} • {booking.showtime}</div>
                    <div>Seats: {booking.seats.map(s => s.id).join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6 gradient-text">Choose Payment Method</h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            selectedPaymentMethod === method.id 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-white/10 text-gray-400'
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{method.name}</span>
                              {method.popular && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">{method.description}</div>
                            <div className="text-xs text-green-400 mt-1">{method.offers}</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-600'
                        }`}>
                          {selectedPaymentMethod === method.id && (
                            <CheckCircle className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 gradient-text">Promo Code</h2>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="font-semibold text-green-400">{appliedPromo} Applied</div>
                      <div className="text-sm text-gray-400">{promoCodes[appliedPromo].description}</div>
                    </div>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 form-input"
                  />
                  <button
                    onClick={handlePromoCode}
                    disabled={!promoCode}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {/* Available Promo Codes */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-400">Available Offers:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(promoCodes).map(([code, details]) => (
                    <button
                      key={code}
                      onClick={() => setPromoCode(code)}
                      className="text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300"
                    >
                      <div className="font-semibold text-primary-400 text-sm">{code}</div>
                      <div className="text-xs text-gray-400">{details.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-32 space-y-6">
              <h3 className="text-xl font-bold gradient-text">Price Breakdown</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tickets ({booking.seats.length})</span>
                  <span className="font-semibold">₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Convenience Fee</span>
                  <span className="font-semibold">₹{totals.convenienceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GST (18%)</span>
                  <span className="font-semibold">₹{totals.taxes}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedPromo})</span>
                    <span>-₹{totals.discount}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="gradient-text">₹{totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-3 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>100% Safe & Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-400" />
                  <span>PCI DSS Compliant</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || processing}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Pay ₹{totals.total}</span>
                  </>
                )}
              </button>

              {/* Payment Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-orange-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Complete payment in 10:00 minutes</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Session will expire automatically
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMethod={selectedPaymentMethod}
        amount={totals.total}
        onPaymentComplete={processPayment}
        processing={processing}
      />
    </div>
  );
};

export default Payment;