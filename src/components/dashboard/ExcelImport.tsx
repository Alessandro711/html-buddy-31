import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ExcelImportProps {
  onImportComplete: () => void;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const normalizeMonth = (value: string): string | null => {
  const v = String(value).trim().substring(0, 3);
  const found = MONTH_NAMES.find((m) => m.toLowerCase() === v.toLowerCase());
  return found ?? null;
};

const num = (v: unknown): number => Number(v) || 0;

const ExcelImport = ({ onImportComplete }: ExcelImportProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);

      for (const sheetName of wb.SheetNames) {
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
        if (!rows.length) continue;

        const name = sheetName.toLowerCase().trim();

        if (name.includes("receita") || name.includes("faturamento") || name === "revenue") {
          await upsertRevenue(rows);
        } else if (name.includes("despesa") || name.includes("expense")) {
          await upsertExpenses(rows);
        } else if (name.includes("servi") || name.includes("service")) {
          await upsertServiceRevenue(rows);
        } else if (name.includes("operac") || name.includes("operational")) {
          await upsertOperational(rows);
        } else if (name.includes("caixa") || name.includes("cash")) {
          await upsertCashFlow(rows);
        } else {
          // Try to auto-detect by columns
          const cols = Object.keys(rows[0]);
          const colStr = cols.join(",").toLowerCase();

          if (colStr.includes("faturamento")) await upsertRevenue(rows);
          else if (colStr.includes("folha") || colStr.includes("pagamento")) await upsertExpenses(rows);
          else if (colStr.includes("consulta")) await upsertServiceRevenue(rows);
          else if (colStr.includes("atendimento")) await upsertOperational(rows);
          else if (colStr.includes("entrada")) await upsertCashFlow(rows);
        }
      }

      toast.success("Dados importados com sucesso!");
      onImportComplete();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao importar arquivo. Verifique o formato.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Dados do Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              O arquivo deve conter abas nomeadas conforme os dados:
            </p>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li><strong>Receita/Faturamento</strong>: mês, faturamento, despesas, lucro</li>
              <li><strong>Despesas</strong>: mês, folhaPagamento, materiaisInsumos, aluguelCondominio, equipamentos, marketing, impostos, outros</li>
              <li><strong>Serviços</strong>: mês, consultas, exames, procedimentos, retornos, outros</li>
              <li><strong>Operacional</strong>: mês, atendimentos, inadimplencia</li>
              <li><strong>Fluxo de Caixa</strong>: mês, entradas, saidas</li>
            </ul>
            <div className="mt-4">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="hidden"
                id="excel-upload"
              />
              <Button
                variant="default"
                disabled={loading}
                onClick={() => fileRef.current?.click()}
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loading ? "Importando..." : "Selecionar Arquivo"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

async function upsertRevenue(rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const month = normalizeMonth(String(row.month ?? row.mes ?? row.mês ?? row.Month ?? ""));
    if (!month) continue;
    const { error } = await supabase.from("monthly_revenue").upsert(
      { month, faturamento: num(row.faturamento), despesas: num(row.despesas), lucro: num(row.lucro) },
      { onConflict: "month" }
    );
    if (error) console.error("Revenue upsert error:", error);
  }
}

async function upsertExpenses(rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const month = normalizeMonth(String(row.month ?? row.mes ?? row.mês ?? row.Month ?? ""));
    if (!month) continue;
    const { error } = await supabase.from("monthly_expenses").upsert(
      {
        month,
        folha_pagamento: num(row.folhaPagamento ?? row.folha_pagamento),
        materiais_insumos: num(row.materiaisInsumos ?? row.materiais_insumos),
        aluguel_condominio: num(row.aluguelCondominio ?? row.aluguel_condominio),
        equipamentos: num(row.equipamentos),
        marketing: num(row.marketing),
        impostos: num(row.impostos),
        outros: num(row.outros),
      },
      { onConflict: "month" }
    );
    if (error) console.error("Expenses upsert error:", error);
  }
}

async function upsertServiceRevenue(rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const month = normalizeMonth(String(row.month ?? row.mes ?? row.mês ?? row.Month ?? ""));
    if (!month) continue;
    const { error } = await supabase.from("monthly_service_revenue").upsert(
      {
        month,
        consultas: num(row.consultas),
        exames: num(row.exames),
        procedimentos: num(row.procedimentos),
        retornos: num(row.retornos),
        outros: num(row.outros),
      },
      { onConflict: "month" }
    );
    if (error) console.error("Service revenue upsert error:", error);
  }
}

async function upsertOperational(rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const month = normalizeMonth(String(row.month ?? row.mes ?? row.mês ?? row.Month ?? ""));
    if (!month) continue;
    const { error } = await supabase.from("monthly_operational").upsert(
      {
        month,
        atendimentos: num(row.atendimentos),
        inadimplencia: num(row.inadimplencia),
      },
      { onConflict: "month" }
    );
    if (error) console.error("Operational upsert error:", error);
  }
}

async function upsertCashFlow(rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const month = normalizeMonth(String(row.month ?? row.mes ?? row.mês ?? row.Month ?? ""));
    if (!month) continue;
    const { error } = await supabase.from("cash_flow").upsert(
      { month, entradas: num(row.entradas), saidas: num(row.saidas) },
      { onConflict: "month" }
    );
    if (error) console.error("Cash flow upsert error:", error);
  }
}

export default ExcelImport;
