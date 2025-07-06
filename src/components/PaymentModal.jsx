import { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building, Wallet, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, paymentMethod, amount, onPaymentComplete, processing }) => {
  const [formData, setFormData] = useState({});
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setErrors({});
    }
  }, [isOpen, paymentMethod]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        newErrors.cardNumber = 'Valid card number required';
      }
      if (!formData.expiryMonth || !formData.expiryYear) {
        newErrors.expiry = 'Expiry date required';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Valid CVV required';
      }
      if (!formData.cardholderName) {
        newErrors.cardholderName = 'Cardholder name required';
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId || !formData.upiId.includes('@')) {
        newErrors.upiId = 'Valid UPI ID required';
      }
    } else if (paymentMethod === 'netbanking') {
      if (!formData.bank) {
        newErrors.bank = 'Please select a bank';
      }
    } else if (paymentMethod === 'wallet') {
      if (!formData.walletType) {
        newErrors.walletType = 'Please select a wallet';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onPaymentComplete(formData);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'card': return CreditCard;
      case 'upi': return Smartphone;
      case 'netbanking': return Building;
      case 'wallet': return Wallet;
      default: return CreditCard;
    }
  };

  const getPaymentMethodTitle = () => {
    switch (paymentMethod) {
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI Payment';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Digital Wallet';
      default: return 'Payment';
    }
  };

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank',
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IDBI Bank'
  ];

  const wallets = [
    'Paytm', 'Amazon Pay', 'MobiKwik', 'Freecharge', 'Ola Money', 'JioMoney'
  ];

  if (!isOpen) return null;

  const Icon = getPaymentMethodIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-xl">
              <Icon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">{getPaymentMethodTitle()}</h2>
              <p className="text-sm text-gray-400">Amount: ₹{amount}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="form-label">Card Number</label>
                  <div className="relative">
                    <input
                      type={showCardNumber ? 'text' : 'password'}
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber || ''}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      className={`form-input pr-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                      maxLength={19}
                      disabled={processing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Expiry Month</label>
                    <select
                      value={formData.expiryMonth || ''}
                      onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                      className={`form-input ${errors.expiry ? 'border-red-500' : ''}`}
                      disabled={processing}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Expiry Year</label>
                    <select
                      value={formData.expiryYear || ''}
                      onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                      className={`form-input ${errors.expiry ? 'border-red-500' : ''}`}
                      disabled={processing}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {errors.expiry && <p className="text-red-400 text-xs mt-1 col-span-2">{errors.expiry}</p>}
                </div>

                <div>
                  <label className="form-label">CVV</label>
                  <div className="relative">
                    <input
                      type={showCVV ? 'text' : 'password'}
                      placeholder="123"
                      value={formData.cvv || ''}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      className={`form-input pr-10 ${errors.cvv ? 'border-red-500' : ''}`}
                      maxLength={4}
                      disabled={processing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCVV(!showCVV)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                </div>

                <div>
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.cardholderName || ''}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className={`form-input ${errors.cardholderName ? 'border-red-500' : ''}`}
                    disabled={processing}
                  />
                  {errors.cardholderName && <p className="text-red-400 text-xs mt-1">{errors.cardholderName}</p>}
                </div>
              </>
            )}

            {/* UPI Payment Form */}
            {paymentMethod === 'upi' && (
              <div>
                <label className="form-label">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@paytm"
                  value={formData.upiId || ''}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  className={`form-input ${errors.upiId ? 'border-red-500' : ''}`}
                  disabled={processing}
                />
                {errors.upiId && <p className="text-red-400 text-xs mt-1">{errors.upiId}</p>}
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-sm">You will receive a payment request on your UPI app</p>
                </div>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'netbanking' && (
              <div>
                <label className="form-label">Select Bank</label>
                <select
                  value={formData.bank || ''}
                  onChange={(e) => handleInputChange('bank', e.target.value)}
                  className={`form-input ${errors.bank ? 'border-red-500' : ''}`}
                  disabled={processing}
                >
                  <option value="">Choose your bank</option>
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                {errors.bank && <p className="text-red-400 text-xs mt-1">{errors.bank}</p>}
              </div>
            )}

            {/* Wallet Payment Form */}
            {paymentMethod === 'wallet' && (
              <div>
                <label className="form-label">Select Wallet</label>
                <div className="grid grid-cols-2 gap-3">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet}
                      type="button"
                      onClick={() => handleInputChange('walletType', wallet)}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        formData.walletType === wallet
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700 bg-white/5 hover:bg-white/10'
                      }`}
                      disabled={processing}
                    >
                      <div className="text-sm font-medium">{wallet}</div>
                    </button>
                  ))}
                </div>
                {errors.walletType && <p className="text-red-400 text-xs mt-1">{errors.walletType}</p>}
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Shield className="h-4 w-4 text-green-400" />
              <p className="text-green-400 text-xs">Your payment information is encrypted and secure</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Pay ₹{amount}</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;