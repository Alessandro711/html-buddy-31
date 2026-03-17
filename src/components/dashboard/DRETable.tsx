import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { dreData } from "@/data/financialData";
import { cn } from "@/lib/utils";

const fmt = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

interface LineProps {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  indent?: boolean;
  negative?: boolean;
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

const DRETable = () => {
  const d = dreData;
  const margemBruta = ((d.lucroBruto / d.receitaLiquida) * 100).toFixed(1);
  const margemLiquida = ((d.lucroLiquido / d.receitaLiquida) * 100).toFixed(1);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">DRE - Demonstração do Resultado</CardTitle>
          <span className="text-xs text-muted-foreground">Acumulado 2025</span>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <Table>
          <TableBody>
            <DRELine label="Receita Bruta" value={d.receitaBruta} bold highlight />
            <DRELine label="(-) Impostos sobre Receita" value={d.deducoes.impostos} indent negative />
            <DRELine label="(-) Descontos e Abatimentos" value={d.deducoes.descontos} indent negative />
            <DRELine label="= Receita Líquida" value={d.receitaLiquida} bold highlight />
            <DRELine label="(-) Custos com Materiais" value={d.custos.materiais} indent negative />
            <DRELine label="(-) Custos com Pessoal Assistencial" value={d.custos.pessoalAssistencial} indent negative />
            <DRELine label={`= Lucro Bruto (${margemBruta}%)`} value={d.lucroBruto} bold highlight />
            <DRELine label="(-) Despesas Administrativas" value={d.despesasOperacionais.administrativas} indent negative />
            <DRELine label="(-) Despesas Comerciais" value={d.despesasOperacionais.comerciais} indent negative />
            <DRELine label="(-) Depreciações" value={d.despesasOperacionais.depreciacoes} indent negative />
            <DRELine label="= Resultado Operacional" value={d.resultadoOperacional} bold highlight />
            <DRELine label="(+) Receitas Financeiras" value={d.resultadoFinanceiro.receitas} indent />
            <DRELine label="(-) Despesas Financeiras" value={d.resultadoFinanceiro.despesas} indent negative />
            <DRELine label="= Resultado Antes do IR" value={d.resultadoAntesIR} bold highlight />
            <DRELine label="(-) IR e CSLL" value={d.irCsll} indent negative />
            <DRELine label={`= Lucro Líquido (${margemLiquida}%)`} value={d.lucroLiquido} bold highlight />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DRETable;
