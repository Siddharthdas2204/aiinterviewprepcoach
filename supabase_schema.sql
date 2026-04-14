-- SQL Schema for AI Interview Coach

-- 1. Create Users Table (extends Supabase Auth)
CREATE TABLE public.users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Sessions Table
CREATE TABLE public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  job_role text NOT NULL,
  company_type text NOT NULL,
  difficulty text NOT NULL,
  overall_score integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Questions Table
CREATE TABLE public.questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  step_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Answers Table
CREATE TABLE public.answers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_answer text NOT NULL,
  score integer CHECK (score >= 1 AND score <= 10),
  feedback_good text,
  feedback_missing text,
  ideal_answer text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for Sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for Questions (users can view questions associated with their sessions)
CREATE POLICY "Users can view questions of their sessions" ON public.questions
  FOR SELECT USING (
    session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert questions to their sessions" ON public.questions
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid())
  );

-- Policies for Answers
CREATE POLICY "Users can view answers of their questions" ON public.answers
  FOR SELECT USING (
    question_id IN (
      SELECT id FROM public.questions WHERE session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert answers" ON public.answers
  FOR INSERT WITH CHECK (
    question_id IN (
      SELECT id FROM public.questions WHERE session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid())
    )
  );

-- Trigger to automatically create user profile when signing up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
