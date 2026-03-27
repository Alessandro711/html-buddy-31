import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ExcelImportProps {
  onImportComplete: () => void;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const num = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const s = String(v).replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(s) || 0;
};

const getMonth = (dateVal: unknown): string | null => {
  if (!dateVal) return null;
  // XLSX serial date number
  if (typeof dateVal === "number") {
    const d = XLSX.SSF.parse_date_code(dateVal);
    return MONTH_NAMES[d.m - 1] ?? null;
  }
  // JS Date object
  if (dateVal instanceof Date) {
    return MONTH_NAMES[dateVal.getMonth()] ?? null;
  }
  // String like "2026-01-15" or "15/01/2026"
  const s = String(dateVal);
  const m1 = s.match(/^(\d{4})-(\d{2})/);
  if (m1) return MONTH_NAMES[parseInt(m1[2]) - 1] ?? null;
  const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m2) return MONTH_NAMES[parseInt(m2[2]) - 1] ?? null;
  return null;
};

// Map tipo from the report to dashboard service category
const mapTipo = (tipo: string): keyof typeof TIPO_MAP => {
  const t = String(tipo).toLowerCase().trim();
  if (t.includes("consulta") && !t.includes("retorno")) return "consultas";
  if (t.includes("retorno")) return "retornos";
  if (t.includes("exame")) return "exames";
  if (t.includes("pequeno") || t.includes("procedimento")) return "procedimentos";
  return "outros";
};

const TIPO_MAP = {
  consultas: 0,
  exames: 0,
  procedimentos: 0,
  retornos: 0,
  outros: 0,
};

interface ImportResult {
  mes: string;
  totalRegistros: number;
  totalFaturamento: number;
  atendimentos: number;
  retornos: number;
}

// ─── Main parser for "Relatório de Produção Diária" format ───────────────────
// Expected columns (row 5 in the file, 0-indexed row 4):
// Prontuário | Nº Atendimento | Cliente | Data | Hora | Guia | Tipo |
// Cód./Convênio | Cód./Procedimento | (desc) | Profissional | Solicitante |
// Lote | Qtd | Honor($) | Desp.($) | Vlr.Tx($) | Desc. Conta | % | Total Conta | ...

async function importRelatorioProducao(rawRows: unknown[][]): Promise<ImportResult[]> {
  // Find header row — searches for "Prontuário" in any column (skips title rows)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
    const row = rawRows[i];
    if (row && row.some(c => String(c ?? "").trim() === "Prontuário" || String(c ?? "").trim() === "Data")) {
      // Confirm it's a real header by checking for "Tipo" or "Honor" in same row
      if (row.some(c => String(c ?? "").trim() === "Tipo" || String(c ?? "").includes("Honor"))) {
        headerIdx = i;
        break;
      }
    }
  }
  if (headerIdx === -1) throw new Error("Cabeçalho não encontrado. O arquivo deve ser o Relatório de Faturamento Analítico.");

  // Map header names to column indices — EXACT match first, then partial
  const headerRow = rawRows[headerIdx];
  const findCol = (...names: string[]): number => {
    for (const name of names) {
      const nl = name.toLowerCase().trim();
      // Exact match
      let idx = headerRow.findIndex(h => String(h ?? "").toLowerCase().trim() === nl);
      if (idx >= 0) return idx;
      // Partial match
      idx = headerRow.findIndex(h => String(h ?? "").toLowerCase().trim().includes(nl));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const iData         = findCol("data");
  const iProntuario   = findCol("prontuário", "prontuario", "pront");
  const iTipo         = findCol("tipo");
  const iConvenio     = findCol("cód./convênio", "convenio", "convênio");
  const iProfissional = findCol("profissional");
  const iHonor        = findCol("honor($)", "honor");
  const iDescConta    = findCol("desc. conta", "desc.conta");
  const iTotalConta   = findCol("total conta");

  if (iData === -1)  throw new Error(`Coluna Data não encontrada (idx=${iData}).`);
  if (iTipo === -1)  throw new Error(`Coluna Tipo não encontrada.`);
  if (iHonor === -1) throw new Error(`Coluna Honor($) não encontrada. Colunas disponíveis: ${headerRow.filter(Boolean).join(", ")}`);

  // Log found columns for debugging
  console.log("Colunas mapeadas:", { iData, iTipo, iConvenio, iProfissional, iHonor, iDescConta, iTotalConta });

  // Group by month
  const byMonth: Record<string, {
    faturamento: number;
    svc: typeof TIPO_MAP;
    atendimentos: number;
    retornos: number;
    entradas: number;
    lancamentos: Array<{
      data: string; tipo_raw: string; categoria: string;
      convenio: string; profissional: string; valor: number;
    }>;
  }> = {};

  const dataRows = rawRows.slice(headerIdx + 1);

  for (const row of dataRows) {
    if (!row || !Array.isArray(row)) continue;

    const dateVal = row[iData];
    const tipoVal = String(row[iTipo] ?? "").trim();

    if (!dateVal || !tipoVal || tipoVal === "") continue;
    // Skip footer rows (Status line at end)
    const dateStr2 = String(dateVal ?? "");
    if (dateStr2.toLowerCase().includes("status") || dateStr2.toLowerCase().includes("retorno:")) continue;
    // Skip rows where date is not a valid date
    if (typeof dateVal === "string" && dateVal.length < 6 && isNaN(Number(dateVal))) continue;

    const mes = getMonth(dateVal);
    if (!mes) continue;

    // Get date string
    let dataStr = "";
    if (dateVal instanceof Date) {
      dataStr = dateVal.toISOString().split("T")[0];
    } else if (typeof dateVal === "number") {
      const d = XLSX.SSF.parse_date_code(dateVal);
      dataStr = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    } else {
      dataStr = String(dateVal).split("T")[0];
    }

    if (!byMonth[mes]) {
      byMonth[mes] = {
        faturamento: 0,
        descontoTotal: 0,
        svc: { ...TIPO_MAP },
        atendimentos: 0,
        retornos: 0,
        entradas: 0,
        lancamentos: [],
      };
    }

    const m = byMonth[mes];
    const categoria    = mapTipo(tipoVal);
    const convenio     = iConvenio >= 0 ? String(row[iConvenio] ?? "PARTICULAR").trim() : "PARTICULAR";
    const profissional = iProfissional >= 0 ? String(row[iProfissional] ?? "").trim() : "";

    // Faturamento = Honor($) - Desc. Conta
    const honorVal  = num(row[iHonor]);
    const descVal   = iDescConta >= 0 ? num(row[iDescConta]) : 0;
    const valor     = honorVal - descVal;  // valor líquido por linha

    // ID Atendimento = Prontuário-DD-MM-YYYY
    const prontuario = iProntuario >= 0 ? String(row[iProntuario] ?? "").trim() : "";
    let idAtendimento = "";
    if (prontuario && dataStr) {
      const [yyyy, mm, dd] = dataStr.split("-");
      idAtendimento = `${prontuario}-${dd}-${mm}-${yyyy}`;
    }

    m.faturamento    += valor;
    m.descontoTotal  += descVal;
    m.entradas       += valor;
    m.svc[categoria] += valor;
    m.atendimentos   += 1;
    if (categoria === "retornos") m.retornos += 1;

    m.lancamentos.push({
      data: dataStr,
      tipo_raw: tipoVal,
      categoria,
      convenio,
      profissional,
      valor,
      desconto: descVal,
      id_atendimento: idAtendimento,
    });
  }

  const results: ImportResult[] = [];

  for (const [mes, data] of Object.entries(byMonth)) {
    // 1. Recalculate monthly_revenue from ALL lancamentos of this month
    const { data: allLanc } = await supabase
      .from("lancamentos")
      .select("tipo, valor, desconto, status")
      .eq("mes", mes);

    const fatTotal  = (allLanc || []).filter(r => r.tipo==="receita" && r.status==="pago").reduce((s,r)=>s+Number(r.valor),0);
    const despTotal = (allLanc || []).filter(r => r.tipo==="despesa" && r.status==="pago").reduce((s,r)=>s+Number(r.valor),0);
    const descTotal = (allLanc || []).filter(r => r.tipo==="receita" && r.status==="pago").reduce((s,r)=>s+Number(r.desconto||0),0);

    // Also add new records being inserted now
    const newFat  = newRecords.filter(r=>r.status==="pago").reduce((s,r)=>s+r.valor,0);
    const newDesc = newRecords.filter(r=>r.status==="pago").reduce((s,r)=>s+(r.desconto||0),0);

    const finalFat  = Math.round((fatTotal  + newFat)  * 100) / 100;
    const finalDesp = Math.round(despTotal  * 100) / 100;
    const finalDesc = Math.round((descTotal + newDesc) * 100) / 100;

    await supabase.from("monthly_revenue").upsert({
      month: mes,
      faturamento:    finalFat,
      despesas:       finalDesp,
      lucro:          Math.round((finalFat - finalDesp) * 100) / 100,
      desconto_total: finalDesc,
    }, { onConflict: "month" });

    // 2. Upsert monthly_service_revenue
    await supabase.from("monthly_service_revenue").upsert({
      month: mes,
      consultas: Math.round(data.svc.consultas * 100) / 100,
      exames: Math.round(data.svc.exames * 100) / 100,
      procedimentos: Math.round(data.svc.procedimentos * 100) / 100,
      retornos: Math.round(data.svc.retornos * 100) / 100,
      outros: Math.round(data.svc.outros * 100) / 100,
    }, { onConflict: "month" });

    // 3. Upsert cash_flow entradas
    const cfExisting = await supabase.from("cash_flow").select("saidas").eq("month", mes).single();
    const saidas = cfExisting.data?.saidas ?? 0;
    await supabase.from("cash_flow").upsert({
      month: mes,
      entradas: Math.round(data.entradas * 100) / 100,
      saidas,
    }, { onConflict: "month" });

    // 4. Upsert monthly_operational
    const opExisting = await supabase.from("monthly_operational").select("inadimplencia").eq("month", mes).single();
    const inadimplencia = opExisting.data?.inadimplencia ?? 0;
    await supabase.from("monthly_operational").upsert({
      month: mes,
      atendimentos: data.atendimentos,
      inadimplencia,
    }, { onConflict: "month" });

    // 5. UPSERT lancamentos — preserva registros existentes, adiciona novos
    // Usa id_atendimento+categoria como chave para evitar duplicatas
    const toUpsert = data.lancamentos
      .filter(l => l.valor >= 0)
      .map(l => ({
        data: l.data,
        mes,
        tipo: "receita" as const,
        categoria: l.categoria === "consultas" ? "Consultas"
          : l.categoria === "exames" ? "Exames"
          : l.categoria === "procedimentos" ? "Procedimentos"
          : l.categoria === "retornos" ? "Retornos"
          : "Outros (Receita)",
        descricao: `${l.tipo_raw} — ${l.profissional}`,
        valor:    l.valor,
        desconto: l.desconto,
        id_atendimento: l.id_atendimento,
        forma_pagamento: l.convenio,
        status: "pago" as const,
      }));

    // Insert only records that don't already exist (by id_atendimento + categoria)
    // First get existing id_atendimentos for this month
    const { data: existing } = await supabase
      .from("lancamentos")
      .select("id_atendimento, categoria")
      .eq("mes", mes)
      .eq("tipo", "receita");

    const existingSet = new Set(
      (existing || []).map(e => `${e.id_atendimento}|${e.categoria}`)
    );

    const newRecords = toUpsert.filter(r =>
      !r.id_atendimento || !existingSet.has(`${r.id_atendimento}|${r.categoria}`)
    );

    if (newRecords.length > 0) {
      for (let i = 0; i < newRecords.length; i += 200) {
        await supabase.from("lancamentos").insert(newRecords.slice(i, i + 200));
      }
    }

    console.log(`${mes}: ${toUpsert.length} total, ${existingSet.size} existentes, ${newRecords.length} novos inseridos`);

    results.push({
      mes,
      totalRegistros: data.lancamentos.length,
      totalFaturamento: data.faturamento,
      atendimentos: data.atendimentos,
      retornos: data.retornos,
      descontoTotal: data.descontoTotal,
    });
  }

  return results;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ExcelImport = ({ onImportComplete }: ExcelImportProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // Get raw rows as array-of-arrays (preserves row structure including header rows)
      const rawRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

      const importResults = await importRelatorioProducao(rawRows);

      setResults(importResults);
      toast.success(`Importação concluída! ${importResults.length} mês(es) processado(s).`);
      onImportComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setError(msg);
      toast.error("Erro na importação: " + msg);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResults(null); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Relatório de Produção Diária</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!results && !error && (
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 text-center">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Relatório de Faturamento Analítico
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Exporte do sistema da clínica no formato padrão (.xlsx ou .xls)
                e importe aqui. Os dados de receita serão atualizados automaticamente.
              </p>
              <div className="mt-2 rounded-lg bg-muted/50 px-4 py-2 text-left text-xs text-muted-foreground space-y-0.5">
                <p>✓ Consultas, Exames, Retornos e Pequenos Atendimentos</p>
                <p>✓ Totais por mês calculados automaticamente</p>
                <p>✓ Histórico preservado — só o mês importado é atualizado</p>
              </div>
              <div className="mt-5">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                  className="hidden"
                  id="excel-upload"
                />
                <Button
                  disabled={loading}
                  onClick={() => fileRef.current?.click()}
                  className="gap-2"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Processando...</>
                    : <><Upload className="h-4 w-4" />Selecionar arquivo</>
                  }
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Processando relatório e salvando no banco...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Erro na importação</p>
                  <p className="mt-1 text-xs text-destructive/80">{error}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Verifique se o arquivo é o Relatório de Faturamento Analítico exportado pelo sistema da clínica.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => { setError(null); }}>
                Tentar novamente
              </Button>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--success))]">
                <CheckCircle2 className="h-5 w-5" />
                Importação concluída com sucesso!
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left">Mês</th>
                      <th className="px-3 py-2 text-right">Atendimentos</th>
                      <th className="px-3 py-2 text-right">Descontos</th>
                      <th className="px-3 py-2 text-right">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.mes} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{r.mes}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{r.atendimentos.toLocaleString("pt-BR")}</td>
                        <td className="px-3 py-2 text-right font-medium text-destructive">({fmt(r.descontoTotal ?? 0)})</td>
                        <td className="px-3 py-2 text-right font-medium text-[hsl(var(--success))]">{fmt(r.totalFaturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="w-full" onClick={() => { setOpen(false); setResults(null); }}>
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImport;
