-- AcademiTrack Database Schema
-- Run this on your Railway PostgreSQL instance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Moderators / Admins
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(60) DEFAULT 'Moderator', -- Moderator | Senior Moderator | Super Admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  reg_number VARCHAR(60) UNIQUE NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  academic_level VARCHAR(60) NOT NULL, -- Bachelor's Degree | Master's Degree | PhD / Postgraduate
  department VARCHAR(120) NOT NULL,
  research_topic VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL, -- Proposal | Results | Presentation | Publication
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  current_level VARCHAR(60) DEFAULT 'Department', -- Department | School Faculty | Postgraduate Board
  status VARCHAR(30) DEFAULT 'Submitted', -- Submitted | Reviewing | Approved | Rejected
  ai_score INTEGER DEFAULT 0,
  ai_feedback TEXT,
  manual_score INTEGER DEFAULT 0,
  moderator_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submission Level History
CREATE TABLE IF NOT EXISTS submission_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  level VARCHAR(60) NOT NULL,
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_by UUID REFERENCES moderators(id) ON DELETE SET NULL,
  recipient_type VARCHAR(20) DEFAULT 'all', -- all | student
  recipient_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (student -> moderator)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  reply TEXT,
  replied_by UUID REFERENCES moderators(id) ON DELETE SET NULL,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default Super Admin (password: Admin@1234)
-- Change this password immediately after first login!
INSERT INTO moderators (name, username, email, password_hash, role)
VALUES (
  'Super Administrator',
  'superadmin',
  'admin@academitrack.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCFlAgMdm',
  'Super Admin'
) ON CONFLICT (username) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_sub_history_sub ON submission_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_notifs_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);
