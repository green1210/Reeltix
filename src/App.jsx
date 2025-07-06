import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Theaters from './pages/Theaters';
import TheaterDetails from './pages/TheaterDetails';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Booking Context
const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function App() {
  const [booking, setBooking] = useState({
    movie: null,
    theater: null,
    showtime: null,
    date: null,
    seats: [],
    totalPrice: 0,
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cinemaUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);

  const updateBooking = (updates) => {
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const clearBooking = () => {
    setBooking({
      movie: null,
      theater: null,
      showtime: null,
      date: null,
      seats: [],
      totalPrice: 0,
    });
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('cinemaUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearBooking();
    try {
      localStorage.removeItem('cinemaUser');
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
    }
  };

  const signup = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('cinemaUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup }}>
        <BookingContext.Provider value={{ booking, updateBooking, clearBooking }}>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 text-white container-safe flex flex-col">
              <Header />
              <main className="container-safe flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/theaters" element={<Theaters />} />
                  <Route path="/theater/:id" element={<TheaterDetails />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/seats" element={<SeatSelection />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/confirmation" element={<BookingConfirmation />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex items-center justify-center hero-pattern container-safe">
                        <div className="text-center">
                          <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                          <p className="text-xl text-gray-400 mb-8">Page not found</p>
                          <a href="/" className="btn-primary">
                            Go Home
                          </a>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </BookingContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;