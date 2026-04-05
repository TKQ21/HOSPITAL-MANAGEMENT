
CREATE TABLE public.permission_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL DEFAULT 'Patient',
  question TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'policies',
  status TEXT NOT NULL DEFAULT 'pending',
  doctor_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own permission requests"
ON public.permission_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own permission requests"
ON public.permission_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can view all permission requests"
ON public.permission_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can update permission requests"
ON public.permission_requests FOR UPDATE
TO authenticated
USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.permission_requests;
