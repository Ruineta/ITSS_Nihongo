import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const TopicSlideCarousel = ({ slides = [], onSelectSlide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
        <p className="text-gray-500">討論トピックがありません</p>
      </div>
    );
  }

  /* 
     Refactored to behave as a Page Navigator for the Slide.
     currentIndex now represents the Page Index (0-based).
     slides[0] serves as the base slide data.
  */
  const slideData = slides[0] || {};
  // If we have loaded the PDF, use numPages. Otherwise fallback to slideData.pageCount or 1.
  const totalPages = numPages || slideData.pageCount || 1;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleSelectPage = (index) => {
    setCurrentIndex(index);
    if (onSelectSlide) {
      // Pass the main slide data but with the new index
      onSelectSlide(slideData, index);
    }
  };

  if (!slideData) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Main Slide Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 min-h-80">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          {/* Page Number Badge */}
          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
            ページ {currentIndex + 1} / {totalPages}
          </div>

          {/* Slide Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center">
            {slideData.title || "無題のスライド"}
          </h3>

          {/* PDF Renderer */}
          <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden min-h-[500px] flex items-center justify-center relative">
            {slideData.fileUrl ? (
              slideData.fileType !== 'pdf' ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="text-gray-400 mb-4 text-6xl">📄</div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">プレビューはPDFのみ対応しています</p>
                  <p className="text-gray-500 mb-6 font-mono text-sm">{slideData.fileUrl.split('/').pop()}</p>
                  <a
                    href={slideData.fileUrl}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center gap-2"
                    download
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    ダウンロードして閲覧
                  </a>
                </div>
              ) : (
                <Document
                  file={slideData.fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center justify-center p-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-500">Loading PDF...</p>
                    </div>
                  }
                  error={
                    <div className="p-10 text-center text-red-500">
                      <p>Failed to load PDF.</p>
                      <p className="text-sm mt-2 text-gray-400">URL: {slideData.fileUrl}</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentIndex === 0 ? 1 : currentIndex + 1}
                    width={600}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    error={
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Page {currentIndex + 1} not available
                      </div>
                    }
                  />
                </Document>
              )
            ) : (
              <div className="p-10 text-gray-400">File URL missing</div>
            )}
          </div>

          {/* Slide Info (View only on General Page or always?) */}
          <div className="flex gap-6 text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200 w-full justify-center">
            {slideData.commentsCount !== undefined && (
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">コメント</p>
                <p className="text-lg font-bold text-gray-900">
                  {slideData.commentsCount}
                </p>
              </div>
            )}
            {slideData.rating !== undefined && (
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">総合評価</p>
                <p className="text-lg font-bold text-gray-900">
                  {slideData.rating}⭐
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
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Indicators */}
        <div className="flex gap-1 overflow-x-auto max-w-[200px]">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPage(idx)}
              className={`h-2.5 w-2.5 rounded-full transition-all flex-shrink-0 ${idx === currentIndex
                ? "bg-blue-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
                }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page List (Bottom Strip) */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Numbered Pages only */}
          {totalPages && totalPages > 0 && Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handleSelectPage(i)}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${currentIndex === i
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-400"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopicSlideCarousel;
