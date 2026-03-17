import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { cashFlowData } from "@/data/financialData";

const chartConfig = {
  entradas: { label: "Entradas", color: "hsl(33, 55%, 55%)" },
  saidas: { label: "Saídas", color: "hsl(25, 50%, 45%)" },
};

const CashFlowChart = () => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(33, 20%, 88%)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(30, 8%, 46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 8%, 46%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
          <Bar dataKey="entradas" fill="hsl(33, 55%, 55%)" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="saidas" fill="hsl(25, 50%, 45%)" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default CashFlowChart;
