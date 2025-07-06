import axios from 'axios';

// FIXED: Enhanced streaming platform mapping WITHOUT Apple TV (removed problematic platforms)
const streamingPlatforms = {
  8: { 
    name: 'Netflix', 
    logo: '🎬', 
    color: '#E50914', 
    type: 'subscription',
    baseUrl: 'https://www.netflix.com',
    searchUrl: 'https://www.netflix.com/search?q='
  },
  119: { 
    name: 'Amazon Prime Video', 
    logo: '📺', 
    color: '#00A8E1', 
    type: 'subscription',
    baseUrl: 'https://www.primevideo.com',
    searchUrl: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase='
  },
  337: { 
    name: 'Disney+', 
    logo: '🏰', 
    color: '#113CCF', 
    type: 'subscription',
    baseUrl: 'https://www.disneyplus.com',
    searchUrl: 'https://www.disneyplus.com/search?q='
  },
  384: { 
    name: 'HBO Max', 
    logo: '🎭', 
    color: '#8A2BE2', 
    type: 'subscription',
    baseUrl: 'https://www.hbomax.com',
    searchUrl: 'https://www.hbomax.com/search?q='
  },
  15: { 
    name: 'Hulu', 
    logo: '📱', 
    color: '#1CE783', 
    type: 'subscription',
    baseUrl: 'https://www.hulu.com',
    searchUrl: 'https://www.hulu.com/search?q='
  },
  // REMOVED: Apple TV+ and Apple iTunes (causing download issues)
  // 350: Apple TV+
  // 2: Apple iTunes
  3: { 
    name: 'Google Play Movies', 
    logo: '▶️', 
    color: '#4285F4', 
    type: 'rent/buy',
    baseUrl: 'https://play.google.com',
    searchUrl: 'https://play.google.com/store/search?q='
  },
  192: { 
    name: 'YouTube Movies', 
    logo: '📹', 
    color: '#FF0000', 
    type: 'rent/buy',
    baseUrl: 'https://www.youtube.com',
    searchUrl: 'https://www.youtube.com/results?search_query='
  },
  // Indian platforms
  444: { 
    name: 'Hotstar', 
    logo: '⭐', 
    color: '#0F1419', 
    type: 'subscription',
    baseUrl: 'https://www.hotstar.com',
    searchUrl: 'https://www.hotstar.com/in/search?q='
  },
  122: { 
    name: 'Zee5', 
    logo: '🎭', 
    color: '#6C2C91', 
    type: 'subscription',
    baseUrl: 'https://www.zee5.com',
    searchUrl: 'https://www.zee5.com/search?q='
  },
  283: { 
    name: 'Jio Cinema', 
    logo: '📱', 
    color: '#0066CC', 
    type: 'subscription',
    baseUrl: 'https://www.jiocinema.com',
    searchUrl: 'https://www.jiocinema.com/search?q='
  }
};

// Create direct streaming link (Apple TV removed)
const createStreamingLink = (platform, movieTitle, providerId) => {
  const cleanTitle = movieTitle.replace(/[^\w\s]/gi, '').trim();
  const searchTerm = encodeURIComponent(cleanTitle);
  
  // Special handling for specific platforms (Apple TV removed)
  switch (providerId) {
    case 192: // YouTube Movies
      return `https://www.youtube.com/results?search_query=${searchTerm}+movie`;
    case 3: // Google Play Movies
      return `https://play.google.com/store/search?q=${searchTerm}&c=movies`;
    case 8: // Netflix
      return `https://www.netflix.com/search?q=${searchTerm}`;
    case 119: // Amazon Prime Video
      return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${searchTerm}`;
    case 337: // Disney+
      return `https://www.disneyplus.com/search?q=${searchTerm}`;
    case 384: // HBO Max
      return `https://www.hbomax.com/search?q=${searchTerm}`;
    case 15: // Hulu
      return `https://www.hulu.com/search?q=${searchTerm}`;
    case 444: // Hotstar
      return `https://www.hotstar.com/in/search?q=${searchTerm}`;
    case 122: // Zee5
      return `https://www.zee5.com/search?q=${searchTerm}`;
    case 283: // Jio Cinema
      return `https://www.jiocinema.com/search?q=${searchTerm}`;
    default:
      return platform.searchUrl ? `${platform.searchUrl}${searchTerm}` : 
             `https://www.google.com/search?q=${searchTerm}+${encodeURIComponent(platform.name)}+movie`;
  }
};

// Format streaming availability (Apple TV filtered out)
export const formatStreamingAvailability = (watchProviders, movieTitle) => {
  const availability = {
    subscription: [],
    rent: [],
    buy: [],
    free: []
  };

  if (!watchProviders) return availability;

  // Process subscription platforms (filtering out Apple platforms)
  if (watchProviders.flatrate) {
    watchProviders.flatrate.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.subscription.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          type: platform.type,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          link: createStreamingLink(platform, movieTitle, provider.provider_id),
          directUrl: platform.baseUrl
        });
      }
    });
  }

  // Process rental platforms (filtering out Apple platforms)
  if (watchProviders.rent) {
    watchProviders.rent.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.rent.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          type: platform.type,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          link: createStreamingLink(platform, movieTitle, provider.provider_id),
          directUrl: platform.baseUrl
        });
      }
    });
  }

  // Process purchase platforms (filtering out Apple platforms)
  if (watchProviders.buy) {
    watchProviders.buy.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.buy.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          type: platform.type,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          link: createStreamingLink(platform, movieTitle, provider.provider_id),
          directUrl: platform.baseUrl
        });
      }
    });
  }

  // Process free platforms (filtering out Apple platforms)
  if (watchProviders.ads) {
    watchProviders.ads.forEach(provider => {
      // SKIP Apple TV+ and Apple iTunes
      if (provider.provider_id === 350 || provider.provider_id === 2) return;
      
      const platform = streamingPlatforms[provider.provider_id];
      if (platform) {
        availability.free.push({
          id: provider.provider_id,
          name: platform.name,
          logo: platform.logo,
          color: platform.color,
          type: platform.type,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          link: createStreamingLink(platform, movieTitle, provider.provider_id),
          directUrl: platform.baseUrl
        });
      }
    });
  }

  return availability;
};

// Open streaming platform directly
export const openStreamingPlatform = (streamingOption) => {
  if (streamingOption.link) {
    window.open(streamingOption.link, '_blank', 'noopener,noreferrer');
  }
};

export { streamingPlatforms };
export default { formatStreamingAvailability, openStreamingPlatform, streamingPlatforms };