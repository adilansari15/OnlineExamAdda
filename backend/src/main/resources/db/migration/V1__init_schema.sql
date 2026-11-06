-- V1__init_schema.sql
-- Initial database schema for Online Examination Adda
-- PostgreSQL-compatible schema (migrated from MySQL for Supabase)
-- Tables: users, roles, user_roles, categories, subjects, questions, question_options,
--         quizzes, quiz_questions, exam_attempts, student_answers, results

-- 1. users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 2. roles
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 3. user_roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(100) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 5. subjects
CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description TEXT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_subject_category_name UNIQUE (category_id, name),
    CONSTRAINT fk_subjects_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 6. questions
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    text TEXT NOT NULL,
    explanation TEXT NULL,
    difficulty VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_questions_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_questions_subject_difficulty ON questions(subject_id, difficulty);

-- 7. question_options
CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    position SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_question_option_pos UNIQUE (question_id, position),
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 8. quizzes
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    instructions TEXT NULL,
    difficulty VARCHAR(20) NOT NULL,
    duration_minutes INT NOT NULL,
    marks_per_question DECIMAL(5,2) NOT NULL,
    negative_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_marks DECIMAL(7,2) NOT NULL DEFAULT 0.00,
    passing_marks DECIMAL(7,2) NULL,
    max_attempts INT NULL,
    start_at TIMESTAMP NULL,
    end_at TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_quizzes_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_quizzes_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_quizzes_cat_stat_diff ON quizzes(category_id, status, difficulty);
CREATE INDEX idx_quizzes_status_created ON quizzes(status, created_at);

-- 9. quiz_questions
CREATE TABLE quiz_questions (
    quiz_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    position INT NOT NULL,
    marks_override DECIMAL(5,2) NULL,
    negative_override DECIMAL(5,2) NULL,
    PRIMARY KEY (quiz_id, question_id),
    CONSTRAINT uq_quiz_questions_pos UNIQUE (quiz_id, position),
    CONSTRAINT fk_quiz_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_questions_question FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 10. exam_attempts
CREATE TABLE exam_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    attempt_no INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP NULL,
    marks_per_question DECIMAL(5,2) NOT NULL,
    negative_marks DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_quiz_attempt UNIQUE (user_id, quiz_id, attempt_no),
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE INDEX idx_attempts_user_started ON exam_attempts(user_id, started_at);
CREATE INDEX idx_attempts_status_expires ON exam_attempts(status, expires_at);
CREATE INDEX idx_attempts_quiz ON exam_attempts(quiz_id);

-- 11. student_answers
CREATE TABLE student_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    position INT NOT NULL,
    selected_option_id BIGINT NULL,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id),
    CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_answers_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
);

CREATE INDEX idx_answers_attempt ON student_answers(attempt_id);

-- 12. results
CREATE TABLE results (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    incorrect_count INT NOT NULL,
    unattempted_count INT NOT NULL,
    total_marks DECIMAL(7,2) NOT NULL,
    obtained_marks DECIMAL(7,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    time_taken_seconds INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_results_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_results_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE INDEX idx_results_user_created ON results(user_id, created_at);
CREATE INDEX idx_results_quiz ON results(quiz_id);

