
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS forma_pagamento text NOT NULL DEFAULT 'Pix';
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS desconto numeric NOT NULL DEFAULT 0;
