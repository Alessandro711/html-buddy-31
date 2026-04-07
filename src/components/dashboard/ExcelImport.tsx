import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Loader2, Download, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ── Modelo de despesas embutido como base64 ───────────────────────────────────
const MODELO_B64 = "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";

const CAT_TO_EXP: Record<string, string> = {
  "Impostos sobre Receita":     "impostos",
  "Descontos e Abatimentos":    "descontos_abatimentos",
  "Materiais e Insumos":        "materiais_insumos",
  "Pessoal Assistencial":       "folha_pagamento",
  "Pessoal Administrativo":     "folha_pagamento",
  "Aluguel e Condomínio":       "aluguel_condominio",
  "Outros Administrativos":     "outros",
  "Marketing":                  "marketing",
  "Equipamentos / Depreciação": "equipamentos",
  "Despesas Financeiras":       "despesas_financeiras",
  "IR e CSLL":                  "ir_csll",
};

const VALID_CATS = Object.keys(CAT_TO_EXP);
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const num = (v: unknown) => {
  if (!v && v !== 0) return 0;
  return parseFloat(String(v).replace(/[^\d,.-]/g,"").replace(",",".")) || 0;
};

const getMonth = (v: unknown): string | null => {
  if (!v) return null;
  if (v instanceof Date) return MONTHS[v.getMonth()] ?? null;
  if (typeof v === "number") {
    try { const d = XLSX.SSF.parse_date_code(v); return MONTHS[d.m - 1] ?? null; } catch { return null; }
  }
  const s = String(v);
  const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m1) return MONTHS[parseInt(m1[2]) - 1] ?? null;
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return MONTHS[parseInt(m2[2]) - 1] ?? null;
  return null;
};

const getDateStr = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().split("T")[0];
  if (typeof v === "number") {
    try { const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`; } catch { return ""; }
  }
  return String(v || "").split("T")[0];
};

async function recomputeMonth(mes: string) {
  const { data: rows } = await supabase.from("lancamentos").select("*").eq("mes", mes).eq("status", "pago");
  if (!rows || rows.length === 0) return;

  // Group by ano for multi-year support
  const byAno: Record<number, typeof rows> = {};
  rows.forEach(r => {
    const a = r.ano ?? new Date().getFullYear();
    if (!byAno[a]) byAno[a] = [];
    byAno[a].push(r);
  });

  for (const [anoStr, anoRows] of Object.entries(byAno)) {
    const ano = Number(anoStr);
    const receitas = anoRows.filter(r => r.tipo === "receita");
    const despesas = anoRows.filter(r => r.tipo === "despesa");
    const totalRec  = receitas.reduce((s, r) => s + Number(r.valor), 0);
    const totalDesp = despesas.reduce((s, r) => s + Number(r.valor), 0);
    const totalDesc = receitas.reduce((s, r) => s + Number(r.desconto || 0), 0);

    await supabase.from("monthly_revenue").upsert(
      { month: mes, ano, faturamento: totalRec, despesas: totalDesp, lucro: totalRec - totalDesp, desconto_total: totalDesc },
      { onConflict: "month,ano" }
    );

    const exp: Record<string, number> = {
      folha_pagamento:0, materiais_insumos:0, aluguel_condominio:0,
      equipamentos:0, marketing:0, impostos:0, outros:0,
      receitas_financeiras:0, despesas_financeiras:0, ir_csll:0, descontos_abatimentos:0,
    };
    receitas.filter(r => r.categoria === "Receitas Financeiras").forEach(r => { exp.receitas_financeiras += Number(r.valor); });
    despesas.forEach(r => { const col = CAT_TO_EXP[r.categoria]; if (col && col in exp) exp[col] += Number(r.valor); });
    await supabase.from("monthly_expenses").upsert({ month: mes, ano, ...exp }, { onConflict: "month,ano" });

    const svc: Record<string,number> = { consultas:0, exames:0, procedimentos:0, retornos:0, outros:0 };
    const svcMap: Record<string,string> = { "Consultas":"consultas","Exames":"exames","Procedimentos":"procedimentos","Retornos":"retornos","Outros (Receita)":"outros" };
    receitas.filter(r => r.categoria !== "Receitas Financeiras").forEach(r => { const c = svcMap[r.categoria]; if (c) svc[c] += Number(r.valor); });
    await supabase.from("monthly_service_revenue").upsert({ month: mes, ano, ...svc }, { onConflict: "month,ano" });
    await supabase.from("cash_flow").upsert({ month: mes, ano, entradas: totalRec, saidas: totalDesp }, { onConflict: "month,ano" });

    const atend = receitas.filter(r => ["Consultas","Retornos"].includes(r.categoria)).length;
    const pend  = (await supabase.from("lancamentos").select("id").eq("mes",mes).eq("ano",ano).eq("tipo","receita").eq("status","pendente")).data?.length ?? 0;
    const tot   = receitas.length;
    await supabase.from("monthly_operational").upsert(
      { month: mes, ano, atendimentos: atend, inadimplencia: tot + pend > 0 ? Math.round((pend / (tot + pend)) * 1000) / 10 : 0 },
      { onConflict: "month,ano" }
    );
  }
}

interface ImportResult {
  mes: string; total: number; valor: number; erros: number;
}

interface Props { onImportComplete: () => void; }

export default function DespesaImport({ onImportComplete }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [errors,  setErrors]  = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Download do modelo ─────────────────────────────────────────────────────
  const downloadModelo = () => {
    const bin = atob(MODELO_B64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "modelo_despesas.xlsx"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Importar arquivo ───────────────────────────────────────────────────────
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setResults(null); setErrors([]);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

      // Achar linha do cabeçalho (contém "Categoria" ou "Data")
      let hdrIdx = -1;
      for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
        const r = rawRows[i];
        if (r?.some(c => String(c ?? "").toLowerCase().includes("categoria") || String(c ?? "").toLowerCase().includes("data *"))) {
          hdrIdx = i; break;
        }
      }
      if (hdrIdx === -1) throw new Error("Cabeçalho não encontrado. Use o modelo fornecido.");

      const headers = rawRows[hdrIdx].map(h => String(h ?? "").toLowerCase().trim());
      const iData   = headers.findIndex(h => h.includes("data"));
      const iCat    = headers.findIndex(h => h.includes("categoria"));
      const iDescr  = headers.findIndex(h => h.includes("descri"));
      const iValor  = headers.findIndex(h => h.includes("valor"));
      const iForma  = headers.findIndex(h => h.includes("forma"));
      const iStatus = headers.findIndex(h => h.includes("status"));

      if (iData === -1 || iCat === -1 || iValor === -1)
        throw new Error("Colunas obrigatórias não encontradas (Data, Categoria, Valor).");

      const byMonth: Record<string, Array<Record<string,unknown>>> = {};
      const rowErrors: string[] = [];
      let rowNum = hdrIdx + 2;

      for (const row of rawRows.slice(hdrIdx + 1)) {
        if (!row || !Array.isArray(row)) { rowNum++; continue; }

        const dateVal = row[iData];
        const catVal  = String(row[iCat] ?? "").trim();
        const valor   = num(row[iValor]);

        // Pula linhas de grupo (negrito/separador) e linhas vazias
        if (!dateVal || !catVal || catVal.startsWith("──")) { rowNum++; continue; }
        if (!getMonth(dateVal)) { rowNum++; continue; }

        // Valida categoria
        if (!VALID_CATS.includes(catVal)) {
          rowErrors.push(`Linha ${rowNum}: categoria "${catVal}" inválida.`);
          rowNum++; continue;
        }
        if (valor <= 0) { rowErrors.push(`Linha ${rowNum}: valor deve ser maior que zero.`); rowNum++; continue; }

        const mes = getMonth(dateVal)!;
        if (!byMonth[mes]) byMonth[mes] = [];
        byMonth[mes].push({
          data:            getDateStr(dateVal),
          mes,
          tipo:            "despesa",
          categoria:       catVal,
          descricao:       iDescr >= 0 ? String(row[iDescr] ?? "") : "",
          valor,
          forma_pagamento: iForma  >= 0 ? String(row[iForma]  ?? "Pix") : "Pix",
          status:          iStatus >= 0 ? String(row[iStatus] ?? "pago").toLowerCase() : "pago",
        });
        rowNum++;
      }

      if (Object.keys(byMonth).length === 0 && rowErrors.length === 0)
        throw new Error("Nenhuma linha de despesa válida encontrada.");

      const importResults: ImportResult[] = [];

      for (const [mes, rows] of Object.entries(byMonth)) {
        // Remove despesas existentes deste mês e insere novas
        await supabase.from("lancamentos").delete().eq("mes", mes).eq("tipo", "despesa");

        for (let i = 0; i < rows.length; i += 200)
          await supabase.from("lancamentos").insert(rows.slice(i, i + 200) as any);

        await recomputeMonth(mes);

        importResults.push({
          mes,
          total: rows.length,
          valor: rows.reduce((s, r) => s + Number(r.valor), 0),
          erros: rowErrors.filter(e => e.includes(mes)).length,
        });
      }

      setResults(importResults);
      setErrors(rowErrors);
      toast.success(`Importação concluída! ${Object.keys(byMonth).length} mês(es) processado(s).`);
      onImportComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setErrors([msg]);
      toast.error("Erro na importação: " + msg);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const reset = () => { setResults(null); setErrors([]); };

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Despesas
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Despesas — Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Tela inicial */}
          {!results && errors.length === 0 && (
            <>
              {/* Card download do modelo */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[hsl(var(--success))]/15 p-2">
                    <FileSpreadsheet className="h-5 w-5 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Modelo de despesas</p>
                    <p className="text-xs text-muted-foreground">Baixe, preencha e importe</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadModelo} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Baixar modelo
                </Button>
              </div>

              {/* Drop zone */}
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                <Upload className="mx-auto h-9 w-9 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Importar arquivo preenchido</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  As despesas do mês importado substituem as anteriores.<br/>
                  Meses não incluídos no arquivo não são alterados.
                </p>
                <div className="mt-2 space-y-1 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-left">
                  <p>✓ 11 categorias alinhadas à DRE</p>
                  <p>✓ Múltiplos meses no mesmo arquivo</p>
                  <p>✓ Dashboard atualizado automaticamente</p>
                </div>
                <div className="mt-5">
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
                  <Button disabled={loading} onClick={() => fileRef.current?.click()} className="gap-2">
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                      : <><Upload className="h-4 w-4" /> Selecionar arquivo</>}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Processando despesas e salvando no banco...</p>
            </div>
          )}

          {/* Erros sem resultados */}
          {!loading && errors.length > 0 && !results && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium text-destructive">Erro na importação</p>
              </div>
              {errors.slice(0,5).map((e,i) => <p key={i} className="text-xs text-destructive/80 pl-7">{e}</p>)}
              {errors.length > 5 && <p className="text-xs text-muted-foreground pl-7">...e mais {errors.length - 5} erros.</p>}
              <Button variant="outline" size="sm" className="mt-2" onClick={reset}>Tentar novamente</Button>
            </div>
          )}

          {/* Resultados */}
          {results && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--success))]">
                <CheckCircle2 className="h-5 w-5" />
                Importação concluída!
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left">Mês</th>
                      <th className="px-3 py-2 text-right">Lançamentos</th>
                      <th className="px-3 py-2 text-right">Total despesas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.mes} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{r.mes}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{r.total}</td>
                        <td className="px-3 py-2 text-right font-medium text-destructive">{fmt(r.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg bg-warning/10 border border-warning/20 px-3 py-2">
                  <p className="text-xs font-medium text-warning mb-1">{errors.length} linha(s) ignorada(s):</p>
                  {errors.slice(0,3).map((e,i) => <p key={i} className="text-xs text-muted-foreground">{e}</p>)}
                </div>
              )}

              <Button className="w-full" onClick={() => { setOpen(false); reset(); }}>Fechar</Button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
