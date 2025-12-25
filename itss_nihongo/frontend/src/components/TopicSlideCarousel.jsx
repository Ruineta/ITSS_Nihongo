import React, { useState } from "react";

const TopicSlideCarousel = ({ slides = [], onSelectSlide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
        <p className="text-gray-500">討論トピックがありません</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleSelectSlide = (index) => {
    setCurrentIndex(index);
    if (onSelectSlide) {
      onSelectSlide(slides[index]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Main Slide Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 min-h-80">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          {/* Slide Number Badge */}
          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
            Topic {currentIndex + 1} / {slides.length}
          </div>

          {/* Slide Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center">
            {currentSlide.title || "無題のトピック"}
          </h3>

          {/* Slide Description */}
          {currentSlide.description && (
            <p className="text-gray-700 text-center max-w-2xl">
              {currentSlide.description}
            </p>
          )}

          {/* Slide Tags */}
          {currentSlide.tags && currentSlide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {currentSlide.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {typeof tag === "object" ? tag.name : tag}
                </span>
              ))}
            </div>
          )}

          {/* Slide Info */}
          <div className="flex gap-6 text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200 w-full justify-center">
            {currentSlide.commentsCount !== undefined && (
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">コメント</p>
                <p className="text-lg font-bold text-gray-900">
                  {currentSlide.commentsCount}
                </p>
              </div>
            )}
            {currentSlide.rating !== undefined && (
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">評価</p>
                <p className="text-lg font-bold text-gray-900">
                  {currentSlide.rating}⭐
                </p>
              </div>
            )}
            {currentSlide.views !== undefined && (
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">閲覧</p>
                <p className="text-lg font-bold text-gray-900">
                  {currentSlide.views}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 w-2.5 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">
          トピック一覧
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSlide(idx)}
              className={`flex-shrink-0 p-3 rounded-lg text-sm font-medium transition-all ${
                idx === currentIndex
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-400"
              }`}
            >
              {slide.title
                ? slide.title.substring(0, 15) + "..."
                : `Topic ${idx + 1}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicSlideCarousel;
