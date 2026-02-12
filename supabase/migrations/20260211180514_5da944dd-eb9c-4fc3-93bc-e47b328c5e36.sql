
-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  pricing_type TEXT NOT NULL DEFAULT 'fixed',
  price NUMERIC NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings table (single row)
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Salão de Festas',
  business_description TEXT NOT NULL DEFAULT 'Monte seu orçamento personalizado',
  whatsapp_number TEXT NOT NULL DEFAULT '5511999999999',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom pricing types
CREATE TABLE public.custom_pricing_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  unit_label TEXT NOT NULL DEFAULT '',
  has_quantity BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.store_settings (business_name, business_description, whatsapp_number)
VALUES ('Salão de Festas', 'Monte seu orçamento personalizado', '5511999999999');

-- Insert default services
INSERT INTO public.services (name, description, pricing_type, price, note, active) VALUES
  ('Aluguel do Salão', 'Uso exclusivo do espaço por período completo', 'fixed', 3500, 'Inclui 8 horas de uso', true),
  ('Cadeiras Extras', 'Cadeiras estofadas de alta qualidade', 'per_quantity', 15, 'Mínimo de 10 unidades', true),
  ('Mesas Redondas', 'Mesas para 8 pessoas com toalha', 'per_quantity', 80, '', true),
  ('DJ Profissional', 'DJ com equipamento completo de som e luz', 'per_hour', 150, 'Mínimo de 4 horas', true),
  ('Iluminação Decorativa', 'Iluminação cênica com LED e spots', 'per_hour', 100, '', true),
  ('Decoração Personalizada', 'Projeto decorativo exclusivo para seu evento', 'on_request', 0, 'Valor definido após briefing', true);

-- RLS: services and settings are publicly readable
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pricing_types ENABLE ROW LEVEL SECURITY;

-- Public read for all tables
CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public can read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public can read custom pricing types" ON public.custom_pricing_types FOR SELECT USING (true);

-- Authenticated users can manage all tables
CREATE POLICY "Auth users can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update services" ON public.services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete services" ON public.services FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can update settings" ON public.store_settings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can insert pricing types" ON public.custom_pricing_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update pricing types" ON public.custom_pricing_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete pricing types" ON public.custom_pricing_types FOR DELETE TO authenticated USING (true);
