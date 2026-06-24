
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS anonymous_user_id text;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS anonymous_user_id text;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS anonymous_user_id text;
ALTER TABLE public.gpa_records ADD COLUMN IF NOT EXISTS anonymous_user_id text;

CREATE INDEX IF NOT EXISTS tasks_anon_user_idx ON public.tasks(anonymous_user_id);
CREATE INDEX IF NOT EXISTS subjects_anon_user_idx ON public.subjects(anonymous_user_id);
CREATE INDEX IF NOT EXISTS attendance_anon_user_idx ON public.attendance_records(anonymous_user_id);
CREATE INDEX IF NOT EXISTS gpa_anon_user_idx ON public.gpa_records(anonymous_user_id);
