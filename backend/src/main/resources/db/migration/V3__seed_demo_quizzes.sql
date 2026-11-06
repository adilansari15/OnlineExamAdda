-- V3__seed_demo_quizzes.sql
-- Seed starter questions and published quizzes for Online Examination Adda

-- 1. Insert Questions for Core Java (Subject 1)
INSERT INTO questions (id, subject_id, text, explanation, difficulty, active, created_at, updated_at) VALUES
(101, 1, 'Which of the following is NOT a Java primitive data type?', 'String is an immutable reference class, not a primitive type.', 'EASY', TRUE, NOW(), NOW()),
(102, 1, 'What is the default value of an uninitialized boolean variable in a class in Java?', 'In Java, instance boolean fields default to false.', 'EASY', TRUE, NOW(), NOW()),
(103, 1, 'Which concept in Java promotes code reusability by allowing a class to inherit fields and methods from another class?', 'Inheritance allows a subclass to inherit attributes and methods from a superclass.', 'MEDIUM', TRUE, NOW(), NOW()),
(104, 1, 'What does the JVM do when an unhandled exception occurs at runtime?', 'The JVM terminates the executing thread and prints the stack trace to System.err.', 'MEDIUM', TRUE, NOW(), NOW()),
(105, 1, 'Which keyword is used to prevent method overriding in Java?', 'A method marked final cannot be overridden by any subclass.', 'EASY', TRUE, NOW(), NOW());

-- 2. Insert Options for Questions 101 to 105
INSERT INTO question_options (id, question_id, option_text, is_correct, position, created_at, updated_at) VALUES
-- Q101
(201, 101, 'int', FALSE, 1, NOW(), NOW()),
(202, 101, 'boolean', FALSE, 2, NOW(), NOW()),
(203, 101, 'String', TRUE, 3, NOW(), NOW()),
(204, 101, 'double', FALSE, 4, NOW(), NOW()),

-- Q102
(205, 102, 'true', FALSE, 1, NOW(), NOW()),
(206, 102, 'false', TRUE, 2, NOW(), NOW()),
(207, 102, 'null', FALSE, 3, NOW(), NOW()),
(208, 102, '0', FALSE, 4, NOW(), NOW()),

-- Q103
(209, 103, 'Encapsulation', FALSE, 1, NOW(), NOW()),
(210, 103, 'Inheritance', TRUE, 2, NOW(), NOW()),
(211, 103, 'Polymorphism', FALSE, 3, NOW(), NOW()),
(212, 103, 'Abstraction', FALSE, 4, NOW(), NOW()),

-- Q104
(213, 104, 'It automatically re-executes the method', FALSE, 1, NOW(), NOW()),
(214, 104, 'It prints stack trace and terminates the thread', TRUE, 2, NOW(), NOW()),
(215, 104, 'It ignores the error silently', FALSE, 3, NOW(), NOW()),
(216, 104, 'It restarts the JVM', FALSE, 4, NOW(), NOW()),

-- Q105
(217, 105, 'static', FALSE, 1, NOW(), NOW()),
(218, 105, 'abstract', FALSE, 2, NOW(), NOW()),
(219, 105, 'final', TRUE, 3, NOW(), NOW()),
(220, 105, 'synchronized', FALSE, 4, NOW(), NOW());

-- 3. Insert Published Quiz: "Core Java Fundamentals Exam"
INSERT INTO quizzes (id, category_id, title, description, instructions, difficulty, duration_minutes, marks_per_question, negative_marks, total_marks, passing_marks, max_attempts, status, created_at, updated_at) VALUES
(101, 1, 'Core Java Fundamentals Assessment', 'Test your knowledge on Java syntax, primitive types, OOP principles, and control structures.', '1. Read each question carefully before answering.\n2. Each question carries 4 marks with a 1 mark negative deduction for incorrect answers.\n3. Autosave is enabled throughout the exam.', 'EASY', 20, 4.00, 1.00, 20.00, 8.00, 3, 'PUBLISHED', NOW(), NOW());

-- 4. Associate Questions to Quiz
INSERT INTO quiz_questions (quiz_id, question_id, position) VALUES
(101, 101, 1),
(101, 102, 2),
(101, 103, 3),
(101, 104, 4),
(101, 105, 5);

-- 5. Insert Questions for Python Fundamentals (Subject 5)
INSERT INTO questions (id, subject_id, text, explanation, difficulty, active, created_at, updated_at) VALUES
(106, 5, 'Which Python data structure is immutable?', 'Tuples cannot be modified after creation.', 'EASY', TRUE, NOW(), NOW()),
(107, 5, 'What is the output of len([1, 2, [3, 4]]) in Python?', 'The outer list has three elements: 1, 2, and the sublist [3, 4].', 'MEDIUM', TRUE, NOW(), NOW());

INSERT INTO question_options (id, question_id, option_text, is_correct, position, created_at, updated_at) VALUES
(221, 106, 'list', FALSE, 1, NOW(), NOW()),
(222, 106, 'tuple', TRUE, 2, NOW(), NOW()),
(223, 106, 'set', FALSE, 3, NOW(), NOW()),
(224, 106, 'dict', FALSE, 4, NOW(), NOW()),

(225, 107, '4', FALSE, 1, NOW(), NOW()),
(226, 107, '3', TRUE, 2, NOW(), NOW()),
(227, 107, '2', FALSE, 3, NOW(), NOW()),
(228, 107, 'TypeError', FALSE, 4, NOW(), NOW());

-- 6. Insert Published Quiz: "Python Essentials Certification Prep"
INSERT INTO quizzes (id, category_id, title, description, instructions, difficulty, duration_minutes, marks_per_question, negative_marks, total_marks, passing_marks, max_attempts, status, created_at, updated_at) VALUES
(102, 2, 'Python Essentials Practice Quiz', 'Practice essential Python variables, data structures, and functions.', '1. Answer both questions within the allotted time.\n2. No negative marks apply for this quiz.', 'MEDIUM', 15, 5.00, 0.00, 10.00, 5.00, 5, 'PUBLISHED', NOW(), NOW());

INSERT INTO quiz_questions (quiz_id, question_id, position) VALUES
(102, 106, 1),
(102, 107, 2);

