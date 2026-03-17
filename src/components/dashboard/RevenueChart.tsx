import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface RevenuePoint {
  month: string;
  faturamento: number;
  despesas: number;
  lucro: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
  periodLabel: string;
}

const chartConfig = {
  faturamento: { label: "Faturamento", color: "hsl(var(--chart-gold))" },
  despesas: { label: "Despesas", color: "hsl(var(--chart-bronze))" },
  lucro: { label: "Lucro", color: "hsl(var(--success))" },
};

const RevenueChart = ({ data, periodLabel }: RevenueChartProps) => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Faturamento vs Despesas vs Lucro</CardTitle>
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradFaturamento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-faturamento)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-faturamento)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-lucro)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-lucro)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area type="monotone" dataKey="faturamento" stroke="var(--color-faturamento)" fill="url(#gradFaturamento)" strokeWidth={2.5} />
          <Area type="monotone" dataKey="despesas" stroke="var(--color-despesas)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
          <Area type="monotone" dataKey="lucro" stroke="var(--color-lucro)" fill="url(#gradLucro)" strokeWidth={2.5} />
        </AreaChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default RevenueChart;
