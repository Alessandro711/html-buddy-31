import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ExpenseBreakdownPoint } from "@/data/financialData";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

interface ExpensePieChartProps {
  data: ExpenseBreakdownPoint[];
  periodLabel: string;
}

const BAR_COLORS = [
  "hsl(var(--chart-gold))",
  "hsl(var(--chart-bronze))",
  "hsl(var(--chart-gold-light))",
  "hsl(var(--chart-dark))",
  "hsl(var(--chart-cream))",
  "hsl(var(--chart-gold))",
  "hsl(var(--chart-bronze))",
];

const chartConfig = {
  value: { label: "Despesas", color: "hsl(var(--chart-gold))" },
};

const ExpensePieChart = ({ data, periodLabel }: ExpensePieChartProps) => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Composição de Despesas</CardTitle>
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[380px] w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 120, left: 28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <YAxis
            type="category"
            dataKey="name"
            width={170}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} labelFormatter={(label) => String(label)} />}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((item, index) => (
              <Cell key={item.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
            <LabelList
              position="right"
              className="fill-foreground text-xs"
              content={({ x, y, width, height, index }: any) => {
                const item = data[index];
                if (!item) return null;
                return (
                  <text x={Number(x) + Number(width) + 6} y={Number(y) + Number(height) / 2} dominantBaseline="central" className="fill-foreground text-xs" fontSize={12}>
                    {`R$ ${item.value.toLocaleString("pt-BR")} (${item.percentage}%)`}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default ExpensePieChart;
