import { Link, useLocation } from 'react-router-dom';
import { Film, Search, User, Menu, X, LogOut, Home, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import SearchModal from './SearchModal';

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle search modal keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/theaters', label: 'Theaters', icon: MapPin },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    setShowSearchModal(true);
  };

  return (
    <>
      <header className={`glass-effect sticky top-0 z-50 border-b border-white/10 transition-all duration-300 container-safe ${
        isScrolled ? 'backdrop-blur-2xl bg-dark-950/90' : 'backdrop-blur-xl bg-dark-950/80'
      }`}>
        <div className="mobile-container">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Film className="h-6 w-6 sm:h-7 sm:w-7 text-primary-400 group-hover:text-primary-300 transition-all duration-300" />
                <div className="absolute inset-0 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary-500/20 group-hover:bg-primary-500/30 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                  ReelTix
                </span>
                <span className="text-xs text-gray-400 -mt-1 hidden sm:block">Premium Experience</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-xs font-medium transition-all duration-300 group flex items-center space-x-1 px-2 py-1 rounded-lg ${
                      isActive(item.path) 
                        ? 'text-primary-400 bg-primary-500/10' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{item.label}</span>
                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300 group-hover:w-full ${
                      isActive(item.path) ? 'w-full' : ''
                    }`}></span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button 
                onClick={handleSearchClick}
                className="p-2 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-lg backdrop-blur-sm focus-ring group relative"
                title="Search movies (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Ctrl+K
                </div>
              </button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-gray-300 bg-white/5 rounded-lg px-2 py-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">Hi, {user?.name || 'User'}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-lg backdrop-blur-sm focus-ring"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="btn-ghost text-xs mobile-button">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary text-xs mobile-button">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-300 focus-ring rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu-panel md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 container-safe">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold gradient-text">ReelTix</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-300 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-1 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mobile-nav-item flex items-center space-x-2 ${
                    isActive(item.path) 
                      ? 'text-primary-400 bg-primary-500/10 border-l-4 border-primary-500' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Search */}
          <div className="mb-6">
            <button 
              onClick={() => {
                setShowSearchModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 p-3 text-gray-300 hover:text-white transition-colors duration-300 hover:bg-white/5 rounded-lg"
            >
              <Search className="h-4 w-4" />
              <span>Search Movies</span>
            </button>
          </div>

          {/* Mobile Auth Section */}
          <div className="border-t border-gray-700/50 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  <User className="h-4 w-4 text-primary-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 p-3 text-red-400 hover:text-red-300 transition-colors duration-300 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-ghost w-full text-center block"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary w-full text-center block"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </>
  );
};

export default Header;