
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  credit_hours INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present','absent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gpa_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  credit_hours NUMERIC NOT NULL DEFAULT 3,
  grade_point NUMERIC NOT NULL,
  semester TEXT DEFAULT 'Semester 1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gpa_records TO anon, authenticated;
GRANT ALL ON public.subjects, public.tasks, public.attendance_records, public.gpa_records TO service_role;

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpa_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public all subjects" ON public.subjects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public all tasks" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public all attendance" ON public.attendance_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public all gpa" ON public.gpa_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
