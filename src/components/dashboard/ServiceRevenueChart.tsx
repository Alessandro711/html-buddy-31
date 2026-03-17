import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { revenueByService } from "@/data/financialData";

const chartConfig = {
  valor: { label: "Receita", color: "hsl(33, 55%, 55%)" },
};

const ServiceRevenueChart = () => (
  <Card className="border-none shadow-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">Receita por Serviço</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={revenueByService} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(33, 20%, 88%)" vertical={false} />
          <XAxis dataKey="servico" tick={{ fontSize: 12 }} stroke="hsl(30, 8%, 46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 8%, 46%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />} />
          <Bar dataKey="valor" fill="hsl(33, 55%, 55%)" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default ServiceRevenueChart;
