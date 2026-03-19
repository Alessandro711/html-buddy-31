import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Percent, Receipt, AlertTriangle, CalendarRange } from "lucide-react";
import logoClinica from "@/assets/logo-clinica.jpg";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import ServiceRevenueChart from "@/components/dashboard/ServiceRevenueChart";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import DRETable from "@/components/dashboard/DRETable";
import ExcelImport from "@/components/dashboard/ExcelImport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExpenseBreakdownFromData, getRevenueByServiceFromData, getKpisFromData, getDreFromData } from "@/data/financialData";
import { useFinancialData } from "@/hooks/useFinancialData";

const fmt = (v: number) => v.toLocaleString("pt-BR");
const ALL_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Index = () => {
  const { revenue, expenses, services, cashFlow, operational, loading, refetch } = useFinancialData();

  const availableMonths = useMemo(() => {
    const months = revenue.map((r) => r.month);
    return ALL_MONTHS.filter((m) => months.includes(m));
  }, [revenue]);

  const [startMonth, setStartMonth] = useState(ALL_MONTHS[0]);
  const [endMonth, setEndMonth] = useState(ALL_MONTHS[ALL_MONTHS.length - 1]);

  const startIndex = ALL_MONTHS.indexOf(startMonth);
  const endIndex = ALL_MONTHS.indexOf(endMonth);

  const filteredRevenue = useMemo(
    () => revenue.filter((item) => {
      const idx = ALL_MONTHS.indexOf(item.month);
      return idx >= startIndex && idx <= endIndex;
    }),
    [revenue, startIndex, endIndex],
  );

  const filteredCashFlow = useMemo(
    () => cashFlow.filter((item) => {
      const idx = ALL_MONTHS.indexOf(item.month);
      return idx >= startIndex && idx <= endIndex;
    }),
    [cashFlow, startIndex, endIndex],
  );

  const filteredMonths = useMemo(
    () => ALL_MONTHS.filter((_, index) => index >= startIndex && index <= endIndex),
    [startIndex, endIndex],
  );

  const filteredExpenseBreakdown = useMemo(
    () => getExpenseBreakdownFromData(expenses, filteredMonths),
    [expenses, filteredMonths],
  );

  const filteredServiceRevenue = useMemo(
    () => getRevenueByServiceFromData(services, filteredMonths),
    [services, filteredMonths],
  );

  const filteredKpis = useMemo(
    () => getKpisFromData(revenue, expenses, operational, filteredMonths),
    [revenue, expenses, operational, filteredMonths],
  );

  const filteredDre = useMemo(
    () => getDreFromData(revenue, expenses, filteredMonths),
    [revenue, expenses, filteredMonths],
  );

  const periodLabel = `${startMonth} — ${endMonth} de 2025`;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 xl:px-10 2xl:px-12">
          <div className="flex items-center gap-3">
            <img src={logoClinica} alt="Logo Clínica Dra Greice Gama" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-semibold leading-tight text-foreground">Dashboard Financeiro</h1>
              <p className="text-xs text-muted-foreground">Clínica Médica Dra Greice Gama</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ExcelImport onImportComplete={refetch} />
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{periodLabel}</p>
              <p className="text-xs text-muted-foreground">Atualizado em tempo real</p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full space-y-6 px-4 py-6 sm:px-6 xl:px-10 2xl:px-12">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Filtro de data</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <CalendarRange className="h-4 w-4 text-primary" />
                <span>{periodLabel}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[360px]">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">De</p>
                <Select
                  value={startMonth}
                  onValueChange={(value) => {
                    const nextStartIndex = ALL_MONTHS.indexOf(value);
                    setStartMonth(value);
                    if (nextStartIndex > endIndex) setEndMonth(value);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Mês inicial" /></SelectTrigger>
                  <SelectContent>
                    {ALL_MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Até</p>
                <Select
                  value={endMonth}
                  onValueChange={(value) => {
                    const nextEndIndex = ALL_MONTHS.indexOf(value);
                    setEndMonth(value);
                    if (nextEndIndex < startIndex) setStartMonth(value);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Mês final" /></SelectTrigger>
                  <SelectContent>
                    {ALL_MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KPICard title="Faturamento" value={fmt(filteredKpis.faturamentoMensal)} variation={filteredKpis.faturamentoVariacao} icon={<DollarSign className="h-5 w-5" />} prefix="R$ " comparisonLabel="vs período anterior" />
          <KPICard title="Despesas" value={fmt(filteredKpis.despesasMensal)} variation={filteredKpis.despesasVariacao} icon={<TrendingDown className="h-5 w-5" />} prefix="R$ " comparisonLabel="vs período anterior" />
          <KPICard title="Lucro Líquido" value={fmt(filteredKpis.lucroLiquido)} variation={filteredKpis.lucroVariacao} icon={<TrendingUp className="h-5 w-5" />} prefix="R$ " comparisonLabel="vs período anterior" />
          <KPICard title="Margem de Lucro" value={`${filteredKpis.margemLucro}%`} variation={filteredKpis.margemVariacao} icon={<Percent className="h-5 w-5" />} comparisonLabel="vs período anterior" />
          <KPICard title="Ticket Médio" value={fmt(filteredKpis.ticketMedio)} variation={filteredKpis.ticketVariacao} icon={<Receipt className="h-5 w-5" />} prefix="R$ " comparisonLabel="vs período anterior" />
          <KPICard title="Inadimplência" value={`${filteredKpis.inadimplencia}%`} variation={filteredKpis.inadimplenciaVariacao} icon={<AlertTriangle className="h-5 w-5" />} comparisonLabel="vs período anterior" />
        </div>

        <RevenueChart data={filteredRevenue} periodLabel={periodLabel} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ExpensePieChart data={filteredExpenseBreakdown} periodLabel={periodLabel} />
          <ServiceRevenueChart data={filteredServiceRevenue} periodLabel={periodLabel} />
        </div>

        <CashFlowChart data={filteredCashFlow} periodLabel={periodLabel} />

        <DRETable data={filteredDre} periodLabel={periodLabel} />
      </main>
    </div>
  );
};

export default Index;
