import { Film, Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  variant = 'default',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center py-12';

  const spinnerVariants = {
    default: (
      <div className={`loading-spinner rounded-full ${sizeClasses[size]} animate-spin`} />
    ),
    dots: (
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    ),
    pulse: (
      <div className={`bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full ${sizeClasses[size]} animate-pulse`} />
    ),
    film: (
      <div className="relative">
        <Film className={`${sizeClasses[size]} text-primary-400 animate-spin`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-primary-500/20 animate-ping`} />
      </div>
    ),
    loader: (
      <Loader2 className={`${sizeClasses[size]} text-primary-400 animate-spin`} />
    )
  };

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {spinnerVariants[variant]}
        </div>
        {message && (
          <p className="text-gray-400 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;