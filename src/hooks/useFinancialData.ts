import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type ExpenseRow, type ServiceRow, type OperationalRow, type RevenuePoint } from "@/data/financialData";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const sortByYearMonth = <T extends {month:string; ano:number}>(rows:T[]) =>
  [...rows].sort((a,b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });

export interface DateBounds { minDate: string; maxDate: string; }

export function useFinancialData() {
  const [revenue,     setRevenue]     = useState<RevenuePoint[]>([]);
  const [expenses,    setExpenses]    = useState<ExpenseRow[]>([]);
  const [services,    setServices]    = useState<ServiceRow[]>([]);
  const [cashFlow,    setCashFlow]    = useState<any[]>([]);
  const [operational, setOperational] = useState<OperationalRow[]>([]);
  const [dateBounds,  setDateBounds]  = useState<DateBounds>({ minDate: "", maxDate: "" });
  const [loading,     setLoading]     = useState(true);

  const fetchFresh = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    try {
      const [revRes, expRes, svcRes, opsRes, cfRes, boundsRes] = await Promise.all([
        supabase.from("monthly_revenue").select("month,ano,faturamento,despesas,lucro,desconto_total"),
        supabase.from("monthly_expenses").select(
          "month,ano,folha_pagamento,materiais_insumos,aluguel_condominio,equipamentos,marketing,impostos,outros,receitas_financeiras,despesas_financeiras,ir_csll,descontos_abatimentos"
        ),
        supabase.from("monthly_service_revenue").select("month,ano,consultas,exames,procedimentos,retornos,outros"),
        supabase.from("monthly_operational").select("month,ano,atendimentos,inadimplencia"),
        supabase.from("cash_flow").select("month,ano,entradas,saidas"),
        supabase.from("lancamentos").select("data").order("data", {ascending:true}).limit(1),
      ]);

      const maxRes = await supabase.from("lancamentos").select("data").order("data", {ascending:false}).limit(1);

      const CY = new Date().getFullYear();

      const parsedExpenses: ExpenseRow[] = sortByYearMonth(
        ((expRes.data ?? []) as any[]).map(e => ({
          month: e.month, ano: e.ano ?? CY,
          folhaPagamento:       e.folha_pagamento       ?? 0,
          materiaisInsumos:     e.materiais_insumos     ?? 0,
          aluguelCondominio:    e.aluguel_condominio    ?? 0,
          equipamentos:         e.equipamentos          ?? 0,
          marketing:            e.marketing             ?? 0,
          impostos:             e.impostos              ?? 0,
          outros:               e.outros                ?? 0,
          receitasFinanceiras:  e.receitas_financeiras  ?? 0,
          despesasFinanceiras:  e.despesas_financeiras  ?? 0,
          irCsll:               e.ir_csll               ?? 0,
          descontosAbatimentos: e.descontos_abatimentos ?? 0,
        } satisfies ExpenseRow))
      );

      const minDate = boundsRes.data?.[0]?.data ? String(boundsRes.data[0].data).split("T")[0] : "";
      const maxDate = maxRes.data?.[0]?.data     ? String(maxRes.data[0].data).split("T")[0]   : "";

      setRevenue(sortByYearMonth(((revRes.data ?? []) as any[]).map(r => ({...r, ano: r.ano ?? CY}))) as RevenuePoint[]);
      setExpenses(parsedExpenses);
      setServices(sortByYearMonth(((svcRes.data ?? []) as any[]).map(r => ({...r, ano: r.ano ?? CY}))) as ServiceRow[]);
      setOperational(sortByYearMonth(((opsRes.data ?? []) as any[]).map(r => ({...r, ano: r.ano ?? CY}))) as OperationalRow[]);
      setCashFlow(sortByYearMonth(((cfRes.data ?? []) as any[]).map(r => ({...r, ano: r.ano ?? CY}))));
      setDateBounds({ minDate, maxDate });
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Limpa qualquer cache legado
    try {
      localStorage.removeItem("clinica_financial_cache_v5");
      localStorage.removeItem("clinica_financial_cache_v4");
      localStorage.removeItem("clinica_financial_cache_v3");
    } catch {}
    fetchFresh(true);
  }, [fetchFresh]);

  useEffect(() => {
    const handler = () => {
      console.log('[Dashboard] Data updated — refreshing...');
      fetchFresh(false);
    };
    window.addEventListener('clinica_data_updated', handler);
    return () => window.removeEventListener('clinica_data_updated', handler);
  }, [fetchFresh]);

  const refetch = useCallback(async () => {
    await fetchFresh(true);
  }, [fetchFresh]);

  return { revenue, expenses, services, cashFlow, operational, dateBounds, loading, refetch };
}
