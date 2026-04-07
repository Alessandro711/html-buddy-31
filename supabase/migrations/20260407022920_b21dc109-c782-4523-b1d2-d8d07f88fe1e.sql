
-- Step 1: Add columns first
ALTER TABLE public.monthly_revenue ADD COLUMN IF NOT EXISTS ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now());
ALTER TABLE public.monthly_revenue ADD COLUMN IF NOT EXISTS desconto_total numeric NOT NULL DEFAULT 0;

ALTER TABLE public.monthly_expenses ADD COLUMN IF NOT EXISTS ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now());
ALTER TABLE public.monthly_expenses ADD COLUMN IF NOT EXISTS receitas_financeiras numeric NOT NULL DEFAULT 0;
ALTER TABLE public.monthly_expenses ADD COLUMN IF NOT EXISTS despesas_financeiras numeric NOT NULL DEFAULT 0;
ALTER TABLE public.monthly_expenses ADD COLUMN IF NOT EXISTS ir_csll numeric NOT NULL DEFAULT 0;
ALTER TABLE public.monthly_expenses ADD COLUMN IF NOT EXISTS descontos_abatimentos numeric NOT NULL DEFAULT 0;

ALTER TABLE public.monthly_service_revenue ADD COLUMN IF NOT EXISTS ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now());
ALTER TABLE public.monthly_operational ADD COLUMN IF NOT EXISTS ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now());
ALTER TABLE public.cash_flow ADD COLUMN IF NOT EXISTS ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now());

-- Step 2: Drop old constraints then create new unique indexes
ALTER TABLE public.monthly_revenue DROP CONSTRAINT IF EXISTS monthly_revenue_month_key;
CREATE UNIQUE INDEX IF NOT EXISTS monthly_revenue_month_ano_key ON public.monthly_revenue(month, ano);

ALTER TABLE public.monthly_expenses DROP CONSTRAINT IF EXISTS monthly_expenses_month_key;
CREATE UNIQUE INDEX IF NOT EXISTS monthly_expenses_month_ano_key ON public.monthly_expenses(month, ano);

ALTER TABLE public.monthly_service_revenue DROP CONSTRAINT IF EXISTS monthly_service_revenue_month_key;
CREATE UNIQUE INDEX IF NOT EXISTS monthly_service_revenue_month_ano_key ON public.monthly_service_revenue(month, ano);

ALTER TABLE public.monthly_operational DROP CONSTRAINT IF EXISTS monthly_operational_month_key;
CREATE UNIQUE INDEX IF NOT EXISTS monthly_operational_month_ano_key ON public.monthly_operational(month, ano);

ALTER TABLE public.cash_flow DROP CONSTRAINT IF EXISTS cash_flow_month_key;
CREATE UNIQUE INDEX IF NOT EXISTS cash_flow_month_ano_key ON public.cash_flow(month, ano);

-- Step 3: Create lancamentos table
CREATE TABLE IF NOT EXISTS public.lancamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data date NOT NULL,
  mes text NOT NULL,
  ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  descricao text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'despesa',
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pago',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lancamentos" ON public.lancamentos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lancamentos" ON public.lancamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lancamentos" ON public.lancamentos FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lancamentos" ON public.lancamentos FOR DELETE USING (true);

CREATE TRIGGER update_lancamentos_updated_at
  BEFORE UPDATE ON public.lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
