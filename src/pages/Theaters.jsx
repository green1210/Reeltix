import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Shield, Coffee, Users, Clock } from 'lucide-react';
import { mockTheaters } from '../data/mockData';

const Theaters = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAmenity, setSelectedAmenity] = useState('all');

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'bangalore', name: 'Bangalore' },
    { id: 'pune', name: 'Pune' },
  ];

  const amenityFilters = [
    { id: 'all', name: 'All Amenities' },
    { id: 'imax', name: 'IMAX' },
    { id: '4dx', name: '4DX' },
    { id: 'dolby', name: 'Dolby Atmos' },
    { id: 'recliner', name: 'Recliner Seats' },
  ];

  const filteredTheaters = mockTheaters.filter(theater => {
    const locationMatch = selectedLocation === 'all' || 
      theater.location.toLowerCase().includes(selectedLocation);
    
    const amenityMatch = selectedAmenity === 'all' || 
      theater.amenities.some(amenity => 
        amenity.toLowerCase().includes(selectedAmenity.replace('dolby', 'dolby atmos'))
      );
    
    return locationMatch && amenityMatch;
  });

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'food court':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen py-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Premium Theaters</h1>
          <p className="text-xl text-gray-300">Experience movies like never before</p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 appearance-none"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id} className="bg-dark-800">
                    {location.name}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Amenity Filter */}
            <div className="relative">
              <select
                value={selectedAmenity}
                onChange={(e) => setSelectedAmenity(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 appearance-none"
              >
                {amenityFilters.map((amenity) => (
                  <option key={amenity.id} value={amenity.id} className="bg-dark-800">
                    {amenity.name}
                  </option>
                ))}
              </select>
              <Star className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Theaters Grid */}
        {filteredTheaters.length > 0 ? (
          <div className="grid gap-8">
            {filteredTheaters.map((theater, index) => (
              <div
                key={theater.id}
                className="card p-8 hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Theater Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2 gradient-text">{theater.name}</h2>
                      <div className="flex items-center space-x-2 text-gray-400 mb-4">
                        <MapPin className="h-5 w-5" />
                        <span className="text-lg">{theater.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
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
                      <h3 className="text-xl font-bold mb-4 text-primary-400">Premium Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {theater.amenities.map((amenity, amenityIndex) => (
                          <div
                            key={amenityIndex}
                            className="flex items-center space-x-3 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-3 border border-primary-500/20"
                          >
                            {getAmenityIcon(amenity)}
                            <span className="text-sm font-medium text-primary-300">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="card-glass p-4">
                        <h4 className="font-bold mb-2 text-secondary-400">Audio & Visual</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• 4K Digital Projection</li>
                          <li>• Dolby Atmos Sound</li>
                          <li>• IMAX Experience</li>
                        </ul>
                      </div>
                      <div className="card-glass p-4">
                        <h4 className="font-bold mb-2 text-accent-400">Comfort & Service</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Luxury Recliner Seats</li>
                          <li>• In-seat Food Service</li>
                          <li>• Climate Controlled</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="space-y-6">
                    <div className="card-glass p-6 text-center">
                      <div className="text-4xl font-bold gradient-text mb-2">4.8</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-400">Based on 2,847 reviews</div>
                    </div>

                    <div className="space-y-4">
                      <Link
                        to={`/theater/${theater.id}`}
                        className="btn-primary w-full text-center block"
                      >
                        View Showtimes & Book
                      </Link>
                      <button className="btn-secondary w-full">
                        Get Directions
                      </button>
                      <button className="btn-ghost w-full">
                        View Gallery
                      </button>
                    </div>

                    <div className="card-glass p-4">
                      <h4 className="font-bold mb-2 text-primary-400">Contact Info</h4>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>📞 +91 98765 43210</div>
                        <div>📧 info@{theater.name.toLowerCase().replace(/\s+/g, '')}.com</div>
                        <div>🕒 Open: 9:00 AM - 12:00 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-xl mb-4">No theaters found</div>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        {/* Why Choose Our Theaters */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center gradient-text mb-12">Why Choose Our Theaters?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-glass p-8 text-center">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Safe & Secure</h3>
              <p className="text-gray-400">Enhanced safety protocols, sanitized environments, and contactless experiences for your peace of mind.</p>
            </div>
            <div className="card-glass p-8 text-center">
              <div className="bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Premium Experience</h3>
              <p className="text-gray-400">State-of-the-art technology, luxury seating, and world-class amenities for the ultimate movie experience.</p>
            </div>
            <div className="card-glass p-8 text-center">
              <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Exceptional Service</h3>
              <p className="text-gray-400">Friendly staff, personalized service, and attention to detail that makes every visit memorable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theaters;