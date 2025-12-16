import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * RankingCard Component
 * Displays a slide post with difficulty rating and feedback functionality
 *
 * @param {Object} props
 * @param {Object} props.slide - Post data from backend
 * @param {number} props.rank - Ranking position
 * @param {Function} props.onRate - Callback when user submits rating
 * @param {Function} props.onFeedback - Callback when user updates feedback
 */
const RankingCard = ({ slide, rank, onRate, onFeedback }) => {
    // Rating form is hidden by default; user must click the button to edit
    const [showRating, setShowRating] = useState(false);
    const [selectedScore, setSelectedScore] = useState( slide.userRating|| slide.difficultyScore);
    const [analyst, setAnalyst] = useState(slide.analysisPoints);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    // Handle difficulty score slider change
    const handleScoreChange = (e) => {
        setSelectedScore(parseInt(e.target.value));
    };

    // Submit rating to backend
    const handleSubmitRating = async () => {
        if (selectedScore === 0) return;

        try {
            // Call parent callback with rating data
            await onRate(slide.id, selectedScore, analyst);
            setShowRating(false);
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('評価の送信に失敗しました');
        }
    };

    // Submit feedback update
    const handleFeedbackSubmit = async () => {
        try {
            await onFeedback(slide.id, analyst);
            setShowFeedbackForm(false);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('フィードバックの送信に失敗しました');
        }
    };

    // Get color based on difficulty score
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-red-600';
        if (score >= 60) return 'text-orange-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-red-400 to-red-600';
        if (score >= 60) return 'from-orange-400 to-orange-600';
        if (score >= 40) return 'from-yellow-400 to-yellow-600';
        return 'from-green-400 to-green-600';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Rank Badge */}
          <div className="flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base ${
                rank === 1
                  ? 'bg-orange-500'
                  : rank === 2
                  ? 'bg-gray-400'
                  : rank === 3
                  ? 'bg-amber-600'
                  : 'bg-gray-300'
              }`}
            >
              #{rank}
            </div>
          </div>

          <div className="flex-1">
        {/* Title and Subject */}
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-base md:text-lg font-bold text-gray-900">
            {slide.title}
          </h3>
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs md:text-sm rounded-full">
            {slide.subject}
          </span>
        </div>

                    {/* Description */}
        {slide.description && (
          <p className="text-sm text-gray-600 mb-2">{slide.description}</p>
        )}

                    {/* Author and Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>投稿者: {slide.author?.name || slide.author || '不明'}</span>
                        {slide.author?.school && (
                            <span className="text-gray-500">• {slide.author.school}</span>
                        )}
                        {slide.author?.specialization && (
                            <span className="text-gray-500">• {slide.author.specialization}</span>
                        )}
                        <span className="flex items-center gap-1"/>
                    </div>

                    {/* Current Difficulty Score Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs md:text-sm font-medium text-gray-700">
              理解難易度スコア
            </span>
            <span
              className={`text-base md:text-lg font-bold ${getScoreColor(
                slide.difficultyScore
              )}`}
            >
              {slide.difficultyScore}/100
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 mx-auto" style={{ width: '70%' }}>
            <div
              className={`bg-gradient-to-r ${getScoreGradient(
                slide.difficultyScore
              )} h-2 rounded-full transition-all`}
              style={{ width: `${slide.difficultyScore}%` }}
            />
          </div>
        </div>

                    {/* Button to enable rating (view-only by default) */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowRating(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {slide.isRated ? '評価を編集' : '評価する'}
                        </button>
                    </div>

                    {/* Analysis Points - Show if rated or has analysis points */}
                    {slide.analysisPoints && slide.analysisPoints.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2 text-orange-700">
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-medium">よくある理解困難ポイント:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {slide.analysisPoints.map((point, idx) => (
                                    <li key={idx}>{typeof point === 'string' ? point : point.description || point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Rating Section - Only shown after clicking the button */}
                    {showRating && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-medium text-gray-900 mb-3">このスライドを評価してください</h4>

                            {/* Difficulty Score Slider */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">難易度スコア:</span>
                                    <span className={`text-2xl font-bold ${getScoreColor(selectedScore)}`}>
                                        {selectedScore}/100
                                    </span>
                                </div>

                                {/* Slider */}
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={selectedScore}
                                    onChange={handleScoreChange}
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                        background: `linear-gradient(to right, 
                                            #22c55e 0%, 
                                            #eab308 40%, 
                                            #f97316 60%, 
                                            #ef4444 80%, 
                                            #dc2626 100%)`
                                    }}
                                />

                                {/* Score Labels */}
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>簡単</span>
                                    <span>普通</span>
                                    <span>難しい</span>
                                    <span>非常に難しい</span>
                                </div>
                            </div>

                            {/* Feedback Textarea */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">
                                    フィードバック (任意):
                                </label>
                                <textarea
                                    value={analyst}
                                    onChange={(e) => setAnalyst(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                    placeholder="このスライドについてのご意見をお聞かせください..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={selectedScore === 0}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                        selectedScore === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    評価を送信
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRating(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    )}

                    {/* After Rating - Show User's Rating */}
                    {!showRating && slide.isRated && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">あなたの評価:</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`bg-gradient-to-r ${getScoreGradient(slide.userRating)} h-2 rounded-full`}
                                                style={{ width: `${slide.userRating}%` }}
                                            />
                                        </div>
                                        <span className={`text-lg font-bold ${getScoreColor(slide.userRating)}`}>
                                                {slide.userRating}/100
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {showFeedbackForm ? 'キャンセル' : 'フィードバックを編集'}
                                </button>
                            </div>

                            {slide.userFeedback && !showFeedbackForm && (
                                <p className="text-sm text-gray-700 mt-2">
                                    <span className="font-medium">あなたのフィードバック:</span> {slide.userFeedback}
                                </p>
                            )}

                            {showFeedbackForm && (
                                <div className="mt-3">
                  <textarea
                      value={analyst}
                      onChange={(e) => setAnalyst(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="フィードバックを入力..."
                  />
                                    <button
                                        onClick={handleFeedbackSubmit}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                                    >
                                        送信
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankingCard;