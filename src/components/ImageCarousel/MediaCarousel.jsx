/**
 * Media Carousel Component
 * Displays multiple images and videos in a swipeable carousel
 */

import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { isValidYouTubeUrl } from '@/utils/youtube';
import './ImageCarousel.css';

const MediaCarousel = ({ items, alt = 'Media' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  if (!items || items.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const currentItem = items[currentIndex];
  const isVideo = currentItem?.type === 'video' || currentItem?.isYouTube;
  const isYouTube = currentItem?.isYouTube || (currentItem?.url && isValidYouTubeUrl(currentItem.url));
  
  // Check if all items are images (not videos)
  const allImages = items.every(item => {
    const itemType = typeof item === 'string' ? 'image' : (item.type || 'image');
    const itemIsYouTube = typeof item === 'string' 
      ? isValidYouTubeUrl(item) 
      : (item.isYouTube || (item.url && isValidYouTubeUrl(item.url)));
    return itemType !== 'video' && !itemIsYouTube;
  });

  return (
    <div className={`image-carousel ${allImages ? 'image-only-carousel' : ''}`}>
      <div className="carousel-container">
        {items.length > 1 && (
          <button 
            type="button"
            className="carousel-button carousel-button-prev" 
            onClick={goToPrevious}
            aria-label="Previous"
          >
            ‹
          </button>
        )}
        
        <div 
          className="carousel-slide-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div 
            className="carousel-slides" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => {
              const itemUrl = typeof item === 'string' ? item : item.url;
              const itemType = typeof item === 'string' ? 'image' : (item.type || 'image');
              const itemIsYouTube = typeof item === 'string' 
                ? isValidYouTubeUrl(itemUrl) 
                : (item.isYouTube || isValidYouTubeUrl(itemUrl));
              const isItemVideo = itemType === 'video' || itemIsYouTube;

              return (
                <div key={index} className={`carousel-slide ${!isItemVideo ? 'image-slide' : ''}`}>
                  {isItemVideo ? (
                    itemIsYouTube ? (
                      <div className="video-wrapper">
                        <ReactPlayer
                          url={itemUrl}
                          controls
                          width="100%"
                          height="100%"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                          config={{
                            youtube: {
                              playerVars: {
                                showinfo: 1,
                                rel: 0,
                                modestbranding: 1,
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <video 
                        src={itemUrl} 
                        controls
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'cover'
                        }} 
                      />
                    )
                  ) : (
                    <img 
                      src={itemUrl} 
                      alt={`${alt} ${index + 1}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {items.length > 1 && (
          <button 
            type="button"
            className="carousel-button carousel-button-next" 
            onClick={goToNext}
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>

      {items.length > 1 && (
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <button
              type="button"
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${index + 1}`}
            />
          ))}
        </div>
      )}

      {items.length > 1 && (
        <div className="carousel-counter">
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;

