import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DreData } from "@/data/financialData";

const fmt = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

interface LineProps {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  indent?: boolean;
  negative?: boolean;
}

interface DRETableProps {
  data: DreData;
  periodLabel: string;
}

const DRELine = ({ label, value, bold, highlight, indent, negative }: LineProps) => (
  <TableRow className={cn(highlight && "bg-primary/5")}>
    <TableCell className={cn("py-2.5", indent && "pl-8", bold && "font-semibold text-foreground")}>
      {label}
    </TableCell>
    <TableCell className={cn("py-2.5 text-right font-mono tabular-nums", bold && "font-semibold", negative && "text-destructive")}>
      {negative && value !== 0 ? `(${fmt(value)})` : fmt(value)}
    </TableCell>
  </TableRow>
);

const DRETable = ({ data, periodLabel }: DRETableProps) => {
  const margemBruta = data.receitaLiquida > 0 ? ((data.lucroBruto / data.receitaLiquida) * 100).toFixed(1) : "0.0";
  const margemLiquida = data.receitaLiquida > 0 ? ((data.lucroLiquido / data.receitaLiquida) * 100).toFixed(1) : "0.0";

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">DRE - Demonstração do Resultado</CardTitle>
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <Table>
          <TableBody>
            <DRELine label="Receita Bruta" value={data.receitaBruta} bold highlight />
            <DRELine label="(-) Impostos sobre Receita" value={data.deducoes.impostos} indent negative />
            <DRELine label="(-) Descontos e Abatimentos" value={data.deducoes.descontos} indent negative />
            <DRELine label="= Receita Líquida" value={data.receitaLiquida} bold highlight />
            <DRELine label="(-) Custos com Materiais" value={data.custos.materiais} indent negative />
            <DRELine label="(-) Custos com Pessoal Assistencial" value={data.custos.pessoalAssistencial} indent negative />
            <DRELine label={`= Lucro Bruto (${margemBruta}%)`} value={data.lucroBruto} bold highlight />
            <DRELine label="(-) Despesas Administrativas" value={data.despesasOperacionais.administrativas} indent negative />
            <DRELine label="(-) Despesas Comerciais" value={data.despesasOperacionais.comerciais} indent negative />
            <DRELine label="(-) Depreciações" value={data.despesasOperacionais.depreciacoes} indent negative />
            <DRELine label="= Resultado Operacional" value={data.resultadoOperacional} bold highlight />
            <DRELine label="(+) Receitas Financeiras" value={data.resultadoFinanceiro.receitas} indent />
            <DRELine label="(-) Despesas Financeiras" value={data.resultadoFinanceiro.despesas} indent negative />
            <DRELine label="= Resultado Antes do IR" value={data.resultadoAntesIR} bold highlight />
            <DRELine label="(-) IR e CSLL" value={data.irCsll} indent negative />
            <DRELine label={`= Lucro Líquido (${margemLiquida}%)`} value={data.lucroLiquido} bold highlight />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DRETable;
