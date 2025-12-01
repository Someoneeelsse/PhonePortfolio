import { useEffect, useState, useRef } from "react";
import { PiImageSquare } from "react-icons/pi";
import AppsLayout from "./AppsLayout";

const Photos = ({
  onClose,
  clickPosition: _clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // List of all photos from the photos folder
  const photos = [
    "46X-9hLE.jpg",
    "oywsL0Yh.jpg",
    "MQTj9w3L.jpg",
    "jluGjLcr.jpg",
    "TKi525qG.jpg",
    "h8Qxjy3s.jpg",
    "WSsFE3Q_.jpg",
    "ZpocVE_Z.jpg",
    "aWbazvGZ.jpg",
    "m8Fm0Cr7.jpg",
    "Mb5UUwOc.jpg",
    "cMt-O_MB.jpg",
    "40Igbkh3.jpg",
    "IZm3BhdK.jpg",
    "oUyvvBon.jpg",
    "qkH94Db6.jpg",
    "g7-7BrSV.jpg",
    "XgLYwVuw.jpg",
    "HnAcf2io.jpg",
    "gILLL30h.jpg",
    "AtJlD0sv.jpg",
  ];

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const threshold = 100; // Minimum swipe distance

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        // Swipe right - go to previous photo
        setCurrentIndex(currentIndex - 1);
      } else if (dragOffset < 0 && currentIndex < photos.length - 1) {
        // Swipe left - go to next photo
        setCurrentIndex(currentIndex + 1);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStart;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const threshold = 100; // Minimum swipe distance

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        // Swipe right - go to previous photo
        setCurrentIndex(currentIndex - 1);
      } else if (dragOffset < 0 && currentIndex < photos.length - 1) {
        // Swipe left - go to next photo
        setCurrentIndex(currentIndex + 1);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600">
        <div
          className="flex flex-col items-center space-y-4 animate-fadeInFromCenter"
          style={{
            transformOrigin: "50% 100%",
            animation:
              "appOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <PiImageSquare className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Photos</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout
        onClose={onClose}
        title="Photos"
        statusBarTextColor="text-black"
        batteryColorScheme="light"
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30 pb-4">
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            {/* Photo cards container */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Current photo */}
              <div
                className="absolute w-full max-w-md h-[85%] rounded-3xl shadow-2xl overflow-hidden bg-white"
                style={{
                  transform: `translateX(${dragOffset}px) scale(${
                    1 - Math.abs(dragOffset) / 2000
                  })`,
                  opacity: 1 - Math.abs(dragOffset) / 800,
                  zIndex: 20,
                  transition: isDragging ? "none" : "all 0.3s ease-out",
                }}
              >
                <img
                  src={`/images/photos/${photos[currentIndex]}`}
                  alt={`Photo ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Next photo (slides up from below when swiping left) */}
              {currentIndex < photos.length - 1 && (
                <div
                  className="absolute w-full max-w-md h-[85%] rounded-3xl shadow-2xl overflow-hidden bg-white"
                  style={{
                    transform: `translateX(${
                      dragOffset < 0
                        ? dragOffset + 100
                        : 100
                    }px) translateY(${
                      dragOffset < 0
                        ? Math.max(0, 50 - (Math.abs(dragOffset) * 50) / 100)
                        : 50
                    }px) scale(${
                      dragOffset < 0
                        ? 0.95 + (Math.abs(dragOffset) * 0.05) / 100
                        : 0.95
                    })`,
                    opacity:
                      dragOffset < 0
                        ? 0.6 + (Math.abs(dragOffset) * 0.4) / 100
                        : 0.6,
                    zIndex: 10,
                    transition: isDragging ? "none" : "all 0.3s ease-out",
                  }}
                >
                  <img
                    src={`/images/photos/${photos[currentIndex + 1]}`}
                    alt={`Photo ${currentIndex + 2}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}

              {/* Previous photo (slides up from below when swiping right) */}
              {currentIndex > 0 && (
                <div
                  className="absolute w-full max-w-md h-[85%] rounded-3xl shadow-2xl overflow-hidden bg-white"
                  style={{
                    transform: `translateX(${
                      dragOffset > 0
                        ? dragOffset - 100
                        : -100
                    }px) translateY(${
                      dragOffset > 0
                        ? Math.max(0, 50 - (Math.abs(dragOffset) * 50) / 100)
                        : 50
                    }px) scale(${
                      dragOffset > 0
                        ? 0.95 + (Math.abs(dragOffset) * 0.05) / 100
                        : 0.95
                    })`,
                    opacity:
                      dragOffset > 0
                        ? 0.6 + (Math.abs(dragOffset) * 0.4) / 100
                        : 0.6,
                    zIndex: 10,
                    transition: isDragging ? "none" : "all 0.3s ease-out",
                  }}
                >
                  <img
                    src={`/images/photos/${photos[currentIndex - 1]}`}
                    alt={`Photo ${currentIndex}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Photo counter */}
          <div className="px-4 py-2 flex items-center justify-center gap-2">
            <div className="flex gap-1.5">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-gray-800"
                      : "w-1.5 bg-gray-400"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Photos;

