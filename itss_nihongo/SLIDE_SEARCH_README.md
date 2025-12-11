# Màn hình Tìm kiếm Slide - Teacher Support Hub

## 📋 Mô tả
Màn hình tìm kiếm slide cho phép giáo viên tìm kiếm và khám phá các tài liệu giảng dạy được chia sẻ bởi các giáo viên khác.

## 🎯 Các tính năng đã implement

### ✅ UI Components
1. **Header** - Logo và nút đăng xuất
2. **Navigation** - Menu điều hướng giữa các trang (スライド検索 được active)
3. **SearchFilter** - Bộ lọc tìm kiếm với:
   - Ô tìm kiếm từ khóa (có debounce 500ms)
   - Dropdown lọc theo 科目 (Môn học)
   - Dropdown lọc theo 難易度 (Độ khó/Năm học)
   - Dropdown sắp xếp theo 並び替え
   - Nút "検索" để apply filters
   - Popular tags để tìm kiếm nhanh
4. **SlideCard** - Card hiển thị thông tin slide:
   - Thumbnail/preview ảnh
   - Tiêu đề slide
   - Thông tin tác giả và trường
   - Tags (hiển thị tối đa 3 tags)
   - Badge độ khó (初級/中級/上級)
   - Số lượt xem
   - Ngày upload

### ✅ State Management & Logic
- **Debounce Search**: Tối ưu API calls khi người dùng gõ từ khóa
- **Filter Logic**: Lọc theo môn học, độ khó, và từ khóa
- **Sort Logic**: Sắp xếp kết quả theo độ khó
- **Loading State**: Skeleton loading với animation
- **Empty State**: Thông báo khi không có kết quả
- **Error State**: Hiển thị lỗi và nút retry

## 📁 Cấu trúc Files

```
src/
├── components/
│   ├── Header.jsx              # Header component
│   ├── Navigation.jsx          # Navigation tabs
│   ├── SearchFilter.jsx        # Bộ lọc tìm kiếm ⭐ MỚI
│   └── SlideCard.jsx           # Card hiển thị slide ⭐ MỚI
├── pages/
│   └── SlideSearch.jsx         # Page tìm kiếm slide ⭐ MỚI
├── hooks/
│   └── useDebounce.js          # Custom hook debounce ⭐ MỚI
└── App.jsx                     # Routing (đã cập nhật)
```

## 🔌 Tích hợp API (Backend Integration)

### Endpoint cần implement

```javascript
// GET /api/slides/search
// Query parameters:
// - keyword: string (từ khóa tìm kiếm)
// - subject: string (môn học, '全て' = all)
// - difficulty: string (độ khó: '初級'/'中級'/'上級')
// - year: string (năm học)
// - sortBy: string (sắp xếp)

// Response format:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "thumbnail": "https://...",
      "title": "Tiêu đề slide",
      "author": "Tên giáo viên",
      "university": "Tên trường",
      "uploadDate": "2024年12月1日",
      "tags": ["tag1", "tag2"],
      "views": 123,
      "difficulty": "初級"
    }
  ],
  "total": 10
}
```

### Cách tích hợp vào code

Trong file `SlideSearch.jsx`, thay thế function `fetchSlides()`:

```javascript
const fetchSlides = async () => {
    setIsLoading(true);
    setError(null);

    try {
        // Gọi API thực tế
        const params = new URLSearchParams({
            keyword: debouncedSearchKeyword,
            subject: filters.subject,
            difficulty: filters.difficulty,
            year: filters.year
        });

        const response = await fetch(`/api/slides/search?${params}`);
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const result = await response.json();
        
        setSlides(result.data);
        setTotalResults(result.total);
        setIsLoading(false);
    } catch (err) {
        setError(err.message || 'データの取得に失敗しました。もう一度お試しください。');
        setIsLoading(false);
    }
};
```

## 🎨 Customization

### Thay đổi danh sách môn học
Trong `SearchFilter.jsx`, edit array `subjects`:
```javascript
const subjects = [
    '全て',
    '数学',
    '物理',
    // Thêm môn học mới...
];
```

### Thay đổi popular tags
```javascript
const popularTags = [
    '料目',
    '中級',
    // Thêm tags mới...
];
```

### Thay đổi delay debounce
Trong `SlideSearch.jsx`:
```javascript
const debouncedSearchKeyword = useDebounce(searchKeyword, 500); // Change 500 to other value (ms)
```

## 🚀 Chạy project

```bash
# Install dependencies
npm install

# Start development server
npm start

# Truy cập: http://localhost:3000/search
```

## 📱 Responsive Design

- **Mobile (< 768px)**: 1 cột grid
- **Tablet (768px - 1024px)**: 2 cột grid
- **Desktop (> 1024px)**: 3 cột grid

Filters sẽ stack vertically trên mobile và horizontal trên desktop.

## ⚡ Performance Optimization

1. **Debounce**: Giảm số lượng API calls khi user typing
2. **Skeleton Loading**: Cải thiện perceived performance
3. **Lazy loading images**: Slides load progressively
4. **Memoization**: Có thể thêm `React.memo()` cho SlideCard nếu cần

## 🔍 Testing

Để test màn hình:
1. Gõ từ khóa trong search box → Đợi 500ms → Kết quả tự động filter
2. Click vào popular tags → Search box tự động điền và search
3. Thay đổi filters → Click "検索" button
4. Kiểm tra responsive trên mobile/tablet/desktop

## 📝 Notes

- Mock data hiện tại dùng placeholder images từ `via.placeholder.com`
- Trong production, thay bằng real API endpoint
- Có thể thêm pagination nếu kết quả nhiều
- Có thể thêm infinite scroll thay vì pagination
- Error handling đã được implement sẵn

## 🐛 Known Issues / TODO

- [ ] Thêm pagination khi có nhiều kết quả
- [ ] Thêm filter lưu vào URL query params
- [ ] Thêm bookmark/favorite slide functionality
- [ ] Thêm preview slide khi click vào card
- [ ] Implement actual file download

---
Developed for Teacher Support Hub - ITSS Nihongo Project 2024
