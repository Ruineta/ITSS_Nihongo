# User Profile API Documentation

## Overview
API endpoints for managing user profiles, viewing statistics, and accessing user activities.

## Base URL
```
http://localhost:5000/api/users
```

## Authentication
Most endpoints require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Get My Profile (Authenticated User)
Get full profile information including private data for the currently authenticated user.

**Endpoint:** `GET /api/users/profile/me`  
**Access:** Private (requires authentication)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "teacher@example.com",
      "fullName": "山田 太郎",
      "schoolName": "東京大学",
      "specialization": "日本語教育",
      "yearsOfExperience": 5,
      "avatarUrl": "https://example.com/avatar.jpg",
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2023-06-01T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "statistics": {
      "totalSlideCount": 15,
      "publicSlideCount": 12,
      "totalArticleCount": 8,
      "publicArticleCount": 7,
      "slideCommentCount": 45,
      "articleCommentCount": 23,
      "totalCommentCount": 68,
      "totalLikesReceived": 234,
      "totalReactionsReceived": 156,
      "totalViews": 3450
    },
    "recentActivities": [
      {
        "type": "slide",
        "id": 123,
        "title": "N3文法まとめ",
        "created_at": "2024-01-15T09:00:00.000Z",
        "is_public": true,
        "view_count": 45,
        "likes_count": 12,
        "comments_count": 5
      },
      {
        "type": "article",
        "id": 456,
        "title": "初級クラスでの工夫",
        "created_at": "2024-01-14T14:30:00.000Z",
        "is_public": true,
        "view_count": 0,
        "likes_count": 23,
        "comments_count": 8
      }
    ]
  }
}
```

---

### 2. Get User Profile by ID
Get public profile information of any user.

**Endpoint:** `GET /api/users/profile/:userId`  
**Access:** Public

**Parameters:**
- `userId` (path parameter): User ID to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "teacher@example.com",
      "fullName": "山田 太郎",
      "schoolName": "東京大学",
      "specialization": "日本語教育",
      "yearsOfExperience": 5,
      "avatarUrl": "https://example.com/avatar.jpg",
      "createdAt": "2023-06-01T08:00:00.000Z"
    },
    "statistics": {
      "slideCount": 12,
      "articleCount": 7,
      "slideCommentCount": 45,
      "articleCommentCount": 23,
      "totalCommentCount": 68,
      "totalLikesReceived": 234,
      "totalReactionsReceived": 156
    },
    "recentActivities": [
      {
        "type": "slide",
        "id": 123,
        "title": "N3文法まとめ",
        "created_at": "2024-01-15T09:00:00.000Z",
        "view_count": 45,
        "likes_count": 12,
        "comments_count": 5
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "ユーザーが見つかりません"
}
```

---

### 3. Update Profile
Update the authenticated user's profile information.

**Endpoint:** `PUT /api/users/profile`  
**Access:** Private (requires authentication)

**Request Body:**
```json
{
  "full_name": "山田 太郎",
  "school_name": "東京大学",
  "specialization": "日本語教育",
  "years_of_experience": 5,
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Required Fields:**
- `full_name`: Full name (cannot be empty)

**Optional Fields:**
- `school_name`: School/university name
- `specialization`: Area of expertise
- `years_of_experience`: Teaching experience in years (must be >= 0)
- `avatar_url`: Profile picture URL

**Response:**
```json
{
  "success": true,
  "message": "プロフィールが正常に更新されました",
  "data": {
    "user": {
      "id": 1,
      "email": "teacher@example.com",
      "fullName": "山田 太郎",
      "schoolName": "東京大学",
      "specialization": "日本語教育",
      "yearsOfExperience": 5,
      "avatarUrl": "https://example.com/new-avatar.jpg",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "氏名は必須です"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "認証が必要です"
}
```

---

### 4. Get User's Slides
Get all public slides uploaded by a specific user.

**Endpoint:** `GET /api/users/profile/:userId/slides`  
**Access:** Public

**Parameters:**
- `userId` (path parameter): User ID
- `limit` (query, optional): Number of slides per page (default: 10)
- `offset` (query, optional): Pagination offset (default: 0)

**Example:**
```
GET /api/users/profile/1/slides?limit=5&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "slides": [
      {
        "id": 123,
        "title": "N3文法まとめ",
        "description": "N3レベルの文法ポイントをまとめました",
        "thumbnail_url": "https://example.com/thumb.jpg",
        "file_type": "pdf",
        "difficulty_level": "N3",
        "view_count": 45,
        "created_at": "2024-01-15T09:00:00.000Z",
        "subject_name": "日本語教育",
        "author_name": "山田 太郎",
        "likes_count": 12,
        "comments_count": 5
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 5,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 5. Get User's Articles
Get all public know-how articles by a specific user.

**Endpoint:** `GET /api/users/profile/:userId/articles`  
**Access:** Public

**Parameters:**
- `userId` (path parameter): User ID
- `limit` (query, optional): Number of articles per page (default: 10)
- `offset` (query, optional): Pagination offset (default: 0)

**Example:**
```
GET /api/users/profile/1/articles?limit=5&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 456,
        "title": "初級クラスでの工夫",
        "excerpt": "初級クラスで効果的だった指導法について共有します...",
        "created_at": "2024-01-14T14:30:00.000Z",
        "author_name": "山田 太郎",
        "author_avatar": "https://example.com/avatar.jpg",
        "reactions_count": 23,
        "comments_count": 8
      }
    ],
    "pagination": {
      "total": 7,
      "limit": 5,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## Activity Types

The `recentActivities` array can contain the following activity types:

### Activity Type: `slide`
A slide uploaded by the user.
```json
{
  "type": "slide",
  "id": 123,
  "title": "Slide title",
  "created_at": "2024-01-15T09:00:00.000Z",
  "view_count": 45,
  "likes_count": 12,
  "comments_count": 5
}
```

### Activity Type: `article`
A know-how article written by the user.
```json
{
  "type": "article",
  "id": 456,
  "title": "Article title",
  "created_at": "2024-01-14T14:30:00.000Z",
  "view_count": 0,
  "likes_count": 23,
  "comments_count": 8
}
```

### Activity Type: `slide_comment`
A comment on a slide.
```json
{
  "type": "slide_comment",
  "id": 789,
  "title": "Comment text preview...",
  "created_at": "2024-01-13T10:00:00.000Z",
  "view_count": 0,
  "likes_count": 0,
  "comments_count": 0
}
```

### Activity Type: `article_comment`
A comment on an article.
```json
{
  "type": "article_comment",
  "id": 101,
  "title": "Comment text preview...",
  "created_at": "2024-01-12T15:30:00.000Z",
  "view_count": 0,
  "likes_count": 0,
  "comments_count": 0
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - User does not exist |
| 500 | Internal Server Error |

---

## Usage Examples

### JavaScript/Fetch API

```javascript
// Get my profile
const getMyProfile = async () => {
  const response = await fetch('http://localhost:5000/api/users/profile/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Get another user's profile
const getUserProfile = async (userId) => {
  const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`);
  const data = await response.json();
  return data;
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await fetch('http://localhost:5000/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  return data;
};
```

### cURL Examples

```bash
# Get my profile
curl -X GET http://localhost:5000/api/users/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user profile by ID
curl -X GET http://localhost:5000/api/users/profile/1

# Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "full_name": "山田 太郎",
    "school_name": "東京大学",
    "specialization": "日本語教育",
    "years_of_experience": 5
  }'

# Get user's slides
curl -X GET "http://localhost:5000/api/users/profile/1/slides?limit=5&offset=0"

# Get user's articles
curl -X GET "http://localhost:5000/api/users/profile/1/articles?limit=5&offset=0"
```

---

## Testing

Run the test suite to verify all endpoints:

```bash
cd backend
node test_profile_api.js
```

Make sure you have a test user with:
- Email: test@teacher.com
- Password: Test1234

Or update the credentials in the test file before running.

---

## Notes

1. **Public vs Private Data**: 
   - `/profile/me` returns full profile including private slides/articles count
   - `/profile/:userId` only returns public information and public content counts

2. **Statistics**:
   - All statistics are calculated in real-time from the database
   - Likes and reactions are counted separately

3. **Recent Activities**:
   - Limited to the 20 most recent activities
   - Sorted by creation date (newest first)
   - Includes slides, articles, and comments

4. **Pagination**:
   - Default limit is 10 items per page
   - Use `offset` and `limit` query parameters for pagination
   - Response includes `hasMore` flag for easy pagination

5. **Privacy**:
   - Only public slides and articles are visible to other users
   - Users can only edit their own profiles
