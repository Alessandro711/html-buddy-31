-- Create tables for financial data

CREATE TABLE public.monthly_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  faturamento NUMERIC NOT NULL DEFAULT 0,
  despesas NUMERIC NOT NULL DEFAULT 0,
  lucro NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.monthly_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  folha_pagamento NUMERIC NOT NULL DEFAULT 0,
  materiais_insumos NUMERIC NOT NULL DEFAULT 0,
  aluguel_condominio NUMERIC NOT NULL DEFAULT 0,
  equipamentos NUMERIC NOT NULL DEFAULT 0,
  marketing NUMERIC NOT NULL DEFAULT 0,
  impostos NUMERIC NOT NULL DEFAULT 0,
  outros NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.monthly_service_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  consultas NUMERIC NOT NULL DEFAULT 0,
  exames NUMERIC NOT NULL DEFAULT 0,
  procedimentos NUMERIC NOT NULL DEFAULT 0,
  retornos NUMERIC NOT NULL DEFAULT 0,
  outros NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.monthly_operational (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  atendimentos INTEGER NOT NULL DEFAULT 0,
  inadimplencia NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.cash_flow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  entradas NUMERIC NOT NULL DEFAULT 0,
  saidas NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_service_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_operational ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read monthly_revenue" ON public.monthly_revenue FOR SELECT USING (true);
CREATE POLICY "Anyone can read monthly_expenses" ON public.monthly_expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can read monthly_service_revenue" ON public.monthly_service_revenue FOR SELECT USING (true);
CREATE POLICY "Anyone can read monthly_operational" ON public.monthly_operational FOR SELECT USING (true);
CREATE POLICY "Anyone can read cash_flow" ON public.cash_flow FOR SELECT USING (true);

CREATE POLICY "Anyone can insert monthly_revenue" ON public.monthly_revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update monthly_revenue" ON public.monthly_revenue FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete monthly_revenue" ON public.monthly_revenue FOR DELETE USING (true);

CREATE POLICY "Anyone can insert monthly_expenses" ON public.monthly_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update monthly_expenses" ON public.monthly_expenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete monthly_expenses" ON public.monthly_expenses FOR DELETE USING (true);

CREATE POLICY "Anyone can insert monthly_service_revenue" ON public.monthly_service_revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update monthly_service_revenue" ON public.monthly_service_revenue FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete monthly_service_revenue" ON public.monthly_service_revenue FOR DELETE USING (true);

CREATE POLICY "Anyone can insert monthly_operational" ON public.monthly_operational FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update monthly_operational" ON public.monthly_operational FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete monthly_operational" ON public.monthly_operational FOR DELETE USING (true);

CREATE POLICY "Anyone can insert cash_flow" ON public.cash_flow FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cash_flow" ON public.cash_flow FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cash_flow" ON public.cash_flow FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_monthly_revenue_updated_at BEFORE UPDATE ON public.monthly_revenue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_expenses_updated_at BEFORE UPDATE ON public.monthly_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_service_revenue_updated_at BEFORE UPDATE ON public.monthly_service_revenue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_operational_updated_at BEFORE UPDATE ON public.monthly_operational FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cash_flow_updated_at BEFORE UPDATE ON public.cash_flow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();