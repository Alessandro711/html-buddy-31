import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { expenseBreakdown } from "@/data/financialData";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

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

const ExpensePieChart = () => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">Composição de Despesas</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <BarChart data={expenseBreakdown} layout="vertical" margin={{ top: 10, right: 24, left: 18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} labelFormatter={(label) => String(label)} />}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {expenseBreakdown.map((item, index) => (
              <Cell key={item.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
            <LabelList dataKey="percentage" position="right" formatter={(value: number) => `${value}%`} className="fill-foreground text-xs" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default ExpensePieChart;
