
-- Settings table to persist clinic settings per user
CREATE TABLE public.clinic_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_name TEXT NOT NULL DEFAULT 'City Health Clinic',
  address TEXT NOT NULL DEFAULT '123 Main Street, City Center',
  phone TEXT NOT NULL DEFAULT '011-12345678',
  doctor_name TEXT NOT NULL DEFAULT 'Dr. Sharma',
  specialization TEXT NOT NULL DEFAULT 'General Physician',
  fees TEXT NOT NULL DEFAULT '500',
  follow_up_fees TEXT NOT NULL DEFAULT '200',
  timings TEXT NOT NULL DEFAULT '10:00 AM - 6:00 PM',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.clinic_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.clinic_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.clinic_settings FOR UPDATE USING (auth.uid() = user_id);
