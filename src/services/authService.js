import axios from 'axios';

// API base URL - update this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('cinemaUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// FIXED: Enhanced user database with proper validation
const validateCredentials = (email, password) => {
  // Get registered users from localStorage
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // Demo users database (always available)
  const demoUsers = [
    { email: 'demo@cinemadistrict.com', password: 'demo123', name: 'Demo User' },
    { email: 'admin@cinemadistrict.com', password: 'admin123', name: 'Admin User' },
    { email: 'user@example.com', password: 'password123', name: 'Test User' }
  ];
  
  // Combine demo users and registered users
  const allUsers = [...demoUsers, ...registeredUsers];
  
  return allUsers.find(user => user.email === email && user.password === password);
};

// FIXED: Save user to local database
const saveUserToLocalDB = (userData) => {
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    const existingUser = registeredUsers.find(user => user.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'User already exists with this email' };
    }
    
    // Add new user
    registeredUsers.push({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone || '',
      id: Date.now(),
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    return { success: true };
  } catch (error) {
    console.error('Error saving user to local DB:', error);
    return { success: false, error: 'Failed to save user data' };
  }
};

export const authService = {
  // FIXED: Register new user with proper validation
  register: async (userData) => {
    try {
      // Validate input
      if (!userData.name || !userData.email || !userData.password) {
        return {
          success: false,
          error: 'Name, email, and password are required'
        };
      }

      // Try MongoDB first
      try {
        const response = await api.post('/auth/register', userData);
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('cinemaUser', JSON.stringify(user));
        
        return { success: true, user, token };
      } catch (mongoError) {
        console.log('MongoDB registration failed, using local storage');
        
        // Fallback to local registration
        const saveResult = saveUserToLocalDB(userData);
        if (!saveResult.success) {
          return saveResult;
        }
        
        const newUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone || ''
        };
        
        localStorage.setItem('cinemaUser', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  },

  // FIXED: Login user with proper validation
  login: async (credentials) => {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      // Try MongoDB first
      try {
        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('cinemaUser', JSON.stringify(user));
        
        return { success: true, user, token };
      } catch (mongoError) {
        console.log('MongoDB login failed, using local validation');
        
        // Fallback to local validation
        const validUser = validateCredentials(credentials.email, credentials.password);
        
        if (validUser) {
          const userData = {
            id: validUser.id || Date.now(),
            name: validUser.name,
            email: validUser.email,
            phone: validUser.phone || ''
          };
          
          localStorage.setItem('cinemaUser', JSON.stringify(userData));
          return { success: true, user: userData };
        }
        
        return {
          success: false,
          error: 'Invalid email or password. User does not exist or credentials are incorrect.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('cinemaUser');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: 'Failed to get user data' };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      const updatedUser = response.data;
      
      // Update stored user data
      localStorage.setItem('cinemaUser', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      };
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false };
    }
  }
};

export default authService;