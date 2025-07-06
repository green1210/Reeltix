import { Link } from 'react-router-dom';
import { Film, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribeStatus('subscribing');
    
    // Simulate API call
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }, 1000);
  };

  const movieLinks = [
    { name: 'Now Playing', path: '/movies' },
    { name: 'Coming Soon', path: '/movies' },
    { name: 'Top Rated', path: '/movies' },
    { name: 'Popular Movies', path: '/movies' },
  ];

  const theaterLinks = [
    { name: 'Find Theaters', path: '/theaters' },
    { name: 'IMAX Theaters', path: '/theaters' },
    { name: 'Premium Screens', path: '/theaters' },
    { name: 'Theater Amenities', path: '/theaters' },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '#' },
    { name: 'Contact Us', path: '#' },
    { name: 'Booking Guide', path: '#' },
    { name: 'Refund Policy', path: '#' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '#' },
    { name: 'Careers', path: '#' },
    { name: 'Press', path: '#' },
    { name: 'Partnerships', path: '#' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'hover:text-sky-400' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'hover:text-pink-400' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com', color: 'hover:text-red-400' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
    { name: 'Cookie Policy', path: '#' },
    { name: 'Accessibility', path: '#' },
  ];

  return (
    <footer className="bg-gradient-to-b from-dark-900 to-dark-950 border-t border-gray-800/50 mt-auto">
      <div className="mobile-container py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Film className="h-8 w-8 text-primary-400 group-hover:text-primary-300 transition-colors duration-300" />
                <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary-500/20 group-hover:bg-primary-500/30 animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">ReelTiK</span>
                <div className="text-sm text-gray-400">Premium Experience</div>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Experience the magic of cinema with premium theaters, cutting-edge technology, and unparalleled comfort. Your gateway to extraordinary movie experiences.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-sm">www.reeltik.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span className="text-sm">Hydrabad, Chennai, Mumbai, Delhi, Bangalore & More</span>
              </div>
            </div>
          </div>

          {/* Movies Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold gradient-text">Movies</h3>
            <ul className="space-y-2">
              {movieLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Theaters Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold gradient-text">Theaters</h3>
            <ul className="space-y-2">
              {theaterLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold gradient-text">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company Links - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2"></div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold gradient-text">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold gradient-text">Stay Updated</h3>
            <p className="text-gray-400 text-sm">
              Get the latest movie releases, exclusive offers, and theater updates.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm"
                  required
                  disabled={subscribeStatus === 'subscribing'}
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === 'subscribing' || !email}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                >
                  {subscribeStatus === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              
              {subscribeStatus === 'success' && (
                <div className="text-green-400 text-sm">
                  Thank you for subscribing! You'll receive updates about the latest movies and offers.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Media Links */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm mr-3">Follow us:</span>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-400 ${social.color} transform hover:scale-110`}
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© ReelTik. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for movie lovers.</span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center md:justify-start items-center space-x-6 mt-6 pt-6 border-t border-gray-800/30">
            {legalLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300 text-xs"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;