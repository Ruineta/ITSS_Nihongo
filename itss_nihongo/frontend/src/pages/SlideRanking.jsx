import React, { useCallback, useState } from "react";
import { TrendingUp } from 'lucide-react';
import RankingCard from "../components/RankingCard";
import Navigation from "../components/Navigation";
import Header from "../components/Header";
import { getSubjects } from "../services/slideService";

const API_BASE = process.env.REACT_APP_API_BASE || '';

const SlideRanking = () => {
    const [activeTab, setActiveTab] = useState('難解ランキング');
    const [loading, setLoading] = useState(true);

    // Use real data by default; toggle to mock only when backend is unavailable
    const [useMockData, setUseMockData] = useState(false);
    
    // Move mockSlides outside component to prevent recreation on each render
    const mockSlides = React.useMemo(() => [
        {
            id: 999,
            title: '量子力学の基礎：波動関数',
            subject: '物理',
            description: '量子力学における波動関数の基本概念と応用について解説したスライドです',
            author: {
                name: '鈴木先生',
                school: '東京大学',
                specialization: '理論物理学'
            },
            difficultyScore: 95,
            difficultyLevel: 'very_hard',
            fileUrl: '/slides/quantum-mechanics.pdf',
            fileType: 'pdf',
            createdAt: '2024-12-01T10:00:00Z',
            isRated: true,
            userRating: 0,
            userFeedback: '',
            analysisPoints: [
                '専門用語が難しい',
                '抽象的な概念の理解が困難',
                '数式の展開が複雑',
                '前提知識が多く必要'
            ]
        }
    ], []);

    const [slides, setSlides] = useState(useMockData ? mockSlides : []);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
    });
    const [stats, setStats] = useState(null);

    // Filter UI state
    const [filterType, setFilterType] = useState('difficultyScore'); // 'difficultyScore' | 'subject'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc' for difficultyScore
    const [subjectOptions, setSubjectOptions] = useState(['全て']);
    const [selectedSubject, setSelectedSubject] = useState('全て');

    const handleLogout = () => {
        alert('ログアウトしました');
    };

    const fetchSlides = useCallback(async (offset = 0) => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE}/api/slides/ranking/difficult?limit=10&offset=${offset}&minScore=0`
            );

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('サーバーがJSON形式で応答していません。APIエンドポイントを確認してください。');
            }

            if (!response.ok) {
                setLoading(false);
                throw new Error('スライドを取得できませんでした');
            }

            const result = await response.json();

            if (result.success) {
                const { slides: serverSlides = [], pagination: serverPagination } = result.data || {};

                const transformedSlides = serverSlides.map(slide => ({
                    id: slide.id,
                    title: slide.title,
                    description: slide.description,
                    // fileUrl: slide.file_url,
                    // fileType: slide.file_type,
                    difficultyLevel: slide.difficultyLevel,
                    difficultyScore: slide.difficultyScore,
                    viewCount: slide.viewCount || 0,
                    createdAt: slide.createdAt,
                    updatedAt: slide.updatedAt,
                    author: slide.author ? {
                        name: slide.author.name || '不明',
                        school: slide.author.school || null,
                        specialization: slide.author.specialization || null
                    } : {
                        name: '不明',
                        school: null,
                        specialization: null
                    },
                    subject: slide.subject?.name || slide.subject || null,
                    analysisPoints: slide.analysisPoints?.map(point => 
                        typeof point === 'string' ? point : point.description
                    ) || []
                }));

                setSlides(transformedSlides);
                if (serverPagination) {
                    setPagination(serverPagination);
                }
            }
        }catch(err) {
            setError(err.message);
            console.error('スライドの取得中にエラーが発生しました:', err);
            // Don't automatically switch to mock data to prevent infinite loops
            // User can manually switch if needed
        }finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/slides/ranking/difficult/stats`)

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('Stats API not returning JSON, skipping...');
                return;
            }

            if (!response.ok) {
                setLoading(false);
                throw new Error('統計情報を取得できませんでした');
            }

            const result = await response.json();

            if (result.success) {
                setStats(result.data);
            }

        }catch (err) {
            console.error('統計情報の取得中にエラーが発生しました:', err);
        }
    }, []);

    React.useEffect(() => {
        if (useMockData) {
            setLoading(false);
            setSlides(mockSlides);
            setPagination({
                total: mockSlides.length,
                limit: 10,
                offset: 0,
                hasMore: false
            });
            return;
        }
        void fetchSlides();
        void fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useMockData]);

    // Fetch subjects for subject filter
    React.useEffect(() => {
        const loadSubjects = async () => {
            try {
                const result = await getSubjects();
                if (result.success && Array.isArray(result.data)) {
                    const names = result.data.map((s) =>
                        typeof s === 'string' ? s : s.name || s.subject || ''
                    ).filter(Boolean);
                    setSubjectOptions(['全て', ...Array.from(new Set(names))]);
                }
            } catch (e) {
                console.error('科目リストの取得に失敗しました:', e);
                // fallback: derive from current slides when available
            }
        };
        void loadSubjects();
    }, []);

    const handleLoadMore = () => {
        if (pagination.hasMore) {
            void fetchSlides(pagination.offset + pagination.limit);
        }
    };

    const handleRate = async (slideID, difficultyScore, analysisPoint) => {
        try {
            const response = await fetch(`${API_BASE}/api/slides/ranking/difficult/${slideID}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    difficultyScore: difficultyScore,
                    feedback: analysisPoint || null
                })
            });
            if (!response.ok) {
                setLoading(false);
                throw new Error('Failed to fetch rating');
            }

            const result = await response.json();

            if (result.success) {
                // Update the specific slide in the current slides array
                setSlides(prevSlides => prevSlides.map(slide =>
                    slide.id === slideID ? {
                        ...slide,
                        isRated: true,
                        userRating: difficultyScore,
                        userFeedback: analysisPoint,
                        difficultyScore: result.data?.newDifficultyScore || slide.difficultyScore
                    } : slide
                ));

                // Refresh the list to get updated scores
                await fetchSlides(pagination.offset);
            }
        } catch (error) {
            console.log('評価の送信中にエラーが発生しました:', error);
            alert('評価の送信に失敗しました。もう一度お試しください。');
        }
    };

    const handleFeedback = async (slideID, feedback) => {
        try {
            // Call backend API to update feedback
            const response = await fetch(`${API_BASE}/api/slides/ranking/difficult/${slideID}/feedback`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback
                })
            });

            if (!response.ok) {
                throw new Error('更新できませんでした');
            }

            const result = await response.json();

            if (result.success) {
                // Update local state using functional update
                setSlides(prevSlides => prevSlides.map(slide =>
                    slide.id === slideID
                        ? { ...slide, userFeedback: feedback }
                        : slide
                ));
            }
        } catch (error) {
            console.error('更新中にエラーが発生しました:', error);
            alert('フィードバックの更新に失敗しました。もう一度お試しください。');
        }
    };

    // Apply filter / sort to slides before rendering
    const displayedSlides = React.useMemo(() => {
        let result = [...slides];

        if (filterType === 'difficultyScore') {
            result.sort((a, b) =>
                sortOrder === 'asc'
                    ? (a.difficultyScore || 0) - (b.difficultyScore || 0)
                    : (b.difficultyScore || 0) - (a.difficultyScore || 0)
            );
        } else if (filterType === 'subject') {
            if (selectedSubject && selectedSubject !== '全て') {
                result = result.filter((slide) => slide.subject === selectedSubject);
            }
        }

        return result;
    }, [slides, filterType, sortOrder, selectedSubject]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onLogout={handleLogout} />

            {/* Navigation */}
            <Navigation currentTab={activeTab} onTabChange={setActiveTab} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Mock Data Toggle - Remove in production */}
                    {useMockData && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">🧪 テストモード</p>
                                    <p className="text-xs text-yellow-700">モックデータを使用しています（本番環境では削除してください）</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setUseMockData(false);
                                        setSlides([]);
                                        void fetchSlides();
                                        void fetchStats();
                                    }}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                                >
                                    実データに切り替え
                                </button>
                            </div>
                        </div>
                    )}
                {/* Header Section */}
                <div className="bg-orange-50 rounded-lg p-6 mb-4 border-l-4 border-orange-500">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                        <h2 className="text-2xl font-bold text-gray-900">難解スライドランキング</h2>
                    </div>
                    <p className="text-gray-700">
                        学生のフィードバックと教師間の議論をもとに、最も理解しづらいスライドをランキング表示
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    {/* Box 1: filter type */}
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            フィルター種類
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilterType(value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="difficultyScore">難易度スコア</option>
                            <option value="subject">科目</option>
                        </select>
                    </div>

                    {/* Box 2: dependent on box 1 */}
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            条件
                        </label>
                        {filterType === 'difficultyScore' ? (
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="asc">難易度が低い順</option>
                                <option value="desc">難易度が高い順</option>
                            </select>
                        ) : (
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {subjectOptions.map((subj) => (
                                    <option key={subj} value={subj}>
                                        {subj}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Statistics Section */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-sm text-gray-600 mb-1">総スライド数</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalSlides}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-sm text-gray-600 mb-1">平均難易度</div>
                            <div className="text-2xl font-bold text-orange-500">{stats.averageScore}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-sm text-gray-600 mb-1">非常に難しい</div>
                            <div className="text-2xl font-bold text-red-500">{stats.distribution.veryDifficult}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-sm text-gray-600 mb-1">難しい</div>
                            <div className="text-2xl font-bold text-orange-500">{stats.distribution.difficult}</div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700">エラー: {error}</p>
                        <button
                            onClick={() => fetchSlides()}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            再読み込み
                        </button>
                    </div>
                )}

                {/* slides List */}
                {!loading && !error && (
                    <>
                        <div>
                            {slides.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="text-lg">表示するスライドがありません</p>
                                </div>
                            ) : (
                                displayedSlides.map((slide, index) => (
                                    <RankingCard
                                        key={slide.id}
                                        slide={slide}
                                        rank={index + 1}
                                        onRate={handleRate}
                                        onFeedback={handleFeedback}
                                    />
                                ))
                            )}
                        </div>

                        {/* Load More Button */}
                        {pagination.hasMore && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    さらに読み込む ({pagination.total - pagination.offset - pagination.limit}件)
                                </button>
                            </div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center mt-4 text-sm text-gray-600">
                            {pagination.total}件中 {Math.min(pagination.offset + pagination.limit, pagination.total)}件を表示
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default SlideRanking;