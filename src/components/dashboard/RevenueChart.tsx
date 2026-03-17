import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { monthlyRevenue } from "@/data/financialData";

const chartConfig = {
  faturamento: { label: "Faturamento", color: "hsl(33, 55%, 55%)" },
  despesas: { label: "Despesas", color: "hsl(25, 50%, 45%)" },
  lucro: { label: "Lucro", color: "hsl(142, 60%, 40%)" },
};

const RevenueChart = () => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">Faturamento vs Despesas vs Lucro</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradFaturamento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(33, 55%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(33, 55%, 55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 60%, 40%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142, 60%, 40%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(33, 20%, 88%)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(30, 8%, 46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 8%, 46%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
          <Area type="monotone" dataKey="faturamento" stroke="hsl(33, 55%, 55%)" fill="url(#gradFaturamento)" strokeWidth={2.5} />
          <Area type="monotone" dataKey="despesas" stroke="hsl(25, 50%, 45%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
          <Area type="monotone" dataKey="lucro" stroke="hsl(142, 60%, 40%)" fill="url(#gradLucro)" strokeWidth={2.5} />
        </AreaChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default RevenueChart;
