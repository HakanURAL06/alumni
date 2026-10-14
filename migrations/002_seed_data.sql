-- ==========================================
-- Migration 002: Seed Initial Data
-- Populates initial users and announcements
-- ==========================================

-- Seed Users (if table is empty)
INSERT INTO users (name, department, graduation_year, email)
SELECT 'Hakan Ural', 'Computer Engineering', 2024, 'hakan@alumni.edu'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hakan@alumni.edu');

INSERT INTO users (name, department, graduation_year, email)
SELECT 'Ayşe Yılmaz', 'Industrial Engineering', 2023, 'ayse@alumni.edu'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ayse@alumni.edu');

INSERT INTO users (name, department, graduation_year, email)
SELECT 'Mehmet Demir', 'Electrical & Electronics Engineering', 2022, 'mehmet@alumni.edu'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mehmet@alumni.edu');

-- Seed Announcements (if table is empty)
INSERT INTO announcements (title, content, category, author, publication_date)
SELECT 
    'Annual Alumni Homecoming 2026', 
    'Join us on campus for keynote speeches, networking cocktails, and department visits.', 
    'Event', 
    'Alumni Office', 
    '2026-10-15'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Annual Alumni Homecoming 2026');

INSERT INTO announcements (title, content, category, author, publication_date)
SELECT 
    'Tech Career Fair & Mentorship Days', 
    'Leading companies in technology and engineering are hiring alumni and recent graduates.', 
    'Career', 
    'Career Center', 
    '2026-11-01'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Tech Career Fair & Mentorship Days');

INSERT INTO announcements (title, content, category, author, publication_date)
SELECT 
    'New Graduate Scholarship Program', 
    'Applications for postgraduate research scholarships are now open for alumni members.', 
    'Academic', 
    'Dean of Engineering', 
    '2026-11-20'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'New Graduate Scholarship Program');
