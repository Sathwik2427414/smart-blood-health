
-- Create donors table
CREATE TABLE public.donors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  contact TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  last_donation_date TEXT NOT NULL,
  eligible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blood_units table
CREATE TABLE public.blood_units (
  id TEXT PRIMARY KEY,
  donor_id TEXT REFERENCES public.donors(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  collected_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'expired', 'used')) DEFAULT 'available',
  lab_test_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lab_tests table
CREATE TABLE public.lab_tests (
  id TEXT PRIMARY KEY,
  blood_unit_id TEXT REFERENCES public.blood_units(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  date TEXT NOT NULL,
  hemoglobin NUMERIC NOT NULL,
  rbc_count NUMERIC NOT NULL,
  wbc_count NUMERIC NOT NULL,
  platelet_count NUMERIC NOT NULL,
  hematocrit NUMERIC NOT NULL,
  mcv NUMERIC NOT NULL,
  mch NUMERIC NOT NULL,
  mchc NUMERIC NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('pending', 'safe', 'abnormal')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create predictions table
CREATE TABLE public.predictions (
  id TEXT PRIMARY KEY,
  lab_test_id TEXT REFERENCES public.lab_tests(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  date TEXT NOT NULL,
  disease TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('normal', 'mild', 'moderate', 'severe')),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('alert', 'info', 'warning')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  donor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (no auth required)
CREATE POLICY "Allow all access to donors" ON public.donors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to blood_units" ON public.blood_units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lab_tests" ON public.lab_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to predictions" ON public.predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
