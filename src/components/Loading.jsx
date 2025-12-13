/**
 * Loading Component
 * Displays loading state
 */

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClass = fullScreen ? 'loading-fullscreen' : 'loading-inline';
  
  return (
    <div className={containerClass}>
      <div className="loading-wrapper">
        <div className="loading-spinner"></div>
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;

