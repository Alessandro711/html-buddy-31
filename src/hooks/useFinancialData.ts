import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type ExpenseRow, type ServiceRow, type OperationalRow, type RevenuePoint } from "@/data/financialData";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PAGE_SIZE = 1000;

const EXPENSE_CATEGORY_MAP: Record<string, keyof Omit<ExpenseRow, "month" | "ano">> = {
  "Impostos sobre Receita": "impostos",
  "Descontos e Abatimentos": "descontosAbatimentos",
  "Materiais e Insumos": "materiaisInsumos",
  "Pessoal Assistencial": "folhaPagamento",
  "Pessoal Administrativo": "folhaPagamento",
  "Aluguel e Condomínio": "aluguelCondominio",
  "Outros Administrativos": "outros",
  Marketing: "marketing",
  "Equipamentos / Depreciação": "equipamentos",
  "Despesas Financeiras": "despesasFinanceiras",
  "IR e CSLL": "irCsll",
};

const SERVICE_CATEGORY_MAP: Record<string, keyof Omit<ServiceRow, "month" | "ano">> = {
  Consultas: "consultas",
  Exames: "exames",
  Procedimentos: "procedimentos",
  Retornos: "retornos",
  "Outros (Receita)": "outros",
};

const sortByYearMonth = <T extends { month: string; ano: number }>(rows: T[]) =>
  [...rows].sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });

const emptyExpenseRow = (month: string, ano: number): ExpenseRow => ({
  month,
  ano,
  folhaPagamento: 0,
  materiaisInsumos: 0,
  aluguelCondominio: 0,
  equipamentos: 0,
  marketing: 0,
  impostos: 0,
  outros: 0,
  receitasFinanceiras: 0,
  despesasFinanceiras: 0,
  irCsll: 0,
  descontosAbatimentos: 0,
});

const emptyServiceRow = (month: string, ano: number): ServiceRow => ({
  month,
  ano,
  consultas: 0,
  exames: 0,
  procedimentos: 0,
  retornos: 0,
  outros: 0,
});

const emptyRevenueRow = (month: string, ano: number): RevenuePoint => ({
  month,
  ano,
  faturamento: 0,
  despesas: 0,
  lucro: 0,
  desconto_total: 0,
});

const emptyCashFlowRow = (month: string, ano: number) => ({
  month,
  ano,
  entradas: 0,
  saidas: 0,
});

const emptyOperationalRow = (month: string, ano: number): OperationalRow => ({
  month,
  ano,
  atendimentos: 0,
  inadimplencia: 0,
});

const normalizeDate = (value?: string) => (value ? String(value).split("T")[0] : "");

const getPeriodFromDate = (value?: string) => {
  const normalized = normalizeDate(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) return null;

  return {
    ano: year,
    month: MONTHS[monthIndex],
    normalized,
  };
};

const getMonthKey = (ano: number, month: string) => `${ano}-${month}`;

type LancamentoRow = {
  ano: number;
  categoria: string;
  data: string;
  desconto: number;
  mes: string;
  status: string;
  tipo: string;
  valor: number;
};

export interface DateBounds {
  minDate: string;
  maxDate: string;
}

export function useFinancialData() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [cashFlow, setCashFlow] = useState<Array<{ month: string; ano: number; entradas: number; saidas: number }>>([]);
  const [operational, setOperational] = useState<OperationalRow[]>([]);
  const [dateBounds, setDateBounds] = useState<DateBounds>({ minDate: "", maxDate: "" });
  const [loading, setLoading] = useState(true);

  const fetchFresh = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true);

    try {
      const allRows: LancamentoRow[] = [];

      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from("lancamentos")
          .select("data,mes,ano,tipo,categoria,valor,desconto,status")
          .order("data", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        const batch = (data ?? []) as LancamentoRow[];
        allRows.push(...batch);

        if (batch.length < PAGE_SIZE) break;
      }

      if (allRows.length === 0) {
        setRevenue([]);
        setExpenses([]);
        setServices([]);
        setCashFlow([]);
        setOperational([]);
        setDateBounds({ minDate: "", maxDate: "" });
        return;
      }

      const years = [...new Set(allRows
        .map((row) => getPeriodFromDate(row.data)?.ano ?? row.ano)
        .filter((year): year is number => Number.isInteger(year))
      )].sort((a, b) => a - b);
      const revenueMap = new Map<string, RevenuePoint>();
      const expenseMap = new Map<string, ExpenseRow>();
      const serviceMap = new Map<string, ServiceRow>();
      const cashFlowMap = new Map<string, { month: string; ano: number; entradas: number; saidas: number }>();
      const operationalMap = new Map<string, OperationalRow>();
      const paidRevenueCount = new Map<string, number>();
      const pendingRevenueCount = new Map<string, number>();

      years.forEach((ano) => {
        MONTHS.forEach((month) => {
          const key = getMonthKey(ano, month);
          revenueMap.set(key, emptyRevenueRow(month, ano));
          expenseMap.set(key, emptyExpenseRow(month, ano));
          serviceMap.set(key, emptyServiceRow(month, ano));
          cashFlowMap.set(key, emptyCashFlowRow(month, ano));
          operationalMap.set(key, emptyOperationalRow(month, ano));
        });
      });

      for (const row of allRows) {
        const period = getPeriodFromDate(row.data);
        const month = period?.month;
        const ano = period?.ano;

        if (!month) continue;

        const key = getMonthKey(ano, month);
        const revenueRow = revenueMap.get(key) ?? emptyRevenueRow(month, ano);
        const expenseRow = expenseMap.get(key) ?? emptyExpenseRow(month, ano);
        const serviceRow = serviceMap.get(key) ?? emptyServiceRow(month, ano);
        const cashFlowRow = cashFlowMap.get(key) ?? emptyCashFlowRow(month, ano);
        const operationalRow = operationalMap.get(key) ?? emptyOperationalRow(month, ano);

        if (row.tipo === "receita") {
          if (row.status === "pendente") {
            pendingRevenueCount.set(key, (pendingRevenueCount.get(key) ?? 0) + 1);
          }

          if (row.status === "pago") {
            paidRevenueCount.set(key, (paidRevenueCount.get(key) ?? 0) + 1);
            revenueRow.faturamento += Number(row.valor ?? 0);
            revenueRow.desconto_total = (revenueRow.desconto_total ?? 0) + Number(row.desconto ?? 0);
            cashFlowRow.entradas += Number(row.valor ?? 0);

            if (row.categoria === "Receitas Financeiras") {
              expenseRow.receitasFinanceiras += Number(row.valor ?? 0);
            } else {
              const serviceColumn = SERVICE_CATEGORY_MAP[row.categoria];
              if (serviceColumn) serviceRow[serviceColumn] += Number(row.valor ?? 0);
            }

            if (["Consultas", "Retornos"].includes(row.categoria)) {
              operationalRow.atendimentos += 1;
            }
          }
        }

        if (row.tipo === "despesa" && row.status === "pago") {
          revenueRow.despesas += Number(row.valor ?? 0);
          cashFlowRow.saidas += Number(row.valor ?? 0);

          const expenseColumn = EXPENSE_CATEGORY_MAP[row.categoria];
          if (expenseColumn) expenseRow[expenseColumn] += Number(row.valor ?? 0);
        }

        revenueRow.lucro = revenueRow.faturamento - revenueRow.despesas;

        const paidCount = paidRevenueCount.get(key) ?? 0;
        const pendingCount = pendingRevenueCount.get(key) ?? 0;
        operationalRow.inadimplencia = paidCount + pendingCount > 0
          ? Math.round((pendingCount / (paidCount + pendingCount)) * 1000) / 10
          : 0;

        revenueMap.set(key, revenueRow);
        expenseMap.set(key, expenseRow);
        serviceMap.set(key, serviceRow);
        cashFlowMap.set(key, cashFlowRow);
        operationalMap.set(key, operationalRow);
      }

      const orderedDates = allRows
        .map((row) => normalizeDate(row.data))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      setRevenue(sortByYearMonth(Array.from(revenueMap.values())));
      setExpenses(sortByYearMonth(Array.from(expenseMap.values())));
      setServices(sortByYearMonth(Array.from(serviceMap.values())));
      setCashFlow(sortByYearMonth(Array.from(cashFlowMap.values())));
      setOperational(sortByYearMonth(Array.from(operationalMap.values())));
      setDateBounds({
        minDate: orderedDates[0] ?? "",
        maxDate: orderedDates[orderedDates.length - 1] ?? "",
      });
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setRevenue([]);
      setExpenses([]);
      setServices([]);
      setCashFlow([]);
      setOperational([]);
      setDateBounds({ minDate: "", maxDate: "" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem("clinica_financial_cache_v5");
      localStorage.removeItem("clinica_financial_cache_v4");
      localStorage.removeItem("clinica_financial_cache_v3");
    } catch {}
    fetchFresh(true);
  }, [fetchFresh]);

  useEffect(() => {
    const handler = () => {
      console.log("[Dashboard] Data updated — refreshing...");
      fetchFresh(false);
    };

    window.addEventListener("clinica_data_updated", handler);
    return () => window.removeEventListener("clinica_data_updated", handler);
  }, [fetchFresh]);

  const refetch = useCallback(async () => {
    await fetchFresh(true);
  }, [fetchFresh]);

  return { revenue, expenses, services, cashFlow, operational, dateBounds, loading, refetch };
}
