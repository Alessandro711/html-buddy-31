import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { expenseBreakdown } from "@/data/financialData";

const COLORS = [
  "hsl(33, 55%, 55%)",
  "hsl(25, 50%, 45%)",
  "hsl(33, 45%, 70%)",
  "hsl(30, 10%, 25%)",
  "hsl(33, 30%, 85%)",
  "hsl(33, 40%, 60%)",
  "hsl(30, 15%, 50%)",
];

const chartConfig = Object.fromEntries(
  expenseBreakdown.map((item, i) => [item.name, { label: item.name, color: COLORS[i] }])
);

const ExpensePieChart = () => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">Composição de Despesas</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
          <Pie
            data={expenseBreakdown}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
          >
            {expenseBreakdown.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {expenseBreakdown.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-muted-foreground truncate">{item.name}</span>
            <span className="ml-auto font-medium text-foreground">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ExpensePieChart;
