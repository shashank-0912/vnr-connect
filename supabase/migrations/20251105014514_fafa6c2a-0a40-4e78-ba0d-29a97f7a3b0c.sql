-- VNR Connect Database Schema
-- Phase 1: Core tables for MVP

-- Create enums
CREATE TYPE app_role AS ENUM ('GUEST', 'STUDENT', 'ALUMNI', 'FACULTY', 'MODERATOR', 'ADMIN');
CREATE TYPE resource_type AS ENUM ('NOTES', 'OLD_PAPER', 'MODEL_PAPER', 'CONCEPTS', 'EXTRA');
CREATE TYPE query_category AS ENUM ('ACADEMICS', 'INTERNSHIPS', 'ADMIN', 'PROJECT', 'EVENTS');
CREATE TYPE query_status AS ENUM ('OPEN', 'SOLVED');

-- Users/Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  image TEXT,
  role app_role DEFAULT 'STUDENT',
  branch TEXT,
  year INTEGER,
  company TEXT,
  batch TEXT,
  headline TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Badge assignments
CREATE TABLE badge_assignments (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  given_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Resources (Academic Hub)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type resource_type NOT NULL,
  file_url TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester INTEGER NOT NULL,
  subject TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ
);

-- Queries (Ask VNR)
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category query_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  anonymous BOOLEAN DEFAULT FALSE,
  status query_status DEFAULT 'OPEN',
  votes INTEGER DEFAULT 0,
  flags INTEGER DEFAULT 0,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Replies to queries
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alumni posts (Experience Hub)
CREATE TABLE alumni_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  difficulty TEXT,
  year INTEGER,
  content TEXT NOT NULL,
  questions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  organizer TEXT NOT NULL,
  eligibility TEXT,
  link TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship rooms
CREATE TABLE mentorship_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  member_ids TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  room_id UUID REFERENCES mentorship_rooms(id),
  meet_url TEXT,
  notes_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internships
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  link TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  recommended_by_alumni BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation log
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  action TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  seen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Public read, users update own
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Badges: Public read
CREATE POLICY "Badges viewable by all" 
  ON badges FOR SELECT USING (true);

CREATE POLICY "Badge assignments viewable by all" 
  ON badge_assignments FOR SELECT USING (true);

-- Resources: Public read, authenticated upload, moderators verify
CREATE POLICY "Resources viewable by all" 
  ON resources FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload" 
  ON resources FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users update own unverified resources" 
  ON resources FOR UPDATE 
  USING (auth.uid() = uploaded_by AND verified = FALSE);

-- Queries: Public read non-hidden, authenticated create
CREATE POLICY "Non-hidden queries viewable by all" 
  ON queries FOR SELECT 
  USING (hidden = FALSE OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can post queries" 
  ON queries FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update own queries" 
  ON queries FOR UPDATE 
  USING (auth.uid() = author_id);

-- Replies: Public read, authenticated create
CREATE POLICY "Replies viewable by all" 
  ON replies FOR SELECT USING (true);

CREATE POLICY "Authenticated users can reply" 
  ON replies FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

-- Alumni posts: Public read, alumni create
CREATE POLICY "Alumni posts viewable by all" 
  ON alumni_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create alumni posts" 
  ON alumni_posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" 
  ON alumni_posts FOR UPDATE 
  USING (auth.uid() = author_id);

-- Events: Public read, authenticated create
CREATE POLICY "Events viewable by all" 
  ON events FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" 
  ON events FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Mentorship rooms: Members can view, authenticated create
CREATE POLICY "Mentorship rooms viewable by members or public" 
  ON mentorship_rooms FOR SELECT 
  USING (is_private = FALSE OR auth.uid()::TEXT = ANY(member_ids));

CREATE POLICY "Authenticated users can create rooms" 
  ON mentorship_rooms FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Bookings: Participants can view, authenticated create
CREATE POLICY "Participants can view bookings" 
  ON bookings FOR SELECT 
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Authenticated users can create bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

-- Internships: Public read, authenticated create
CREATE POLICY "Internships viewable by all" 
  ON internships FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post internships" 
  ON internships FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Moderation logs: Moderators only
CREATE POLICY "Moderation logs admin only" 
  ON moderation_logs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('MODERATOR', 'ADMIN')
    )
  );

-- Notifications: Users see own
CREATE POLICY "Users see own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE queries;
ALTER PUBLICATION supabase_realtime ADD TABLE replies;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;