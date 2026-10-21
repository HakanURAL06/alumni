-- ==========================================
-- Migration 003: Create Job Postings Table & Indexes
-- Alumni Tracking System - PostgreSQL Schema
-- ==========================================

-- 1. Create 'job_postings' table (Career & Internship Listings)
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL DEFAULT 'Remote',
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time' CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')),
    description TEXT DEFAULT '',
    requirements TEXT DEFAULT '',
    salary VARCHAR(100) DEFAULT NULL,
    contact_email VARCHAR(255) NOT NULL,
    posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Closed', 'Draft')),
    application_deadline DATE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Indexes for fast query and filtering performance
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings(job_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);

-- 3. Automatic updated_at timestamp trigger
DROP TRIGGER IF EXISTS trg_job_postings_updated_at ON job_postings;
CREATE TRIGGER trg_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
