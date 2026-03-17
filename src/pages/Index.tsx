import { DollarSign, TrendingUp, TrendingDown, Percent, Receipt, AlertTriangle } from "lucide-react";
import logoClinica from "@/assets/logo-clinica.jpg";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import ServiceRevenueChart from "@/components/dashboard/ServiceRevenueChart";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import DRETable from "@/components/dashboard/DRETable";
import { kpis } from "@/data/financialData";

const fmt = (v: number) => v.toLocaleString("pt-BR");

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoClinica} alt="Logo Clínica Dra Greice Gama" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-semibold text-foreground leading-tight">Dashboard Financeiro</h1>
              <p className="text-xs text-muted-foreground">Clínica Médica Dra Greice Gama</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Dezembro 2025</p>
            <p className="text-xs text-muted-foreground">Atualizado em tempo real</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Faturamento"
            value={fmt(kpis.faturamentoMensal)}
            variation={kpis.faturamentoVariacao}
            icon={<DollarSign className="h-5 w-5" />}
            prefix="R$ "
          />
          <KPICard
            title="Despesas"
            value={fmt(kpis.despesasMensal)}
            variation={kpis.despesasVariacao}
            icon={<TrendingDown className="h-5 w-5" />}
            prefix="R$ "
          />
          <KPICard
            title="Lucro Líquido"
            value={fmt(kpis.lucroLiquido)}
            variation={kpis.lucroVariacao}
            icon={<TrendingUp className="h-5 w-5" />}
            prefix="R$ "
          />
          <KPICard
            title="Margem de Lucro"
            value={`${kpis.margemLucro}%`}
            variation={kpis.margemVariacao}
            icon={<Percent className="h-5 w-5" />}
          />
          <KPICard
            title="Ticket Médio"
            value={fmt(kpis.ticketMedio)}
            variation={kpis.ticketVariacao}
            icon={<Receipt className="h-5 w-5" />}
            prefix="R$ "
          />
          <KPICard
            title="Inadimplência"
            value={`${kpis.inadimplencia}%`}
            variation={kpis.inadimplenciaVariacao}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <ExpensePieChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServiceRevenueChart />
          <CashFlowChart />
        </div>

        {/* DRE */}
        <DRETable />
      </main>
    </div>
  );
};

export default Index;
