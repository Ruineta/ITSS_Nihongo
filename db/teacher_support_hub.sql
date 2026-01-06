--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.0

-- Started on 2026-01-06 23:07:03 +07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.slides DROP CONSTRAINT IF EXISTS slides_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slides DROP CONSTRAINT IF EXISTS slides_subject_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_tags DROP CONSTRAINT IF EXISTS slide_tags_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_tags DROP CONSTRAINT IF EXISTS slide_tags_slide_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_likes DROP CONSTRAINT IF EXISTS slide_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_likes DROP CONSTRAINT IF EXISTS slide_likes_slide_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_comments DROP CONSTRAINT IF EXISTS slide_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_comments DROP CONSTRAINT IF EXISTS slide_comments_slide_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slide_comments DROP CONSTRAINT IF EXISTS slide_comments_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_tags DROP CONSTRAINT IF EXISTS know_how_tags_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_tags DROP CONSTRAINT IF EXISTS know_how_tags_article_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_reactions DROP CONSTRAINT IF EXISTS know_how_reactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_reactions DROP CONSTRAINT IF EXISTS know_how_reactions_article_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_comments DROP CONSTRAINT IF EXISTS know_how_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_comments DROP CONSTRAINT IF EXISTS know_how_comments_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_comments DROP CONSTRAINT IF EXISTS know_how_comments_article_id_fkey;
ALTER TABLE IF EXISTS ONLY public.know_how_articles DROP CONSTRAINT IF EXISTS know_how_articles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.difficulty_analysis_points DROP CONSTRAINT IF EXISTS difficulty_analysis_points_slide_id_fkey;
DROP INDEX IF EXISTS public.idx_slides_title;
DROP INDEX IF EXISTS public.idx_slides_subject;
DROP INDEX IF EXISTS public.idx_slides_difficulty_score;
DROP INDEX IF EXISTS public.idx_knowhow_reactions_type;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_pkey;
ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_name_key;
ALTER TABLE IF EXISTS ONLY public.slides DROP CONSTRAINT IF EXISTS slides_pkey;
ALTER TABLE IF EXISTS ONLY public.slide_tags DROP CONSTRAINT IF EXISTS slide_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.slide_likes DROP CONSTRAINT IF EXISTS slide_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.slide_comments DROP CONSTRAINT IF EXISTS slide_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.know_how_tags DROP CONSTRAINT IF EXISTS know_how_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.know_how_reactions DROP CONSTRAINT IF EXISTS know_how_reactions_pkey;
ALTER TABLE IF EXISTS ONLY public.know_how_comments DROP CONSTRAINT IF EXISTS know_how_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.know_how_articles DROP CONSTRAINT IF EXISTS know_how_articles_pkey;
ALTER TABLE IF EXISTS ONLY public.difficulty_analysis_points DROP CONSTRAINT IF EXISTS difficulty_analysis_points_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subjects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.slides ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.slide_comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.know_how_comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.know_how_articles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.difficulty_analysis_points ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.tags_id_seq;
DROP TABLE IF EXISTS public.tags;
DROP SEQUENCE IF EXISTS public.subjects_id_seq;
DROP TABLE IF EXISTS public.subjects;
DROP SEQUENCE IF EXISTS public.slides_id_seq;
DROP TABLE IF EXISTS public.slides;
DROP TABLE IF EXISTS public.slide_tags;
DROP TABLE IF EXISTS public.slide_likes;
DROP SEQUENCE IF EXISTS public.slide_comments_id_seq;
DROP TABLE IF EXISTS public.slide_comments;
DROP TABLE IF EXISTS public.know_how_tags;
DROP TABLE IF EXISTS public.know_how_reactions;
DROP SEQUENCE IF EXISTS public.know_how_comments_id_seq;
DROP TABLE IF EXISTS public.know_how_comments;
DROP SEQUENCE IF EXISTS public.know_how_articles_id_seq;
DROP TABLE IF EXISTS public.know_how_articles;
DROP SEQUENCE IF EXISTS public.difficulty_analysis_points_id_seq;
DROP TABLE IF EXISTS public.difficulty_analysis_points;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 41564)
-- Name: difficulty_analysis_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.difficulty_analysis_points (
    id integer NOT NULL,
    slide_id integer,
    point_description text NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 41563)
-- Name: difficulty_analysis_points_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.difficulty_analysis_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 235
-- Name: difficulty_analysis_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.difficulty_analysis_points_id_seq OWNED BY public.difficulty_analysis_points.id;


--
-- TOC entry 224 (class 1259 OID 41420)
-- Name: know_how_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.know_how_articles (
    id integer NOT NULL,
    user_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 223 (class 1259 OID 41419)
-- Name: know_how_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.know_how_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 223
-- Name: know_how_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.know_how_articles_id_seq OWNED BY public.know_how_articles.id;


--
-- TOC entry 232 (class 1259 OID 41506)
-- Name: know_how_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.know_how_comments (
    id integer NOT NULL,
    article_id integer,
    user_id integer,
    content text NOT NULL,
    parent_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 231 (class 1259 OID 41505)
-- Name: know_how_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.know_how_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 231
-- Name: know_how_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.know_how_comments_id_seq OWNED BY public.know_how_comments.id;


--
-- TOC entry 234 (class 1259 OID 41546)
-- Name: know_how_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.know_how_reactions (
    user_id integer NOT NULL,
    article_id integer NOT NULL,
    reaction_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT know_how_reactions_reaction_type_check CHECK (((reaction_type)::text = ANY ((ARRAY['like'::character varying, 'useful'::character varying, 'thanks'::character varying, 'empathy'::character varying])::text[])))
);


--
-- TOC entry 228 (class 1259 OID 41463)
-- Name: know_how_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.know_how_tags (
    article_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 41479)
-- Name: slide_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slide_comments (
    id integer NOT NULL,
    slide_id integer,
    user_id integer,
    content text NOT NULL,
    type character varying(20) DEFAULT 'comment'::character varying,
    parent_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT slide_comments_type_check CHECK (((type)::text = ANY ((ARRAY['comment'::character varying, 'proposal'::character varying])::text[])))
);


--
-- TOC entry 229 (class 1259 OID 41478)
-- Name: slide_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.slide_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 229
-- Name: slide_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.slide_comments_id_seq OWNED BY public.slide_comments.id;


--
-- TOC entry 233 (class 1259 OID 41530)
-- Name: slide_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slide_likes (
    user_id integer NOT NULL,
    slide_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 227 (class 1259 OID 41448)
-- Name: slide_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slide_tags (
    slide_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 41394)
-- Name: slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slides (
    id integer NOT NULL,
    user_id integer,
    subject_id integer,
    title character varying(100) NOT NULL,
    description text,
    file_url text NOT NULL,
    file_type character varying(10),
    difficulty_level character varying(50),
    difficulty_score integer DEFAULT 0,
    view_count integer DEFAULT 0,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    thumbnail_url text,
    CONSTRAINT slides_difficulty_score_check CHECK (((difficulty_score >= 0) AND (difficulty_score <= 100))),
    CONSTRAINT slides_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['pdf'::character varying, 'pptx'::character varying, 'ppt'::character varying])::text[])))
);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN slides.thumbnail_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.slides.thumbnail_url IS 'サムネイル画像のURL（第1ページから自動生成）';


--
-- TOC entry 221 (class 1259 OID 41393)
-- Name: slides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 221
-- Name: slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.slides_id_seq OWNED BY public.slides.id;


--
-- TOC entry 220 (class 1259 OID 41385)
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 41384)
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 219
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- TOC entry 226 (class 1259 OID 41437)
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    type character varying(20) DEFAULT 'keyword'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tags_type_check CHECK (((type)::text = ANY ((ARRAY['keyword'::character varying, 'system'::character varying])::text[])))
);


--
-- TOC entry 225 (class 1259 OID 41436)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 225
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 218 (class 1259 OID 41371)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    school_name character varying(255),
    specialization character varying(100),
    years_of_experience integer DEFAULT 0,
    avatar_url text,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 217 (class 1259 OID 41370)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4718 (class 2604 OID 41567)
-- Name: difficulty_analysis_points id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difficulty_analysis_points ALTER COLUMN id SET DEFAULT nextval('public.difficulty_analysis_points_id_seq'::regclass);


--
-- TOC entry 4704 (class 2604 OID 41423)
-- Name: know_how_articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_articles ALTER COLUMN id SET DEFAULT nextval('public.know_how_articles_id_seq'::regclass);


--
-- TOC entry 4714 (class 2604 OID 41509)
-- Name: know_how_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_comments ALTER COLUMN id SET DEFAULT nextval('public.know_how_comments_id_seq'::regclass);


--
-- TOC entry 4711 (class 2604 OID 41482)
-- Name: slide_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_comments ALTER COLUMN id SET DEFAULT nextval('public.slide_comments_id_seq'::regclass);


--
-- TOC entry 4698 (class 2604 OID 41397)
-- Name: slides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slides ALTER COLUMN id SET DEFAULT nextval('public.slides_id_seq'::regclass);


--
-- TOC entry 4697 (class 2604 OID 41388)
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- TOC entry 4708 (class 2604 OID 41440)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 4693 (class 2604 OID 41374)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4940 (class 0 OID 41564)
-- Dependencies: 236
-- Data for Name: difficulty_analysis_points; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.difficulty_analysis_points VALUES (1, 1, '専門用語が難しい');
INSERT INTO public.difficulty_analysis_points VALUES (2, 1, '抽象的な概念');
INSERT INTO public.difficulty_analysis_points VALUES (3, 1, '数式の理解');
INSERT INTO public.difficulty_analysis_points VALUES (4, 9, '反応機構の複雑さ');
INSERT INTO public.difficulty_analysis_points VALUES (5, 9, '立体化学の理解');
INSERT INTO public.difficulty_analysis_points VALUES (6, 9, '矢印の記法');
INSERT INTO public.difficulty_analysis_points VALUES (7, 2, '時空の概念が難解');
INSERT INTO public.difficulty_analysis_points VALUES (8, 2, '数学的背景知識');
INSERT INTO public.difficulty_analysis_points VALUES (9, 2, '直感に反する内容');
INSERT INTO public.difficulty_analysis_points VALUES (10, 5, '積分の計算');
INSERT INTO public.difficulty_analysis_points VALUES (11, 5, '複素数の扱い');
INSERT INTO public.difficulty_analysis_points VALUES (12, 3, 'ベクトル解析が必要');
INSERT INTO public.difficulty_analysis_points VALUES (13, 3, '偏微分方程式');
INSERT INTO public.difficulty_analysis_points VALUES (14, 7, '謙譲語と尊敬語の区別');
INSERT INTO public.difficulty_analysis_points VALUES (15, 7, '場面による使い分け');
INSERT INTO public.difficulty_analysis_points VALUES (16, 6, '行列の対角化');
INSERT INTO public.difficulty_analysis_points VALUES (17, 6, '応用例の理解');
INSERT INTO public.difficulty_analysis_points VALUES (18, 4, 'ラグランジュ乗数法');
INSERT INTO public.difficulty_analysis_points VALUES (19, 4, '制約条件の設定');


--
-- TOC entry 4928 (class 0 OID 41420)
-- Dependencies: 224
-- Data for Name: know_how_articles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4936 (class 0 OID 41506)
-- Dependencies: 232
-- Data for Name: know_how_comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4938 (class 0 OID 41546)
-- Dependencies: 234
-- Data for Name: know_how_reactions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4932 (class 0 OID 41463)
-- Dependencies: 228
-- Data for Name: know_how_tags; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4934 (class 0 OID 41479)
-- Dependencies: 230
-- Data for Name: slide_comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4937 (class 0 OID 41530)
-- Dependencies: 233
-- Data for Name: slide_likes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4931 (class 0 OID 41448)
-- Dependencies: 227
-- Data for Name: slide_tags; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.slide_tags VALUES (1, 3);
INSERT INTO public.slide_tags VALUES (1, 4);
INSERT INTO public.slide_tags VALUES (1, 9);
INSERT INTO public.slide_tags VALUES (1, 20);
INSERT INTO public.slide_tags VALUES (2, 3);
INSERT INTO public.slide_tags VALUES (2, 4);
INSERT INTO public.slide_tags VALUES (2, 10);
INSERT INTO public.slide_tags VALUES (2, 20);
INSERT INTO public.slide_tags VALUES (4, 2);
INSERT INTO public.slide_tags VALUES (4, 5);
INSERT INTO public.slide_tags VALUES (4, 11);
INSERT INTO public.slide_tags VALUES (4, 21);
INSERT INTO public.slide_tags VALUES (5, 3);
INSERT INTO public.slide_tags VALUES (5, 5);
INSERT INTO public.slide_tags VALUES (5, 12);
INSERT INTO public.slide_tags VALUES (5, 20);
INSERT INTO public.slide_tags VALUES (7, 3);
INSERT INTO public.slide_tags VALUES (7, 7);
INSERT INTO public.slide_tags VALUES (7, 13);
INSERT INTO public.slide_tags VALUES (7, 22);
INSERT INTO public.slide_tags VALUES (8, 2);
INSERT INTO public.slide_tags VALUES (8, 7);
INSERT INTO public.slide_tags VALUES (8, 14);
INSERT INTO public.slide_tags VALUES (9, 3);
INSERT INTO public.slide_tags VALUES (9, 6);
INSERT INTO public.slide_tags VALUES (9, 15);
INSERT INTO public.slide_tags VALUES (9, 20);
INSERT INTO public.slide_tags VALUES (10, 2);
INSERT INTO public.slide_tags VALUES (10, 6);
INSERT INTO public.slide_tags VALUES (10, 16);
INSERT INTO public.slide_tags VALUES (10, 20);
INSERT INTO public.slide_tags VALUES (3, 3);
INSERT INTO public.slide_tags VALUES (3, 4);
INSERT INTO public.slide_tags VALUES (3, 17);
INSERT INTO public.slide_tags VALUES (3, 20);
INSERT INTO public.slide_tags VALUES (6, 2);
INSERT INTO public.slide_tags VALUES (6, 5);
INSERT INTO public.slide_tags VALUES (6, 18);
INSERT INTO public.slide_tags VALUES (6, 21);


--
-- TOC entry 4926 (class 0 OID 41394)
-- Dependencies: 222
-- Data for Name: slides; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.slides VALUES (12, 1, NULL, 'dsadasdas', NULL, '/uploads/slides/slide_1766638051011-777155059_14_Web_________________________3____________.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 11:47:30.18583', '2025-12-25 11:47:30.18583', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (13, 1, NULL, 'aaaa', NULL, '/uploads/slides/slide_1766640953735-904375364_Chapter05.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:35:53.787199', '2025-12-25 12:35:53.787199', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (14, 1, NULL, 'aaaa', NULL, '/uploads/slides/slide_1766641130972-422787812_Chapter05.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:38:51.037342', '2025-12-25 12:38:51.037342', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (15, 1, NULL, 'aaaa', NULL, '/uploads/slides/slide_1766641146992-675873229_Chapter04.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:39:07.138354', '2025-12-25 12:39:07.138354', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (16, 1, NULL, 'aaaa', NULL, '/uploads/slides/slide_1766641265818-704748507_Chapter04.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:41:05.870998', '2025-12-25 12:41:05.870998', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (1, 1, 1, '量子力学の基礎：波動関数', '量子力学における波動関数の基本概念を解説', 'https://example.com/slides/quantum-basics.pdf', 'pdf', '上級', 95, 45, true, '2024-03-15 10:30:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/quantum/400/300');
INSERT INTO public.slides VALUES (2, 1, 1, '相対性理論入門', 'アインシュタインの特殊相対性理論の基礎', 'https://example.com/slides/relativity.pptx', 'pptx', '上級', 88, 62, true, '2024-06-20 14:15:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/relativity/400/300');
INSERT INTO public.slides VALUES (3, 1, 1, '電磁気学の基本法則', 'マクスウェル方程式の導出と応用', 'https://example.com/slides/electromagnetism.pdf', 'pdf', '上級', 82, 105, true, '2023-09-10 09:00:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/electro/400/300');
INSERT INTO public.slides VALUES (4, 2, 2, '微積分の応用：最適化問題', '実世界の最適化問題における微積分の応用', 'https://example.com/slides/calculus-optimization.pdf', 'pdf', '中級', 72, 123, true, '2024-01-10 11:00:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/calculus/400/300');
INSERT INTO public.slides VALUES (5, 2, 2, 'フーリエ変換の基礎', '信号処理におけるフーリエ変換の理論と実践', 'https://example.com/slides/fourier.pdf', 'pdf', '上級', 85, 89, true, '2023-05-25 16:30:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/fourier/400/300');
INSERT INTO public.slides VALUES (6, 2, 2, '線形代数：固有値問題', '行列の固有値と固有ベクトルの応用', 'https://example.com/slides/eigenvalues.pdf', 'pdf', '中級', 75, 142, true, '2022-11-08 13:45:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/linear/400/300');
INSERT INTO public.slides VALUES (7, 3, 3, 'N1レベルの敬語表現', '日本語能力試験N1レベルの敬語の使い分け', 'https://example.com/slides/keigo-n1.pptx', 'pptx', 'N1', 78, 156, true, '2024-08-03 10:20:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/keigo/400/300');
INSERT INTO public.slides VALUES (8, 3, 3, '古典文法の基礎', '古文における文法事項の基本', 'https://example.com/slides/kobun-grammar.pdf', 'pdf', '中級', 65, 98, true, '2021-04-18 15:00:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/kobun/400/300');
INSERT INTO public.slides VALUES (9, 4, 4, '有機化学反応機構', '有機化合物の反応メカニズムの詳細', 'https://example.com/slides/organic-mechanisms.pdf', 'pdf', '上級', 90, 71, true, '2023-12-22 08:30:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/organic/400/300');
INSERT INTO public.slides VALUES (10, 4, 4, '化学平衡の理論', '平衡定数と反応の進行方向', 'https://example.com/slides/equilibrium.pptx', 'pptx', '中級', 68, 134, true, '2024-02-14 12:00:00', '2025-12-09 23:06:58.158671', 'https://picsum.photos/seed/equilibrium/400/300');
INSERT INTO public.slides VALUES (11, 1, NULL, 'Android basic', NULL, '/uploads/slides/slide_1766594422739-635625144_Lesson_1_Kotlin_basics.pdf', 'pdf', NULL, 0, 0, true, '2025-12-24 23:40:22.923162', '2025-12-24 23:40:22.923162', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (17, 1, NULL, 'aaaa', NULL, '/uploads/slides/slide_1766642100271-849075247_Chapter04.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:55:00.321905', '2025-12-25 12:55:00.321905', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (18, 1, NULL, 'aawfw', NULL, '/uploads/slides/slide_1766642132014-947261288_Chapter04.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:55:32.066987', '2025-12-25 12:55:32.066987', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (19, 1, NULL, 'huiui', NULL, '/uploads/slides/slide_1766642264507-688198758_Chapter01.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:57:44.558199', '2025-12-25 12:57:44.558199', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (20, 1, NULL, 'aff', NULL, '/uploads/slides/slide_1766642351193-126063324_Chapter04.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 12:59:11.24398', '2025-12-25 12:59:11.24398', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');
INSERT INTO public.slides VALUES (21, 1, NULL, 'fđfssfssf', NULL, '/uploads/slides/slide_1766642972211-427861021_Chapter04.pdf', 'pdf', NULL, 0, 0, true, '2025-12-25 13:09:32.28332', '2025-12-25 13:09:32.28332', 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=PDF+Slide');


--
-- TOC entry 4924 (class 0 OID 41385)
-- Dependencies: 220
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subjects VALUES (1, '物理');
INSERT INTO public.subjects VALUES (2, '数学');
INSERT INTO public.subjects VALUES (3, '日本語教育');
INSERT INTO public.subjects VALUES (4, '化学');
INSERT INTO public.subjects VALUES (5, '生物');


--
-- TOC entry 4930 (class 0 OID 41437)
-- Dependencies: 226
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tags VALUES (1, '初級', 'system', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (2, '中級', 'system', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (3, '上級', 'system', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (4, '物理', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (5, '数学', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (6, '化学', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (7, '日本語教育', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (8, '生物', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (9, '量子力学', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (10, '相対性理論', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (11, '微積分', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (12, 'フーリエ変換', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (13, '敬語', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (14, '古典文法', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (15, '有機化学', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (16, '化学平衡', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (17, '電磁気学', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (18, '線形代数', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (19, '実験', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (20, '理論', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (21, '応用', 'keyword', '2025-12-09 23:06:58.158671');
INSERT INTO public.tags VALUES (22, 'やさしい日本語', 'keyword', '2025-12-09 23:06:58.158671');


--
-- TOC entry 4922 (class 0 OID 41371)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'suzuki@example.com', '$2b$10$dummyhash1', '鈴木先生', '東京大学', '物理学', 15, NULL, NULL, '2025-12-09 23:06:58.158671', '2025-12-09 23:06:58.158671');
INSERT INTO public.users VALUES (2, 'tanaka@example.com', '$2b$10$dummyhash2', '田中先生', '京都大学', '数学', 10, NULL, NULL, '2025-12-09 23:06:58.158671', '2025-12-09 23:06:58.158671');
INSERT INTO public.users VALUES (3, 'yamada@example.com', '$2b$10$dummyhash3', '山田先生', '大阪大学', '日本語教育', 8, NULL, NULL, '2025-12-09 23:06:58.158671', '2025-12-09 23:06:58.158671');
INSERT INTO public.users VALUES (4, 'sato@example.com', '$2b$10$dummyhash4', '佐藤先生', '名古屋大学', '化学', 12, NULL, NULL, '2025-12-09 23:06:58.158671', '2025-12-09 23:06:58.158671');
INSERT INTO public.users VALUES (5, 'email@example.com', '$2b$10$k1vFp1Nxy8BLbcNyx9EvOOUctuiGp2sL04nksEb/bP0ivDC2gabbi', 'Kuan', 'HUST', 'IT', 0, NULL, '2025-12-16 20:25:13.855385', '2025-12-16 20:23:38.610167', '2025-12-16 20:23:38.610167');
INSERT INTO public.users VALUES (6, 'test@gmail.com', '$2b$10$Jm0euITUlAVzEl/qJqJdxuqQwLj59GihIICJdSAy3pt1ad/TD8jnq', 'Mkubanana', 'HUST', 'IT', 0, NULL, '2025-12-25 11:32:11.895312', '2025-12-25 11:31:46.628365', '2025-12-25 11:31:46.628365');
INSERT INTO public.users VALUES (7, 'haianhhn1204@gmail.com', '$2b$10$hm0pBxGPRSxPsrcBZjs/x.bY8TbDlN5zvj4ZC75LNU0vh8ZzjnDti', 'Nguyễn Hải Anh', 'HUST', 'IT', 0, NULL, '2025-12-25 12:59:03.726538', '2025-12-25 12:35:06.287207', '2025-12-25 12:35:06.287207');
INSERT INTO public.users VALUES (8, 'dominh2004@gmail.com', '$2b$10$vVu8fr/UpijgGFL1hJphUuuD89J5NcPu4cRXek8b9IyBXTDMDpNc2', 'Đỗ Tuấn phong', 'HUST', 'IT', 0, NULL, '2025-12-25 13:08:55.915855', '2025-12-25 13:04:44.256495', '2025-12-25 13:08:15.00651');


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 235
-- Name: difficulty_analysis_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.difficulty_analysis_points_id_seq', 19, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 223
-- Name: know_how_articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.know_how_articles_id_seq', 1, false);


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 231
-- Name: know_how_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.know_how_comments_id_seq', 1, false);


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 229
-- Name: slide_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.slide_comments_id_seq', 1, false);


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 221
-- Name: slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.slides_id_seq', 21, true);


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 219
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subjects_id_seq', 5, true);


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 225
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_id_seq', 22, true);


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 4757 (class 2606 OID 41571)
-- Name: difficulty_analysis_points difficulty_analysis_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difficulty_analysis_points
    ADD CONSTRAINT difficulty_analysis_points_pkey PRIMARY KEY (id);


--
-- TOC entry 4738 (class 2606 OID 41430)
-- Name: know_how_articles know_how_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_articles
    ADD CONSTRAINT know_how_articles_pkey PRIMARY KEY (id);


--
-- TOC entry 4750 (class 2606 OID 41514)
-- Name: know_how_comments know_how_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_comments
    ADD CONSTRAINT know_how_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4755 (class 2606 OID 41552)
-- Name: know_how_reactions know_how_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_reactions
    ADD CONSTRAINT know_how_reactions_pkey PRIMARY KEY (user_id, article_id);


--
-- TOC entry 4746 (class 2606 OID 41467)
-- Name: know_how_tags know_how_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_tags
    ADD CONSTRAINT know_how_tags_pkey PRIMARY KEY (article_id, tag_id);


--
-- TOC entry 4748 (class 2606 OID 41489)
-- Name: slide_comments slide_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_comments
    ADD CONSTRAINT slide_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4752 (class 2606 OID 41535)
-- Name: slide_likes slide_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_likes
    ADD CONSTRAINT slide_likes_pkey PRIMARY KEY (user_id, slide_id);


--
-- TOC entry 4744 (class 2606 OID 41452)
-- Name: slide_tags slide_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_tags
    ADD CONSTRAINT slide_tags_pkey PRIMARY KEY (slide_id, tag_id);


--
-- TOC entry 4736 (class 2606 OID 41408)
-- Name: slides slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slides
    ADD CONSTRAINT slides_pkey PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 41392)
-- Name: subjects subjects_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_name_key UNIQUE (name);


--
-- TOC entry 4731 (class 2606 OID 41390)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 4740 (class 2606 OID 41447)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- TOC entry 4742 (class 2606 OID 41445)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4725 (class 2606 OID 41383)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4727 (class 2606 OID 41381)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4753 (class 1259 OID 41580)
-- Name: idx_knowhow_reactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowhow_reactions_type ON public.know_how_reactions USING btree (reaction_type);


--
-- TOC entry 4732 (class 1259 OID 41579)
-- Name: idx_slides_difficulty_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slides_difficulty_score ON public.slides USING btree (difficulty_score DESC);


--
-- TOC entry 4733 (class 1259 OID 41577)
-- Name: idx_slides_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slides_subject ON public.slides USING btree (subject_id);


--
-- TOC entry 4734 (class 1259 OID 41578)
-- Name: idx_slides_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slides_title ON public.slides USING btree (title);


--
-- TOC entry 4775 (class 2606 OID 41572)
-- Name: difficulty_analysis_points difficulty_analysis_points_slide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difficulty_analysis_points
    ADD CONSTRAINT difficulty_analysis_points_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id) ON DELETE CASCADE;


--
-- TOC entry 4760 (class 2606 OID 41431)
-- Name: know_how_articles know_how_articles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_articles
    ADD CONSTRAINT know_how_articles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4768 (class 2606 OID 41515)
-- Name: know_how_comments know_how_comments_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_comments
    ADD CONSTRAINT know_how_comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.know_how_articles(id) ON DELETE CASCADE;


--
-- TOC entry 4769 (class 2606 OID 41525)
-- Name: know_how_comments know_how_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_comments
    ADD CONSTRAINT know_how_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.know_how_comments(id);


--
-- TOC entry 4770 (class 2606 OID 41520)
-- Name: know_how_comments know_how_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_comments
    ADD CONSTRAINT know_how_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4773 (class 2606 OID 41558)
-- Name: know_how_reactions know_how_reactions_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_reactions
    ADD CONSTRAINT know_how_reactions_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.know_how_articles(id) ON DELETE CASCADE;


--
-- TOC entry 4774 (class 2606 OID 41553)
-- Name: know_how_reactions know_how_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_reactions
    ADD CONSTRAINT know_how_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4763 (class 2606 OID 41468)
-- Name: know_how_tags know_how_tags_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_tags
    ADD CONSTRAINT know_how_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.know_how_articles(id) ON DELETE CASCADE;


--
-- TOC entry 4764 (class 2606 OID 41473)
-- Name: know_how_tags know_how_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.know_how_tags
    ADD CONSTRAINT know_how_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 4765 (class 2606 OID 41500)
-- Name: slide_comments slide_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_comments
    ADD CONSTRAINT slide_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.slide_comments(id);


--
-- TOC entry 4766 (class 2606 OID 41490)
-- Name: slide_comments slide_comments_slide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_comments
    ADD CONSTRAINT slide_comments_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id) ON DELETE CASCADE;


--
-- TOC entry 4767 (class 2606 OID 41495)
-- Name: slide_comments slide_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_comments
    ADD CONSTRAINT slide_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4771 (class 2606 OID 41541)
-- Name: slide_likes slide_likes_slide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_likes
    ADD CONSTRAINT slide_likes_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id) ON DELETE CASCADE;


--
-- TOC entry 4772 (class 2606 OID 41536)
-- Name: slide_likes slide_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_likes
    ADD CONSTRAINT slide_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4761 (class 2606 OID 41453)
-- Name: slide_tags slide_tags_slide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_tags
    ADD CONSTRAINT slide_tags_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id) ON DELETE CASCADE;


--
-- TOC entry 4762 (class 2606 OID 41458)
-- Name: slide_tags slide_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slide_tags
    ADD CONSTRAINT slide_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 4758 (class 2606 OID 41414)
-- Name: slides slides_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slides
    ADD CONSTRAINT slides_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- TOC entry 4759 (class 2606 OID 41409)
-- Name: slides slides_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slides
    ADD CONSTRAINT slides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-06 23:07:04 +07

--
-- PostgreSQL database dump complete
--

