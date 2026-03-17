import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface ServiceRevenueDatum {
  servico: string;
  valor: number;
}

interface ServiceRevenueChartProps {
  data: ServiceRevenueDatum[];
  periodLabel: string;
}

const chartConfig = {
  valor: { label: "Receita", color: "hsl(var(--chart-gold))" },
};

const ServiceRevenueChart = ({ data, periodLabel }: ServiceRevenueChartProps) => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Receita por Serviço</CardTitle>
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="servico" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
          <Bar dataKey="valor" fill="var(--color-valor)" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default ServiceRevenueChart;
