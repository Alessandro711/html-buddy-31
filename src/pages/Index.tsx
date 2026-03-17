import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Percent, Receipt, AlertTriangle, CalendarRange } from "lucide-react";
import logoClinica from "@/assets/logo-clinica.jpg";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import ServiceRevenueChart from "@/components/dashboard/ServiceRevenueChart";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import DRETable from "@/components/dashboard/DRETable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cashFlowData, getExpenseBreakdownByMonths, getRevenueByServiceByMonths, kpis, monthlyRevenue } from "@/data/financialData";

const fmt = (v: number) => v.toLocaleString("pt-BR");
const allMonths = monthlyRevenue.map((item) => item.month);

const Index = () => {
  const [startMonth, setStartMonth] = useState(allMonths[0]);
  const [endMonth, setEndMonth] = useState(allMonths[allMonths.length - 1]);

  const startIndex = allMonths.indexOf(startMonth);
  const endIndex = allMonths.indexOf(endMonth);

  const filteredRevenue = useMemo(
    () => monthlyRevenue.filter((_, index) => index >= startIndex && index <= endIndex),
    [startIndex, endIndex],
  );

  const filteredCashFlow = useMemo(
    () => cashFlowData.filter((_, index) => index >= startIndex && index <= endIndex),
    [startIndex, endIndex],
  );

  const filteredMonths = useMemo(
    () => allMonths.filter((_, index) => index >= startIndex && index <= endIndex),
    [startIndex, endIndex],
  );

  const filteredExpenseBreakdown = useMemo(
    () => getExpenseBreakdownByMonths(filteredMonths),
    [filteredMonths],
  );

  const filteredServiceRevenue = useMemo(
    () => getRevenueByServiceByMonths(filteredMonths),
    [filteredMonths],
  );

  const periodLabel = `${startMonth} — ${endMonth} de 2025`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={logoClinica} alt="Logo Clínica Dra Greice Gama" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-semibold leading-tight text-foreground">Dashboard Financeiro</h1>
              <p className="text-xs text-muted-foreground">Clínica Médica Dra Greice Gama</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{periodLabel}</p>
            <p className="text-xs text-muted-foreground">Atualizado em tempo real</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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
                    const nextStartIndex = allMonths.indexOf(value);
                    setStartMonth(value);
                    if (nextStartIndex > endIndex) {
                      setEndMonth(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mês inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Até</p>
                <Select
                  value={endMonth}
                  onValueChange={(value) => {
                    const nextEndIndex = allMonths.indexOf(value);
                    setEndMonth(value);
                    if (nextEndIndex < startIndex) {
                      setStartMonth(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mês final" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard title="Faturamento" value={fmt(kpis.faturamentoMensal)} variation={kpis.faturamentoVariacao} icon={<DollarSign className="h-5 w-5" />} prefix="R$ " />
          <KPICard title="Despesas" value={fmt(kpis.despesasMensal)} variation={kpis.despesasVariacao} icon={<TrendingDown className="h-5 w-5" />} prefix="R$ " />
          <KPICard title="Lucro Líquido" value={fmt(kpis.lucroLiquido)} variation={kpis.lucroVariacao} icon={<TrendingUp className="h-5 w-5" />} prefix="R$ " />
          <KPICard title="Margem de Lucro" value={`${kpis.margemLucro}%`} variation={kpis.margemVariacao} icon={<Percent className="h-5 w-5" />} />
          <KPICard title="Ticket Médio" value={fmt(kpis.ticketMedio)} variation={kpis.ticketVariacao} icon={<Receipt className="h-5 w-5" />} prefix="R$ " />
          <KPICard title="Inadimplência" value={`${kpis.inadimplencia}%`} variation={kpis.inadimplenciaVariacao} icon={<AlertTriangle className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={filteredRevenue} periodLabel={periodLabel} />
          </div>
          <ExpensePieChart data={filteredExpenseBreakdown} periodLabel={periodLabel} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ServiceRevenueChart data={filteredServiceRevenue} periodLabel={periodLabel} />
          <CashFlowChart data={filteredCashFlow} periodLabel={periodLabel} />
        </div>

        <DRETable />
      </main>
    </div>
  );
};

export default Index;
