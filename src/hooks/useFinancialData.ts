import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type ExpenseRow, type ServiceRow, type OperationalRow, type RevenuePoint } from "@/data/financialData";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const sortByYearMonth = <T extends {month:string; ano:number}>(rows:T[]) =>
  [...rows].sort((a,b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });

// ── LocalStorage cache ────────────────────────────────────────────────────────
const CACHE_KEY = "clinica_financial_cache_v5";
const CACHE_TTL = 5 * 60 * 1000;

function saveCache(data: object) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

export interface DateBounds { minDate: string; maxDate: string; }

export function useFinancialData() {
  const [revenue,     setRevenue]     = useState<RevenuePoint[]>([]);
  const [expenses,    setExpenses]    = useState<ExpenseRow[]>([]);
  const [services,    setServices]    = useState<ServiceRow[]>([]);
  const [cashFlow,    setCashFlow]    = useState<any[]>([]);
  const [operational, setOperational] = useState<OperationalRow[]>([]);
  const [dateBounds,  setDateBounds]  = useState<DateBounds>({ minDate: "", maxDate: "" });
  const [loading,     setLoading]     = useState(true);

  const applyData = useCallback((d: any) => {
    if (d.revenue?.length)     setRevenue(d.revenue);
    if (d.expenses?.length)    setExpenses(d.expenses);
    if (d.services?.length)    setServices(d.services);
    if (d.operational?.length) setOperational(d.operational);
    if (d.cashFlow?.length)    setCashFlow(d.cashFlow);
    if (d.dateBounds?.minDate) setDateBounds(d.dateBounds);
  }, []);

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

      const parsedExpenses = expRes.data?.length ? sortByYearMonth(
        (expRes.data as any[]).map(e => ({
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
      ) : [];

      const minDate = boundsRes.data?.[0]?.data ? String(boundsRes.data[0].data).split("T")[0] : "";
      const maxDate = maxRes.data?.[0]?.data     ? String(maxRes.data[0].data).split("T")[0]   : "";

      const fresh = {
        revenue:     revRes.data?.length ? sortByYearMonth(revRes.data.map((r:any) => ({...r, ano: r.ano ?? CY})) as any) : [],
        expenses:    parsedExpenses,
        services:    svcRes.data?.length ? sortByYearMonth(svcRes.data.map((r:any) => ({...r, ano: r.ano ?? CY})) as ServiceRow[]) : [],
        operational: opsRes.data?.length ? sortByYearMonth(opsRes.data.map((r:any) => ({...r, ano: r.ano ?? CY})) as OperationalRow[]) : [],
        cashFlow:    cfRes.data?.length  ? sortByYearMonth(cfRes.data.map((r:any) => ({...r, ano: r.ano ?? CY})) as any[]) : [],
        dateBounds:  { minDate, maxDate },
      };

      saveCache(fresh);
      applyData(fresh);
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, [applyData]);

  const fetchData = useCallback(async () => {
    const cached = loadCache();
    if (cached) {
      applyData(cached);
      setLoading(false);
      fetchFresh(false);
      return;
    }
    await fetchFresh(true);
  }, [fetchFresh, applyData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = () => {
      console.log('[Dashboard] Data updated — refreshing...');
      fetchFresh(false);
    };
    window.addEventListener('clinica_data_updated', handler);
    return () => window.removeEventListener('clinica_data_updated', handler);
  }, [fetchFresh]);

  const refetch = useCallback(async () => {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
    await fetchFresh(true);
  }, [fetchFresh]);

  return { revenue, expenses, services, cashFlow, operational, dateBounds, loading, refetch };
}
