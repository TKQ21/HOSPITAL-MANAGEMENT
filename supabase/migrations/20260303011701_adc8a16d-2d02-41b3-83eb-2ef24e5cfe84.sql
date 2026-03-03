
-- Departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  head_doctor TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update departments" ON public.departments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete departments" ON public.departments FOR DELETE TO authenticated USING (true);

-- Beds table
CREATE TABLE public.beds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bed_number TEXT NOT NULL,
  ward_type TEXT NOT NULL DEFAULT 'General',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  patient_name TEXT,
  patient_phone TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  admitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view beds" ON public.beds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert beds" ON public.beds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update beds" ON public.beds FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete beds" ON public.beds FOR DELETE TO authenticated USING (true);

-- Discharge summaries table
CREATE TABLE public.discharge_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  admission_date TEXT NOT NULL,
  discharge_date TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  medications TEXT,
  follow_up_instructions TEXT,
  doctor_name TEXT NOT NULL,
  department TEXT,
  clinical_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view discharge_summaries" ON public.discharge_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert discharge_summaries" ON public.discharge_summaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update discharge_summaries" ON public.discharge_summaries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete discharge_summaries" ON public.discharge_summaries FOR DELETE TO authenticated USING (true);

-- Billing table
CREATE TABLE public.billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view billing" ON public.billing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert billing" ON public.billing FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update billing" ON public.billing FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete billing" ON public.billing FOR DELETE TO authenticated USING (true);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_beds_status ON public.beds(status);
CREATE INDEX idx_beds_ward_type ON public.beds(ward_type);
CREATE INDEX idx_billing_payment_status ON public.billing(payment_status);
CREATE INDEX idx_discharge_summaries_status ON public.discharge_summaries(status);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_patients_phone ON public.patients(phone);

-- Triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON public.beds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discharge_summaries_updated_at BEFORE UPDATE ON public.discharge_summaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
