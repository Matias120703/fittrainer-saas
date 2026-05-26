-- ============================================================
-- FitTrainer SaaS — Schema completo
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('trainer', 'client')),
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINERS
CREATE TABLE IF NOT EXISTS public.trainers (
  id            UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio           TEXT,
  specialties   TEXT[],
  instagram_url TEXT,
  website_url   TEXT
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id),
  full_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  birth_date  DATE,
  weight_kg   NUMERIC(5,2),
  height_cm   NUMERIC(5,1),
  goal        TEXT,
  notes       TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  plan_type   TEXT DEFAULT 'basic',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- EXERCISES
CREATE TABLE IF NOT EXISTS public.exercises (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by         UUID REFERENCES public.trainers(id),
  name               TEXT NOT NULL,
  muscle_group       TEXT NOT NULL,
  secondary_muscles  TEXT[],
  description        TEXT,
  video_url          TEXT,
  image_url          TEXT,
  is_global          BOOLEAN DEFAULT FALSE
);

-- ROUTINES
CREATE TABLE IF NOT EXISTS public.routines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  difficulty    TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_days INTEGER,
  is_template   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ROUTINE EXERCISES
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id      UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES public.exercises(id),
  day_number      INTEGER NOT NULL,
  sets            INTEGER NOT NULL,
  reps            TEXT NOT NULL,
  rest_seconds    INTEGER DEFAULT 60,
  weight_notes    TEXT,
  notes           TEXT,
  order_index     INTEGER NOT NULL
);

-- CLIENT ROUTINES (asignaciones)
CREATE TABLE IF NOT EXISTS public.client_routines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  routine_id    UUID NOT NULL REFERENCES public.routines(id),
  assigned_at   TIMESTAMPTZ DEFAULT NOW(),
  start_date    DATE,
  end_date      DATE,
  is_active     BOOLEAN DEFAULT TRUE
);

-- WORKOUT LOGS
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_routine_id   UUID REFERENCES public.client_routines(id),
  day_number          INTEGER,
  completed_at        TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes    INTEGER,
  perceived_effort    INTEGER CHECK (perceived_effort BETWEEN 1 AND 10),
  notes               TEXT
);

-- EXERCISE LOGS
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id       UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  routine_exercise_id  UUID REFERENCES public.routine_exercises(id),
  sets_completed       INTEGER,
  reps_completed       TEXT,
  weight_kg            NUMERIC(6,2),
  notes                TEXT
);

-- CLIENT PROGRESS
CREATE TABLE IF NOT EXISTS public.client_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  recorded_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg     NUMERIC(5,2),
  body_fat_pct  NUMERIC(4,1),
  notes         TEXT
);

-- PROGRESS PHOTOS
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES public.client_progress(id),
  photo_url   TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES public.trainers(id),
  client_id       UUID NOT NULL REFERENCES public.clients(id),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, client_id)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id),
  content         TEXT,
  image_url       TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES public.trainers(id),
  client_id   UUID REFERENCES public.clients(id),
  title       TEXT NOT NULL,
  description TEXT,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  type        TEXT DEFAULT 'session' CHECK (type IN ('session', 'reminder', 'rest', 'other')),
  color       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  type        TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_routines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRAINERS
CREATE POLICY "trainers_select_own" ON public.trainers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "trainers_insert_own" ON public.trainers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "trainers_update_own" ON public.trainers FOR UPDATE USING (auth.uid() = id);

-- CLIENTS: trainer ve los suyos, cliente ve su propio registro
CREATE POLICY "clients_trainer_all" ON public.clients
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "clients_self_select" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- EXERCISES: trainer ve los suyos + globales
CREATE POLICY "exercises_trainer_manage" ON public.exercises
  FOR ALL USING (created_by = auth.uid() OR is_global = TRUE);

-- ROUTINES: trainer gestiona las suyas
CREATE POLICY "routines_trainer_manage" ON public.routines
  FOR ALL USING (trainer_id = auth.uid());

-- Cliente ve sus rutinas asignadas
CREATE POLICY "routines_client_view" ON public.routines
  FOR SELECT USING (
    id IN (
      SELECT cr.routine_id FROM public.client_routines cr
      JOIN public.clients c ON c.id = cr.client_id
      WHERE c.user_id = auth.uid() AND cr.is_active = TRUE
    )
  );

-- ROUTINE EXERCISES
CREATE POLICY "routine_exercises_trainer" ON public.routine_exercises
  FOR ALL USING (
    routine_id IN (SELECT id FROM public.routines WHERE trainer_id = auth.uid())
  );

CREATE POLICY "routine_exercises_client_view" ON public.routine_exercises
  FOR SELECT USING (
    routine_id IN (
      SELECT cr.routine_id FROM public.client_routines cr
      JOIN public.clients c ON c.id = cr.client_id
      WHERE c.user_id = auth.uid() AND cr.is_active = TRUE
    )
  );

-- CLIENT ROUTINES
CREATE POLICY "client_routines_trainer" ON public.client_routines
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE trainer_id = auth.uid())
  );

CREATE POLICY "client_routines_client_view" ON public.client_routines
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- WORKOUT LOGS
CREATE POLICY "workout_logs_trainer_view" ON public.workout_logs
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE trainer_id = auth.uid())
  );

CREATE POLICY "workout_logs_client_all" ON public.workout_logs
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- CLIENT PROGRESS
CREATE POLICY "progress_trainer_view" ON public.client_progress
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE trainer_id = auth.uid())
  );

CREATE POLICY "progress_client_all" ON public.client_progress
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- CONVERSATIONS
CREATE POLICY "conversations_trainer" ON public.conversations
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "conversations_client_view" ON public.conversations
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- MESSAGES
CREATE POLICY "messages_participants" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE trainer_id = auth.uid()
         OR client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

-- CALENDAR EVENTS
CREATE POLICY "calendar_trainer_all" ON public.calendar_events
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "calendar_client_view" ON public.calendar_events
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- NOTIFICATIONS
CREATE POLICY "notifications_owner" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- REALTIME (para chat)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ============================================================
-- TRIGGER: crear perfil automáticamente en auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
