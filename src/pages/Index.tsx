import { useMemo, useState, useEffect } from "react";
import logoClinica from "@/assets/logo-clinica.jpg";
import { DollarSign, TrendingUp, TrendingDown, Percent, Receipt, AlertTriangle, Tag } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import ServiceRevenueChart from "@/components/dashboard/ServiceRevenueChart";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import DRETable from "@/components/dashboard/DRETable";
import { getDreFromData, getExpenseBreakdownFromData, getRevenueByServiceFromData, getKpisFromData } from "@/data/financialData";
import { useFinancialData } from "@/hooks/useFinancialData";

const fmt = (v: number) => v.toLocaleString("pt-BR");
const ALL_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTH_NUM: Record<string,number> = { Jan:1,Fev:2,Mar:3,Abr:4,Mai:5,Jun:6,Jul:7,Ago:8,Set:9,Out:10,Nov:11,Dez:12 };

const CURRENT_YEAR = new Date().getFullYear();

// Build a full ISO date string from a month abbreviation + year
const toDate = (month: string, year: number, day: number) => {
  const m = String(MONTH_NUM[month]).padStart(2,"0");
  const d = String(day).padStart(2,"0");
  return `${year}-${m}-${d}`;
};

// Parse "YYYY-MM-DD" into { year, monthIdx (0-based) }
const parseDate = (s: string) => {
  const [y, m] = s.split("-");
  return { year: parseInt(y), monthIdx: parseInt(m) - 1 };
};


// ── MonthYearFilter ──────────────────────────────────────────────────────────
function MonthYearSelector({ label, month, year, months, years, onMonthChange, onYearChange }: {
  label: string; month: number; year: number;
  months: typeof ALL_MONTHS; years: number[];
  onMonthChange: (m: number) => void; onYearChange: (y: number) => void;
}) {
  const selectCls = [
    "h-9 rounded-xl border border-border bg-card px-2 text-sm text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
    "hover:border-primary/50 transition-all cursor-pointer appearance-none",
  ].join(" ");

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-medium select-none whitespace-nowrap">{label}</span>
      <select value={month} onChange={e => onMonthChange(Number(e.target.value))} className={selectCls}>
        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>
      <select value={year} onChange={e => onYearChange(Number(e.target.value))} className={selectCls}>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

function DateRangeFilter({
  startMonth, startYear, endMonth, endYear, years,
  onStartMonthChange, onStartYearChange, onEndMonthChange, onEndYearChange,
}: {
  startMonth: number; startYear: number; endMonth: number; endYear: number;
  years: number[];
  onStartMonthChange: (m: number) => void; onStartYearChange: (y: number) => void;
  onEndMonthChange: (m: number) => void; onEndYearChange: (y: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-muted/40 rounded-2xl px-3 py-1.5 border border-border/60 flex-wrap">
      <MonthYearSelector label="De" month={startMonth} year={startYear} months={ALL_MONTHS} years={years}
        onMonthChange={onStartMonthChange} onYearChange={onStartYearChange} />
      <span className="text-muted-foreground select-none">→</span>
      <MonthYearSelector label="Até" month={endMonth} year={endYear} months={ALL_MONTHS} years={years}
        onMonthChange={onEndMonthChange} onYearChange={onEndYearChange} />
    </div>
  );
}


const Index = () => {
  const { revenue, expenses, services, cashFlow, operational, dateBounds, loading, refetch } = useFinancialData();

  // ── Fetch pendentes para inadimplência real ───────────────────────────────
  const [pendentes, setPendentes] = useState<{mes:string; ano:number; valor:number}[]>([]);
  useEffect(() => {
    import("@/integrations/supabase/client").then(({supabase}) => {
      supabase
        .from("lancamentos")
        .select("mes,ano,valor")
        .eq("tipo","receita")
        .eq("status","pendente")
        .then(({data}) => {
          if (data) setPendentes(data as {mes:string;ano:number;valor:number}[]);
        });
    });
  }, [refetch]);

  // ── Month/Year filter state ────────────────────────────────────────────────
  const [startMonthIdx, setStartMonthIdx] = useState(0);
  const [startYear, setStartYear]         = useState(CURRENT_YEAR);
  const [endMonthIdx, setEndMonthIdx]     = useState(11);
  const [endYear, setEndYear]             = useState(CURRENT_YEAR);

  // Available years — derived from actual data (revenue + expenses), not just lancamentos
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    revenue.forEach(r => yearsSet.add(r.ano));
    expenses.forEach(e => yearsSet.add(e.ano));
    if (dateBounds.minDate) yearsSet.add(parseInt(dateBounds.minDate.split("-")[0]));
    if (dateBounds.maxDate) yearsSet.add(parseInt(dateBounds.maxDate.split("-")[0]));
    if (yearsSet.size === 0) yearsSet.add(CURRENT_YEAR);
    return [...yearsSet].sort((a,b) => a - b);
  }, [revenue, expenses, dateBounds.minDate, dateBounds.maxDate]);

  // Auto-set filter to actual data range once loaded
  useEffect(() => {
    if (revenue.length > 0 || expenses.length > 0) {
      const allYears = [...new Set([...revenue.map(r=>r.ano), ...expenses.map(e=>e.ano)])].sort((a,b)=>a-b);
      if (allYears.length > 0) {
        const minY = allYears[0];
        const maxY = allYears[allYears.length - 1];
        // Find min/max month for those years
        const minMonths = revenue.filter(r=>r.ano===minY).map(r=>ALL_MONTHS.indexOf(r.month)).filter(i=>i>=0);
        const maxMonths = revenue.filter(r=>r.ano===maxY).map(r=>ALL_MONTHS.indexOf(r.month)).filter(i=>i>=0);
        setStartYear(minY);
        setStartMonthIdx(minMonths.length > 0 ? Math.min(...minMonths) : 0);
        setEndYear(maxY);
        setEndMonthIdx(maxMonths.length > 0 ? Math.max(...maxMonths) : 11);
      }
    } else if (dateBounds.minDate && dateBounds.maxDate) {
      const { year: minY, monthIdx: minM } = parseDate(dateBounds.minDate);
      const { year: maxY, monthIdx: maxM } = parseDate(dateBounds.maxDate);
      setStartYear(minY); setStartMonthIdx(minM);
      setEndYear(maxY);   setEndMonthIdx(maxM);
    }
  }, [revenue, expenses, dateBounds.minDate, dateBounds.maxDate]);

  // filteredMonthKeys: "YYYY-Mon" strings covering the full selected date range
  const filteredMonthKeys = useMemo(() => {
    const keys: string[] = [];
    let y = startYear, m = startMonthIdx;
    for (let guard = 0; guard < 240; guard++) {
      keys.push(`${y}-${ALL_MONTHS[m]}`);
      if (y === endYear && m === endMonthIdx) break;
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return keys;
  }, [startMonthIdx, endMonthIdx, startYear, endYear]);

  // filteredMonths kept for helpers that only need month name
  const filteredMonths = useMemo(() =>
    [...new Set(filteredMonthKeys.map(k => k.split("-")[1]))],
    [filteredMonthKeys]
  );

  // Year derived from the start date — used to anchor the full-year charts
  const chartYear = startYear;

  // RevenueChart & CashFlowChart show only the selected period (filtered by month/year)
  const yearRevenue  = useMemo(
    () => revenue.filter(r => filteredMonthKeys.includes(`${r.ano ?? CURRENT_YEAR}-${r.month}`)),
    [revenue, filteredMonthKeys]
  );
  const yearCashFlow = useMemo(
    () => cashFlow.filter(c => filteredMonthKeys.includes(`${c.ano ?? CURRENT_YEAR}-${c.month}`)),
    [cashFlow, filteredMonthKeys]
  );

  // Filtered subsets for KPIs / DRE / pie charts
  const filteredRevenue = useMemo(
    () => revenue.filter(r => filteredMonthKeys.includes(`${r.ano ?? CURRENT_YEAR}-${r.month}`)),
    [revenue, filteredMonthKeys]
  );

  const filteredExpenseBreakdown = useMemo(
    () => getExpenseBreakdownFromData(expenses, filteredMonthKeys),
    [expenses, filteredMonthKeys]
  );

  const filteredServiceRevenue = useMemo(
    () => getRevenueByServiceFromData(services, filteredMonthKeys),
    [services, filteredMonthKeys]
  );

  // Valor total pendente no período filtrado
  const inadimplenciaValor = useMemo(() => {
    return pendentes
      .filter(p => {
        const key = `${p.ano ?? CURRENT_YEAR}-${p.mes}`;
        return filteredMonthKeys.includes(key);
      })
      .reduce((s,p) => s + Number(p.valor), 0);
  }, [pendentes, filteredMonthKeys]);

  // % do faturamento total
  const inadimplenciaPercFat = useMemo(() => {
    const fat = filteredRevenue.reduce((s,r) => s + r.faturamento, 0);
    return fat > 0 ? Math.round((inadimplenciaValor / fat) * 1000) / 10 : 0;
  }, [inadimplenciaValor, filteredRevenue]);

  // Desconto total do período filtrado (vem de monthly_revenue.desconto_total)
  const descontoTotal = useMemo(() => {
    return filteredRevenue.reduce((s, r) => s + (r.desconto_total || 0), 0);
  }, [filteredRevenue]);

  const descontoPercFat = useMemo(() => {
    const fat = filteredRevenue.reduce((s, r) => s + r.faturamento, 0);
    return fat > 0 ? Math.round((descontoTotal / fat) * 1000) / 10 : 0;
  }, [descontoTotal, filteredRevenue]);

  const filteredKpis = useMemo(
    () => getKpisFromData(revenue, expenses, operational, filteredMonthKeys),
    [revenue, expenses, operational, filteredMonthKeys]
  );

  const filteredDre = useMemo(
    () => getDreFromData(revenue, expenses, filteredMonthKeys),
    [revenue, expenses, filteredMonthKeys]
  );

  // Previous period DRE for variation comparison
  const prevDre = useMemo(() => {
    // Use the same getPrevWindow logic built into getDreFromData via filteredMonths shift
    const n = filteredMonthKeys.length;
    const prevKeys = filteredMonthKeys.map(key => {
      const dash = key.indexOf("-");
      const y    = parseInt(key.slice(0, dash));
      const mon  = key.slice(dash + 1);
      const mIdx = ALL_MONTHS.indexOf(mon);
      const total = y * 12 + mIdx - n;
      const prevY = Math.floor(total / 12);
      const prevM = ((total % 12) + 12) % 12;
      return `${prevY}-${ALL_MONTHS[prevM]}`;
    });
    return getDreFromData(revenue, expenses, prevKeys);
  }, [revenue, expenses, filteredMonthKeys]);

  const lucroVariacao = useMemo(() => {
    const cur  = filteredDre.lucroLiquido;
    const prev = prevDre.lucroLiquido;
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round((cur - prev) / Math.abs(prev) * 100 * 10) / 10;
  }, [filteredDre, prevDre, filteredMonthKeys]);

  // Labels
  const startLabel = `${String(MONTH_NUM[ALL_MONTHS[startMonthIdx]]).padStart(2,"0")}/${startYear}`;
  const endLabel   = `${String(MONTH_NUM[ALL_MONTHS[endMonthIdx]]).padStart(2,"0")}/${endYear}`;
  const periodLabel = `${startLabel} — ${endLabel}`;
  const yearLabel   = `Jan — Dez ${chartYear}`;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12 xl:px-16 flex-wrap">
          {/* Logo + título */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={logoClinica} alt="Logo" className="h-11 w-auto hidden sm:block" />
            <div>
              <h1 className="text-base sm:text-xl font-semibold leading-tight text-foreground">Dashboard Financeiro</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Clínica Médica Dra Greice Gama</p>
            </div>
          </div>

          {/* Filtro de período */}
          <DateRangeFilter
            startMonth={startMonthIdx} startYear={startYear}
            endMonth={endMonthIdx} endYear={endYear}
            years={availableYears}
            onStartMonthChange={m => { setStartMonthIdx(m); if (startYear === endYear && m > endMonthIdx) setEndMonthIdx(m); }}
            onStartYearChange={y => { setStartYear(y); if (y > endYear) { setEndYear(y); setEndMonthIdx(startMonthIdx); } }}
            onEndMonthChange={m => { setEndMonthIdx(m); if (startYear === endYear && m < startMonthIdx) setStartMonthIdx(m); }}
            onEndYearChange={y => { setEndYear(y); if (y < startYear) { setStartYear(y); setStartMonthIdx(endMonthIdx); } }}
          />
        </div>
      </header>

      <main className="w-full space-y-4 sm:space-y-6 px-3 py-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">

        {/* Empty state when no data */}
        {!loading && revenue.length === 0 && expenses.length === 0 ? (
          <EmptyState />
        ) : (
        <>

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        {/* ── Skeleton when loading ── */}
        {loading ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {Array.from({length:7}).map((_,i) => (
              <div key={i} className="rounded-xl bg-card shadow-md p-5 space-y-3" style={{animation:'pulse 1.5s infinite'}}>
                <div className="h-3 rounded w-2/3" style={{background:'var(--muted)'}}/>
                <div className="h-7 rounded w-full" style={{background:'var(--muted)'}}/>
                <div className="h-3 rounded w-1/2" style={{background:'var(--muted)'}}/>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <KPICard title="Faturamento"    value={fmt(filteredKpis.faturamentoMensal)} variation={filteredKpis.faturamentoVariacao} icon={<DollarSign className="h-5 w-5"/>} prefix="R$ " comparisonLabel="vs período anterior"/>
          <KPICard title="Despesas"       value={fmt(filteredKpis.despesasMensal)}    variation={filteredKpis.despesasVariacao}    icon={<TrendingDown className="h-5 w-5"/>} prefix="R$ " comparisonLabel="vs período anterior"/>
          <KPICard title="Lucro Líquido"  value={fmt(filteredDre.lucroLiquido)}       variation={lucroVariacao}       icon={<TrendingUp className="h-5 w-5"/>} prefix="R$ " comparisonLabel="vs período anterior"/>
          <KPICard title="Margem de Lucro" value={`${filteredKpis.faturamentoMensal > 0 ? Math.round(filteredDre.lucroLiquido / filteredKpis.faturamentoMensal * 1000) / 10 : 0}%`} variation={lucroVariacao} icon={<Percent className="h-5 w-5"/>} comparisonLabel="vs período anterior"/>
          <KPICard title="Ticket Médio"   value={fmt(filteredKpis.ticketMedio)}       variation={filteredKpis.ticketVariacao}      icon={<Receipt className="h-5 w-5"/>} prefix="R$ " comparisonLabel="vs período anterior"/>
          <KPICard
            title="Desconto"
            value={descontoTotal.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}
            prefix="R$ "
            variation={0}
            icon={<Tag className="h-5 w-5"/>}
            comparisonLabel="vs período anterior"
            subtitle={descontoPercFat > 0 ? `${descontoPercFat}% Sob. Faturamento` : "Sem descontos"}
            showVariation={false}
          />
          <KPICard
            title="Inadimplência"
            value={inadimplenciaValor > 0
              ? inadimplenciaValor.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})
              : "0,00"}
            prefix="R$ "
            variation={filteredKpis.inadimplenciaVariacao}
            icon={<AlertTriangle className="h-5 w-5"/>}
            comparisonLabel="vs período anterior"
            subtitle={inadimplenciaValor > 0
              ? `${inadimplenciaPercFat}% Sob. Faturamento`
              : "Sem pendências no período"}
            showVariation={false}
          />
        </div>
        )}

        {/* ── Gráfico Faturamento — período filtrado ───────────────────── */}
        <RevenueChart data={yearRevenue} periodLabel={periodLabel} />

        {/* ── Composição de despesas + Receita por serviço (filtro de data) ─── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ExpensePieChart    data={filteredExpenseBreakdown} periodLabel={periodLabel} />
          <ServiceRevenueChart data={filteredServiceRevenue}  periodLabel={periodLabel} />
        </div>

        {/* ── Fluxo de caixa — período filtrado ───────────────────────── */}
        <CashFlowChart data={yearCashFlow} periodLabel={periodLabel} />

        {/* ── DRE (filtro de data) ──────────────────────────────────────────── */}
        <DRETable data={filteredDre} periodLabel={periodLabel} />

        </>
        )}
      </main>
    </div>
  );
};

export default Index;
