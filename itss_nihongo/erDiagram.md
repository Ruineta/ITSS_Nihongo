erDiagram
    USERS {
        int id PK
        string email
        string full_name
        string school_name
        string specialization
        datetime last_login_at
    }

    SUBJECTS {
        int id PK
        string name "Toán học, Vật lý, Tiếng Nhật N3..."
    }

    SLIDES {
        int id PK
        int user_id FK
        int subject_id FK
        string title "<= 100 ký tự"
        text description
        string file_url
        string file_type "pptx/pdf"
        string difficulty_level "Ví dụ: N1, N2..."
        int view_count
        boolean is_public
        datetime created_at
    }

    KNOW_HOW_ARTICLES {
        int id PK
        int user_id FK
        string title
        text content
        boolean is_public
        datetime created_at
    }

    TAGS {
        int id PK
        string name "Ví dụ: 'Dễ hiểu', 'Mẹo'"
        string type "keyword/system"
    }

    SLIDE_TAGS {
        int slide_id FK
        int tag_id FK
        PK (slide_id, tag_id)
    }

    SLIDE_COMMENTS {
        int id PK
        int slide_id FK
        int user_id FK
        text content
        string type "comment/proposal"
    }

    DIFFICULTY_ANALYSIS_POINTS {
        int id PK
        int slide_id FK
        text point_description
    }

    USERS ||--o{ SLIDES : "uploads"
    USERS ||--o{ KNOW_HOW_ARTICLES : "writes"
    SUBJECTS ||--o{ SLIDES : "categorized under"
    SLIDES ||--o{ SLIDE_TAGS : "has"
    SLIDES ||--o{ SLIDE_COMMENTS : "has"
    SLIDES ||--o{ DIFFICULTY_ANALYSIS_POINTS : "has analysis"