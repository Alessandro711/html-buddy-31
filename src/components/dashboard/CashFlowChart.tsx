import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CashFlowPoint {
  month: string;
  entradas: number;
  saidas: number;
}

interface CashFlowChartProps {
  data: CashFlowPoint[];
  periodLabel: string;
}

const chartConfig = {
  entradas: { label: "Entradas", color: "hsl(var(--chart-gold))" },
  saidas: { label: "Saídas", color: "hsl(var(--chart-bronze))" },
};

const CashFlowChart = ({ data, periodLabel }: CashFlowChartProps) => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="entradas" fill="var(--color-entradas)" radius={[6, 6, 0, 0]} barSize={18} />
          <Bar dataKey="saidas" fill="var(--color-saidas)" radius={[6, 6, 0, 0]} barSize={18} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default CashFlowChart;
