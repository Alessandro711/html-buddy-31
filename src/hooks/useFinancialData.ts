import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  monthlyRevenue as defaultRevenue,
  monthlyExpenseBreakdown as defaultExpenses,
  monthlyServiceRevenue as defaultServices,
  cashFlowData as defaultCashFlow,
} from "@/data/financialData";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface MonthlyRevenueRow {
  month: string;
  faturamento: number;
  despesas: number;
  lucro: number;
}

interface MonthlyExpenseRow {
  month: string;
  folha_pagamento: number;
  materiais_insumos: number;
  aluguel_condominio: number;
  equipamentos: number;
  marketing: number;
  impostos: number;
  outros: number;
}

interface MonthlyServiceRow {
  month: string;
  consultas: number;
  exames: number;
  procedimentos: number;
  retornos: number;
  outros: number;
}

interface MonthlyOperationalRow {
  month: string;
  atendimentos: number;
  inadimplencia: number;
}

interface CashFlowRow {
  month: string;
  entradas: number;
  saidas: number;
}

const sortByMonth = <T extends { month: string }>(rows: T[]) =>
  [...rows].sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

export function useFinancialData() {
  const [revenue, setRevenue] = useState(defaultRevenue);
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [services, setServices] = useState(
    defaultServices.map((s) => ({
      month: s.month,
      consultas: s.consultas,
      exames: s.exames,
      procedimentos: s.procedimentos,
      retornos: s.retornos,
      outros: s.outros,
    }))
  );
  const [cashFlow, setCashFlow] = useState(defaultCashFlow);
  const [operational, setOperational] = useState<MonthlyOperationalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, expRes, svcRes, opsRes, cfRes] = await Promise.all([
        supabase.from("monthly_revenue").select("month, faturamento, despesas, lucro"),
        supabase.from("monthly_expenses").select("month, folha_pagamento, materiais_insumos, aluguel_condominio, equipamentos, marketing, impostos, outros"),
        supabase.from("monthly_service_revenue").select("month, consultas, exames, procedimentos, retornos, outros"),
        supabase.from("monthly_operational").select("month, atendimentos, inadimplencia"),
        supabase.from("cash_flow").select("month, entradas, saidas"),
      ]);

      if (revRes.data?.length) {
        setRevenue(sortByMonth(revRes.data as MonthlyRevenueRow[]));
      }
      if (expRes.data?.length) {
        setExpenses(
          sortByMonth(
            (expRes.data as MonthlyExpenseRow[]).map((e) => ({
              month: e.month,
              folhaPagamento: e.folha_pagamento,
              materiaisInsumos: e.materiais_insumos,
              aluguelCondominio: e.aluguel_condominio,
              equipamentos: e.equipamentos,
              marketing: e.marketing,
              impostos: e.impostos,
              outros: e.outros,
            }))
          )
        );
      }
      if (svcRes.data?.length) {
        setServices(sortByMonth(svcRes.data as MonthlyServiceRow[]));
      }
      if (opsRes.data?.length) {
        setOperational(sortByMonth(opsRes.data as MonthlyOperationalRow[]));
      }
      if (cfRes.data?.length) {
        setCashFlow(sortByMonth(cfRes.data as CashFlowRow[]));
      }
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { revenue, expenses, services, cashFlow, operational, loading, refetch: fetchData };
}
