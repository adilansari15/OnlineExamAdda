-- V2__seed_reference_data.sql
-- Seed initial roles, 12 categories, and core subjects

-- 1. Roles
INSERT INTO roles (id, name, created_at, updated_at) VALUES
(1, 'ROLE_STUDENT', NOW(), NOW()),
(2, 'ROLE_ADMIN', NOW(), NOW());

-- 2. 12 Categories
INSERT INTO categories (id, name, slug, description, icon, active, created_at, updated_at) VALUES
(1, 'Java Programming', 'java-programming', 'Core Java, OOP, Collections, Multithreading, and Modern Java concepts', 'code-2', TRUE, NOW(), NOW()),
(2, 'Python Programming', 'python-programming', 'Python basics, data structures, OOP, standard library, and algorithms', 'terminal', TRUE, NOW(), NOW()),
(3, 'C Programming', 'c-programming', 'Foundational C syntax, pointers, memory management, and data structures', 'cpu', TRUE, NOW(), NOW()),
(4, 'Data Structures and Algorithms', 'dsa', 'Arrays, linked lists, trees, graphs, sorting, searching, and complexity analysis', 'binary', TRUE, NOW(), NOW()),
(5, 'DBMS', 'dbms', 'Database models, normalization, ER diagrams, indexing, transactions, and ACID properties', 'database', TRUE, NOW(), NOW()),
(6, 'SQL', 'sql', 'Structured Query Language: SELECT queries, JOINs, subqueries, aggregations, and DDL/DML', 'table-2', TRUE, NOW(), NOW()),
(7, 'Operating Systems', 'operating-systems', 'Process management, concurrency, deadlocks, memory management, and file systems', 'hard-drive', TRUE, NOW(), NOW()),
(8, 'Computer Networks', 'computer-networks', 'OSI model, TCP/IP, protocols, routing, subnetting, and network security', 'network', TRUE, NOW(), NOW()),
(9, 'Web Development', 'web-development', 'HTML5, CSS3, JavaScript ES6+, DOM manipulation, REST APIs, and modern frontend/backend', 'globe', TRUE, NOW(), NOW()),
(10, 'Aptitude', 'aptitude', 'Quantitative aptitude, percentages, ratios, time and work, speed, distance, and probability', 'calculator', TRUE, NOW(), NOW()),
(11, 'Logical Reasoning', 'logical-reasoning', 'Puzzles, series, syllogisms, blood relations, coding-decoding, and critical thinking', 'brain', TRUE, NOW(), NOW()),
(12, 'General Knowledge', 'general-knowledge', 'Current affairs, science, technology, history, geography, and general awareness', 'book-open', TRUE, NOW(), NOW());

-- 3. Core Subjects for each category
INSERT INTO subjects (category_id, name, slug, description, active, created_at, updated_at) VALUES
-- Java Programming
(1, 'Core Java Basics', 'core-java-basics', 'Syntax, data types, control flow, loops, and operators', TRUE, NOW(), NOW()),
(1, 'Object-Oriented Programming in Java', 'java-oops', 'Classes, objects, inheritance, polymorphism, encapsulation, and abstraction', TRUE, NOW(), NOW()),
(1, 'Java Collections Framework', 'java-collections', 'Lists, Sets, Maps, Queues, Iterators, and Comparators', TRUE, NOW(), NOW()),
(1, 'Java Multithreading & Concurrency', 'java-multithreading', 'Threads, synchronization, locks, and executors', TRUE, NOW(), NOW()),

-- Python Programming
(2, 'Python Fundamentals', 'python-fundamentals', 'Variables, data types, control structures, and functions', TRUE, NOW(), NOW()),
(2, 'Python Data Structures', 'python-data-structures', 'Lists, tuples, dictionaries, sets, and comprehensions', TRUE, NOW(), NOW()),
(2, 'Python OOP & Modules', 'python-oops-modules', 'Classes, inheritance, modules, packages, and exceptions', TRUE, NOW(), NOW()),

-- C Programming
(3, 'C Language Basics', 'c-language-basics', 'Data types, loops, conditionals, and functions', TRUE, NOW(), NOW()),
(3, 'Pointers & Memory Allocation', 'c-pointers-memory', 'Pointers, dynamic allocation with malloc/free, and pointer arithmetic', TRUE, NOW(), NOW()),
(3, 'Structures & File I/O in C', 'c-structures-file-io', 'Structs, unions, file handling, and preprocessor directives', TRUE, NOW(), NOW()),

-- Data Structures and Algorithms
(4, 'Linear Data Structures', 'linear-data-structures', 'Arrays, stacks, queues, and linked lists', TRUE, NOW(), NOW()),
(4, 'Non-Linear Data Structures', 'non-linear-data-structures', 'Binary trees, BST, heaps, and graphs', TRUE, NOW(), NOW()),
(4, 'Algorithms & Complexity', 'algorithms-complexity', 'Sorting, binary search, recursion, greedy, and dynamic programming', TRUE, NOW(), NOW()),

-- DBMS
(5, 'Relational Concepts & ER Modeling', 'relational-er-modeling', 'ER diagrams, relational schema, entities, and attributes', TRUE, NOW(), NOW()),
(5, 'Normalization & Schema Design', 'normalization-schema-design', '1NF, 2NF, 3NF, BCNF, and dependency preservation', TRUE, NOW(), NOW()),
(5, 'Transactions & Concurrency Control', 'transactions-concurrency', 'ACID properties, serializability, two-phase locking, and isolation levels', TRUE, NOW(), NOW()),

-- SQL
(6, 'SQL Queries & Clauses', 'sql-queries-clauses', 'SELECT, WHERE, GROUP BY, HAVING, and ORDER BY', TRUE, NOW(), NOW()),
(6, 'SQL Joins & Subqueries', 'sql-joins-subqueries', 'INNER JOIN, LEFT/RIGHT JOIN, FULL JOIN, and nested subqueries', TRUE, NOW(), NOW()),
(6, 'SQL DDL, DML & Constraints', 'sql-ddl-dml-constraints', 'CREATE, ALTER, INSERT, UPDATE, DELETE, and constraints', TRUE, NOW(), NOW()),

-- Operating Systems
(7, 'Processes & Threads', 'os-processes-threads', 'Process lifecycle, PCB, context switching, and multithreading', TRUE, NOW(), NOW()),
(7, 'CPU Scheduling & Deadlocks', 'os-scheduling-deadlocks', 'Scheduling algorithms, deadlock conditions, prevention, and avoidance', TRUE, NOW(), NOW()),
(7, 'Memory Management & Virtual Memory', 'os-memory-management', 'Paging, segmentation, page replacement, and TLB', TRUE, NOW(), NOW()),

-- Computer Networks
(8, 'Network Models & Architecture', 'cn-models-architecture', 'OSI 7 layers, TCP/IP stack, and network topologies', TRUE, NOW(), NOW()),
(8, 'IP Addressing & Subnetting', 'cn-addressing-subnetting', 'IPv4, IPv6, CIDR notation, subnet masks, and routing basics', TRUE, NOW(), NOW()),
(8, 'Transport & Application Protocols', 'cn-protocols', 'TCP, UDP, HTTP, HTTPS, DNS, DHCP, and FTP', TRUE, NOW(), NOW()),

-- Web Development
(9, 'HTML5 & CSS3 Essentials', 'web-html5-css3', 'Semantic tags, forms, flexbox, CSS grid, and responsive design', TRUE, NOW(), NOW()),
(9, 'Modern JavaScript (ES6+)', 'web-modern-javascript', 'Arrow functions, promises, async/await, closures, and DOM events', TRUE, NOW(), NOW()),
(9, 'Web Protocols & REST APIs', 'web-protocols-rest', 'HTTP methods, status codes, headers, CORS, and REST principles', TRUE, NOW(), NOW()),

-- Aptitude
(10, 'Arithmetic Aptitude', 'arithmetic-aptitude', 'Percentages, profit & loss, simple and compound interest, ratios', TRUE, NOW(), NOW()),
(10, 'Speed, Time & Work', 'speed-time-work', 'Time & work, pipes & cisterns, time, speed & distance, trains & boats', TRUE, NOW(), NOW()),

-- Logical Reasoning
(11, 'Deductive & Analytical Reasoning', 'deductive-analytical-reasoning', 'Syllogisms, seating arrangements, blood relations, and direction sense', TRUE, NOW(), NOW()),
(11, 'Series, Coding & Puzzles', 'series-coding-puzzles', 'Number series, letter series, coding-decoding, and analogy', TRUE, NOW(), NOW()),

-- General Knowledge
(12, 'Science & Technology Awareness', 'gk-science-technology', 'Computer science milestones, space, inventions, and emerging tech', TRUE, NOW(), NOW()),
(12, 'Current Affairs & General Studies', 'gk-current-general-studies', 'Global organizations, world geography, history, and current events', TRUE, NOW(), NOW());

