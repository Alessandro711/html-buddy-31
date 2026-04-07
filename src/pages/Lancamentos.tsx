import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, RefreshCw, CheckCircle2, AlertCircle, Pencil, X, Download, FileSpreadsheet } from "lucide-react";


// ── Modelos Excel embutidos ──────────────────────────────────────────────────
const MODELO_RECEITAS_B64 = "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";
const MODELO_DESPESAS_B64 = "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";

function downloadModelo(b64: string, filename: string) {
  const bin   = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const CATEGORIAS_RECEITA = [
  { label:"Consultas",            group:"Receita por Serviço" },
  { label:"Exames",               group:"Receita por Serviço" },
  { label:"Procedimentos",        group:"Receita por Serviço" },
  { label:"Retornos",             group:"Receita por Serviço" },
  { label:"Outros (Receita)",     group:"Receita por Serviço" },
  { label:"Receitas Financeiras", group:"Financeiro"          },
];

const CATEGORIAS_DESPESA = [
  { label:"Impostos sobre Receita",     group:"Deduções da Receita Bruta" },
  { label:"Descontos e Abatimentos",    group:"Deduções da Receita Bruta" },
  { label:"Materiais e Insumos",        group:"Custos Diretos"            },
  { label:"Pessoal Assistencial",       group:"Custos Diretos"            },
  { label:"Pessoal Administrativo",     group:"Despesas Operacionais"     },
  { label:"Aluguel e Condomínio",       group:"Despesas Operacionais"     },
  { label:"Outros Administrativos",     group:"Despesas Operacionais"     },
  { label:"Marketing",                  group:"Despesas Operacionais"     },
  { label:"Equipamentos / Depreciação", group:"Despesas Operacionais"     },
  { label:"Despesas Financeiras",       group:"Financeiro"                },
  { label:"IR e CSLL",                  group:"Fiscal"                    },
];

const CAT_TO_EXP: Record<string,string> = {
  "Impostos sobre Receita":"impostos","Descontos e Abatimentos":"descontos_abatimentos",
  "Materiais e Insumos":"materiais_insumos","Pessoal Assistencial":"folha_pagamento",
  "Pessoal Administrativo":"folha_pagamento","Aluguel e Condomínio":"aluguel_condominio",
  "Outros Administrativos":"outros","Marketing":"marketing",
  "Equipamentos / Depreciação":"equipamentos","Despesas Financeiras":"despesas_financeiras",
  "IR e CSLL":"ir_csll",
};

const CAT_TO_SVC: Record<string,string> = {
  "Consultas":"consultas","Exames":"exames","Procedimentos":"procedimentos",
  "Retornos":"retornos","Outros (Receita)":"outros",
};

const CAT_DRE_LABEL: Record<string,string> = {
  "Impostos sobre Receita":"(-) Impostos sobre Receita",
  "Descontos e Abatimentos":"(-) Descontos e Abatimentos",
  "Materiais e Insumos":"(-) Custos com Materiais",
  "Pessoal Assistencial":"(-) Custos com Pessoal Assistencial",
  "Pessoal Administrativo":"(-) Despesas Administrativas",
  "Aluguel e Condomínio":"(-) Despesas Administrativas",
  "Outros Administrativos":"(-) Despesas Administrativas",
  "Marketing":"(-) Despesas Comerciais",
  "Equipamentos / Depreciação":"(-) Depreciações",
  "Despesas Financeiras":"(-) Despesas Financeiras",
  "IR e CSLL":"(-) IR e CSLL",
  "Receitas Financeiras":"(+) Receitas Financeiras",
};

const FORMAS_PAGAMENTO = ["Dinheiro","Cartão de Crédito","Cartão de Débito","Pix","Convênio","Boleto","Transferência","Nota de Débito"];

type Tipo = "receita" | "despesa";
type Status = "pago" | "pendente" | "cancelado";

type Lancamento = {
  id: string; data: string; mes: string;
  tipo: Tipo; categoria: string; descricao: string;
  valor: number; forma_pagamento: string; status: Status;
  created_at: string;
};

type FormState = {
  data: string; tipo: Tipo; categoria: string;
  descricao: string; valor: string;
  forma_pagamento: string; status: Status;
};

const EMPTY_FORM: FormState = {
  data: new Date().toISOString().split("T")[0],
  tipo: "receita", categoria: "", descricao: "",
  valor: "", forma_pagamento: "Pix", status: "pago",
};

const fmt = (v: number) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const getMes = (d: string) => MONTHS[new Date(d+"T12:00:00").getMonth()];

async function recomputeMonth(mes: string) {
  const { data: rows } = await supabase.from("lancamentos").select("*").eq("mes",mes).eq("status","pago");
  if (!rows) return;
  const receitas = rows.filter(r=>r.tipo==="receita");
  const despesas = rows.filter(r=>r.tipo==="despesa");
  const totalRec = receitas.reduce((s,r)=>s+Number(r.valor),0);
  const totalDesp= despesas.reduce((s,r)=>s+Number(r.valor),0);

  const totalDesc = receitas.reduce((s,r)=>s+Number(r.desconto||0),0);

  await supabase.from("monthly_revenue").upsert(
    { month:mes, faturamento:totalRec, despesas:totalDesp, lucro:totalRec-totalDesp, desconto_total:totalDesc },
    { onConflict:"month,ano" }
  );

  const exp: Record<string,number> = {
    folha_pagamento:0,materiais_insumos:0,aluguel_condominio:0,
    equipamentos:0,marketing:0,impostos:0,outros:0,
    receitas_financeiras:0,despesas_financeiras:0,ir_csll:0,descontos_abatimentos:0,
  };
  receitas.filter(r=>r.categoria==="Receitas Financeiras").forEach(r=>{ exp.receitas_financeiras+=Number(r.valor); });
  despesas.forEach(r=>{ const col=CAT_TO_EXP[r.categoria]; if(col&&col in exp) exp[col]+=Number(r.valor); });
  await supabase.from("monthly_expenses").upsert({ month:mes,...exp },{ onConflict:"month,ano" });

  const svc: Record<string,number> = { consultas:0,exames:0,procedimentos:0,retornos:0,outros:0 };
  receitas.filter(r=>r.categoria!=="Receitas Financeiras").forEach(r=>{
    const col=CAT_TO_SVC[r.categoria]; if(col&&col in svc) svc[col]+=Number(r.valor);
  });
  await supabase.from("monthly_service_revenue").upsert({ month:mes,...svc },{ onConflict:"month,ano" });
  await supabase.from("cash_flow").upsert({ month:mes, entradas:totalRec, saidas:totalDesp },{ onConflict:"month,ano" });

  const atend = receitas.filter(r=>["Consultas","Retornos"].includes(r.categoria)).length;
  const pend = (await supabase.from("lancamentos").select("id").eq("mes",mes).eq("tipo","receita").eq("status","pendente")).data?.length??0;
  const total = rows.filter(r=>r.tipo==="receita").length;
  const inad = total+pend>0?Math.round((pend/(total+pend))*1000)/10:0;
  await supabase.from("monthly_operational").upsert({ month:mes, atendimentos:atend, inadimplencia:inad },{ onConflict:"month,ano" });
}

export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast,   setToast]     = useState<{msg:string;ok:boolean}|null>(null);
  const [filterMes, setFilterMes] = useState("todos");
  const [editingId, setEditingId] = useState<string|null>(null);   // ID being edited
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // ── Histórico filtra automaticamente pelo tipo selecionado no formulário ──
  const histTipo = form.tipo;

  const showToast = (msg:string,ok=true) => {
    setToast({msg,ok}); setTimeout(()=>setToast(null),3500);
  };

  const fetchLancamentos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lancamentos")
      .select("*")
      .order("data", { ascending: false })
      .limit(500);
    setLancamentos((data as unknown as Lancamento[])||[]);
    setLoading(false);
  },[]);

  useEffect(()=>{ fetchLancamentos(); },[fetchLancamentos]);

  // ── Começa edição: preenche formulário com dados do lançamento ─────────────
  const startEdit = (l: Lancamento) => {
    setEditingId(l.id);
    setForm({
      data:            l.data,
      tipo:            l.tipo,
      categoria:       l.categoria,
      descricao:       l.descricao||"",
      valor:           String(l.valor),
      forma_pagamento: l.forma_pagamento||"Pix",
      status:          l.status,
    });
    window.scrollTo({ top: 0, behavior:"smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ── Salvar (novo ou edição) ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.data||!form.categoria||!form.valor){
      showToast("Preencha data, categoria e valor.",false); return;
    }
    const valor = parseFloat(form.valor.replace(",","."));
    if (isNaN(valor)||valor<=0){ showToast("Valor inválido.",false); return; }

    setSaving(true);
    const mes = getMes(form.data);
    const payload = {
      data:form.data, mes, tipo:form.tipo, categoria:form.categoria,
      descricao:form.descricao, valor,
      forma_pagamento:form.forma_pagamento, status:form.status,
    };

    if (editingId) {
      // ── Edição: obtém mês antigo para recalcular caso tenha mudado ─────
      const old = lancamentos.find(l=>l.id===editingId);
      const oldMes = old?.mes;

      const { error } = await supabase.from("lancamentos").update(payload).eq("id",editingId);
      if (error){ showToast("Erro: "+error.message,false); setSaving(false); return; }

      await recomputeMonth(mes);
      if (oldMes && oldMes !== mes) await recomputeMonth(oldMes);
      showToast("Lançamento atualizado!");
      setEditingId(null);
    } else {
      // ── Novo lançamento ────────────────────────────────────────────────
      const { error } = await supabase.from("lancamentos").insert(payload);
      if (error){ showToast("Erro: "+error.message,false); setSaving(false); return; }
      await recomputeMonth(mes);
      showToast("Lançamento salvo!");
    }

    setForm(f=>({ ...EMPTY_FORM, tipo:f.tipo, data:f.data }));
    await fetchLancamentos();
    setSaving(false);
  };



  // ── Excluir por período ───────────────────────────────────────────────────
  const [showDeletePeriod, setShowDeletePeriod] = useState(false);
  const [delStartDate, setDelStartDate]         = useState(new Date().toISOString().split("T")[0]);
  const [delEndDate,   setDelEndDate]           = useState(new Date().toISOString().split("T")[0]);
  const [delTipo,      setDelTipo]              = useState<"todos"|"receita"|"despesa">("todos");
  const [deleting,     setDeleting]             = useState(false);

  const handleDeletePeriod = async () => {
    const count = lancamentos.filter(l => {
      if (l.data < delStartDate || l.data > delEndDate) return false;
      if (delTipo !== "todos" && l.tipo !== delTipo) return false;
      return true;
    }).length;

    if (count === 0) { showToast("Nenhum lançamento encontrado no período.", false); return; }
    if (!confirm(`Excluir ${count} lançamento(s) de ${new Date(delStartDate+"T12:00:00").toLocaleDateString("pt-BR")} a ${new Date(delEndDate+"T12:00:00").toLocaleDateString("pt-BR")}?`)) return;

    setDeleting(true);
    let query = supabase.from("lancamentos").delete()
      .gte("data", delStartDate)
      .lte("data", delEndDate);
    if (delTipo !== "todos") query = query.eq("tipo", delTipo);
    const { error } = await query;

    if (error) { showToast("Erro ao excluir: " + error.message, false); setDeleting(false); return; }

    // Recompute all affected months
    const meses = [...new Set(
      lancamentos
        .filter(l => l.data >= delStartDate && l.data <= delEndDate && (delTipo === "todos" || l.tipo === delTipo))
        .map(l => l.mes)
    )];
    for (const mes of meses) await recomputeMonth(mes);

    await fetchLancamentos();
    try { localStorage.removeItem('clinica_financial_cache_v4'); window.dispatchEvent(new Event('clinica_data_updated')); } catch {}
    showToast(`${count} lançamento(s) excluído(s) com sucesso!`);
    setShowDeletePeriod(false);
    setDeleting(false);
  };

  // ── Importar Excel (receitas ou despesas) ────────────────────────────────
  const handleImportFile = async (file: File, tipoImport: "receita" | "despesa") => {
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

      // ── RECEITA: mesma estrutura do Relatório de Produção Diária ──────────
      if (tipoImport === "receita") {
        // find header row
        let hdrIdx = -1;
        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
          const r = rawRows[i];
          if (r?.some((c: unknown) => String(c ?? "").includes("Prontuário") || String(c ?? "").toLowerCase().includes("tipo *"))) {
            hdrIdx = i; break;
          }
        }
        if (hdrIdx === -1) throw new Error("Cabeçalho não encontrado. Use o modelo de receitas.");

        const headers = rawRows[hdrIdx].map((h: unknown) => String(h ?? "").toLowerCase().trim());
        const iData   = headers.findIndex(h => h.includes("data"));
        const iTipo   = headers.findIndex(h => h === "tipo" || h === "tipo *");
        const iHonorL = headers.findIndex(h => h.includes("honor"));
        const iDescL  = headers.findIndex(h => h.includes("desc. conta") || h.includes("desc.conta"));
        const iProf   = headers.findIndex(h => h.includes("profissional"));
        const iConv   = headers.findIndex(h => h.includes("convênio") || h.includes("convenio"));
        const iProntL = headers.findIndex(h => h.includes("prontuário") || h.includes("prontuario") || h === "prontuário");

        if (iData === -1 || iTipo === -1 || iHonorL === -1)
          throw new Error("Colunas obrigatórias não encontradas (Data, Tipo, Honor($)).");

        const mapTipo = (t: string) => {
          const v = t.toLowerCase();
          if (v.includes("retorno"))  return "Retornos";
          if (v.includes("exame"))    return "Exames";
          if (v.includes("pequeno") || v.includes("procedimento")) return "Procedimentos";
          return "Consultas";
        };

        const getD = (v: unknown): string => {
          if (v instanceof Date) return v.toISOString().split("T")[0];
          if (typeof v === "number") {
            try { const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`; } catch { return ""; }
          }
          const s = String(v || "");
          const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
          if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
          return s.split("T")[0];
        };

        const getM = (v: unknown): string | null => {
          if (v instanceof Date) return MONTHS[v.getMonth()] ?? null;
          if (typeof v === "number") {
            try { const d = XLSX.SSF.parse_date_code(v); return MONTHS[d.m-1] ?? null; } catch { return null; }
          }
          const s = String(v || "");
          const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
          if (m1) return MONTHS[parseInt(m1[2])-1] ?? null;
          const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (m2) return MONTHS[parseInt(m2[2])-1] ?? null;
          return null;
        };

        const numVal = (v: unknown) => parseFloat(String(v ?? "0").replace(/[^\d,.-]/g,"").replace(",",".")) || 0;

        const byMonth: Record<string, unknown[]> = {};
        for (const row of rawRows.slice(hdrIdx + 1)) {
          if (!row || !Array.isArray(row)) continue;
          const dateVal = row[iData]; const tipoVal = String(row[iTipo] ?? "").trim();
          if (!dateVal || !tipoVal || tipoVal.startsWith("──")) continue;
          const mes = getM(dateVal); if (!mes) continue;
          const honorV = numVal(row[iHonorL]);
          const descV  = iDescL >= 0 ? numVal(row[iDescL]) : 0;
          const valor  = honorV - descV;
          const dStr   = getD(dateVal);
          if (!byMonth[mes]) byMonth[mes] = [];
          byMonth[mes].push({
            data: dStr, mes, tipo: "receita",
            categoria: mapTipo(tipoVal),
            descricao: `${tipoVal} — ${iProf >= 0 ? String(row[iProf] ?? "") : ""}`,
            valor, desconto: descV,
            forma_pagamento: iConv >= 0 ? String(row[iConv] ?? "PARTICULAR") : "PARTICULAR",
            status: "pago",
          });
        }
        if (!Object.keys(byMonth).length) throw new Error("Nenhuma linha válida encontrada.");
        let totalNew = 0;
        for (const [mes, rows] of Object.entries(byMonth)) {
          // Delete existing receitas for this month, then insert fresh
          await supabase.from("lancamentos").delete().eq("mes", mes).eq("tipo", "receita");
          const insertRows = rows as any[];
          if (insertRows.length > 0) {
            for (let i = 0; i < insertRows.length; i += 200) {
              const { error } = await supabase.from("lancamentos").insert(insertRows.slice(i, i+200));
              if (error) console.error("Insert error:", error);
            }
          }
          totalNew += insertRows.length;
          await recomputeMonth(mes);
        }
        showToast(`Receitas importadas! ${totalNew} registros processados.`);
        // Signal dashboard to refresh
        try { localStorage.removeItem('clinica_financial_cache_v5'); window.dispatchEvent(new Event('clinica_data_updated')); } catch {}

      // ── DESPESA: formato do modelo de despesas ─────────────────────────────
      } else {
        const CAT_MAP: Record<string,string> = {
          "Impostos sobre Receita":"impostos","Descontos e Abatimentos":"descontos_abatimentos",
          "Materiais e Insumos":"materiais_insumos","Pessoal Assistencial":"folha_pagamento",
          "Pessoal Administrativo":"folha_pagamento","Aluguel e Condomínio":"aluguel_condominio",
          "Outros Administrativos":"outros","Marketing":"marketing",
          "Equipamentos / Depreciação":"equipamentos","Despesas Financeiras":"despesas_financeiras",
          "IR e CSLL":"ir_csll",
        };
        let hdrIdx = -1;
        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
          if (rawRows[i]?.some((c: unknown) => String(c ?? "").toLowerCase().includes("categoria"))) { hdrIdx = i; break; }
        }
        if (hdrIdx === -1) throw new Error("Cabeçalho não encontrado. Use o modelo de despesas.");

        const headers = rawRows[hdrIdx].map((h: unknown) => String(h ?? "").toLowerCase().trim());
        const iData   = headers.findIndex(h => h.includes("data"));
        const iCat    = headers.findIndex(h => h.includes("categoria") || h === "categoria *");
        const iValor  = headers.findIndex(h => h.includes("valor"));
        const iDescr  = headers.findIndex(h => h.includes("descri"));
        const iForma  = headers.findIndex(h => h.includes("forma"));
        const iStatus = headers.findIndex(h => h.includes("status"));

        const getD2 = (v: unknown): string => {
          if (v instanceof Date) return v.toISOString().split("T")[0];
          if (typeof v === "number") {
            try { const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`; } catch { return ""; }
          }
          const s = String(v || "");
          const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
          if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
          return s.split("T")[0];
        };

        const getM2 = (v: unknown): string | null => {
          if (v instanceof Date) return MONTHS[v.getMonth()] ?? null;
          if (typeof v === "number") {
            try { const d = XLSX.SSF.parse_date_code(v); return MONTHS[d.m-1] ?? null; } catch { return null; }
          }
          const s = String(v || "");
          const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
          if (m1) return MONTHS[parseInt(m1[2])-1] ?? null;
          const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (m2) return MONTHS[parseInt(m2[2])-1] ?? null;
          return null;
        };

        const numVal2 = (v: unknown) => parseFloat(String(v ?? "0").replace(/[^\d,.-]/g,"").replace(",",".")) || 0;

        const byMonth: Record<string,unknown[]> = {};
        for (const row of rawRows.slice(hdrIdx + 1)) {
          if (!row || !Array.isArray(row)) continue;
          const dateVal = row[iData]; const catVal = String(row[iCat] ?? "").trim();
          if (!dateVal || !catVal || catVal.startsWith("──") || !CAT_MAP[catVal]) continue;
          const mes = getM2(dateVal); if (!mes) continue;
          const valor = numVal2(row[iValor]); if (valor <= 0) continue;
          if (!byMonth[mes]) byMonth[mes] = [];
          byMonth[mes].push({
            data: getD2(dateVal), mes, tipo: "despesa", categoria: catVal,
            descricao: iDescr >= 0 ? String(row[iDescr] ?? "") : "",
            valor, forma_pagamento: iForma >= 0 ? String(row[iForma] ?? "Pix") : "Pix",
            status: iStatus >= 0 ? String(row[iStatus] ?? "pago").toLowerCase() : "pago",
          });
        }
        if (!Object.keys(byMonth).length) throw new Error("Nenhuma linha válida encontrada.");
        for (const [mes, rows] of Object.entries(byMonth)) {
          await supabase.from("lancamentos").delete().eq("mes", mes).eq("tipo", "despesa");
          for (let i = 0; i < rows.length; i += 200)
            await supabase.from("lancamentos").insert(rows.slice(i, i+200) as any);
          await recomputeMonth(mes);
        }
        showToast(`Despesas importadas! ${Object.values(byMonth).reduce((s,r)=>s+r.length,0)} registros.`);
        // Signal dashboard to refresh
        try { localStorage.removeItem('clinica_financial_cache_v4'); window.dispatchEvent(new Event('clinica_data_updated')); } catch {}
      }

      await fetchLancamentos();
    } catch(err: unknown) {
      showToast((err instanceof Error ? err.message : "Erro na importação"), false);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id:string,mes:string) => {
    if (!confirm("Excluir este lançamento?")) return;
    if (editingId===id) cancelEdit();
    await supabase.from("lancamentos").delete().eq("id",id);
    await recomputeMonth(mes);
    await fetchLancamentos();
    showToast("Lançamento excluído.");
  };

  const categorias = form.tipo==="receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  const grupos = categorias.reduce<Record<string,string[]>>((acc,c)=>{
    if(!acc[c.group]) acc[c.group]=[];
    acc[c.group].push(c.label); return acc;
  },{});

  // Histórico: filtra por tipo (sincronizado) + mês opcional
  const filtered = lancamentos.filter(l => {
    if (l.tipo !== histTipo) return false;
    if (filterMes!=="todos" && l.mes!==filterMes) return false;
    return true;
  });

  const totalReceitas = lancamentos.filter(l=>l.tipo==="receita"&&l.status==="pago").reduce((s,l)=>s+Number(l.valor),0);
  const totalDespesas = lancamentos.filter(l=>l.tipo==="despesa"&&l.status==="pago").reduce((s,l)=>s+Number(l.valor),0);
  const saldo = totalReceitas - totalDespesas;

  const isEditing = !!editingId;

  return (
    <div className="min-h-screen bg-background">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg
          ${toast.ok?"bg-[hsl(var(--success))] text-white":"bg-destructive text-white"}`}>
          {toast.ok?<CheckCircle2 className="h-4 w-4"/>:<AlertCircle className="h-4 w-4"/>}
          {toast.msg}
        </div>
      )}

      <main className="w-full space-y-4 sm:space-y-6 px-3 py-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* ── COLUNA ESQUERDA: Formulário + Importação ─────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  {isEditing
                    ? <><Pencil className="h-5 w-5 text-primary"/> Editar lançamento</>
                    : <><PlusCircle className="h-5 w-5 text-primary"/> Novo lançamento</>
                  }
                </span>
                {isEditing && (
                  <button onClick={cancelEdit}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5"/> Cancelar
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Tipo — muda o histórico junto */}
              <div className="flex rounded-xl overflow-hidden border border-border">
                {(["receita","despesa"] as Tipo[]).map(t=>(
                  <button key={t}
                    onClick={()=>setForm(f=>({...f,tipo:t,categoria:""}))}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize
                      ${form.tipo===t
                        ? t==="receita"?"bg-[hsl(var(--success))] text-white":"bg-destructive text-white"
                        : "bg-card text-muted-foreground hover:bg-muted"}`}
                  >
                    {t==="receita"?"Receita":"Despesa"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Data *</Label>
                  <Input type="date" value={form.data}
                    onChange={e=>setForm(f=>({...f,data:e.target.value}))}/>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Valor (R$) *</Label>
                  <Input placeholder="0,00" value={form.valor}
                    onChange={e=>setForm(f=>({...f,valor:e.target.value}))}/>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Categoria *</Label>
                <Select value={form.categoria} onValueChange={v=>setForm(f=>({...f,categoria:v}))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria..."/></SelectTrigger>
                  <SelectContent>
                    {Object.entries(grupos).map(([group,labels])=>(
                      <SelectGroup key={group}>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {group}
                        </SelectLabel>
                        {labels.map(l=>(
                          <SelectItem key={l} value={l}>
                            <div className="flex flex-col">
                              <span>{l}</span>
                              {CAT_DRE_LABEL[l] && (
                                <span className="text-[10px] text-muted-foreground">{CAT_DRE_LABEL[l]}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {form.categoria && CAT_DRE_LABEL[form.categoria] && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"/>
                    Na DRE: <span className="font-medium text-foreground">{CAT_DRE_LABEL[form.categoria]}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Input placeholder="Ex: Aluguel sala 01 — Janeiro" value={form.descricao}
                  onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Forma de pagamento</Label>
                  <Select value={form.forma_pagamento} onValueChange={v=>setForm(f=>({...f,forma_pagamento:v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(fp=><SelectItem key={fp} value={fp}>{fp}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v=>setForm(f=>({...f,status:v as Status}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving
                    ? (isEditing?"Salvando...":"Salvando...")
                    : (isEditing?"Salvar alterações":"Salvar lançamento")
                  }
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={cancelEdit} className="px-4">
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Importar Receitas via Excel ─────────────────────────────── */}
          {form.tipo === "receita" && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-[hsl(var(--success))]" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">Importar receitas em lote</span>
                </div>
                <button
                  onClick={() => downloadModelo(MODELO_RECEITAS_B64, "modelo_receitas.xlsx")}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-[hsl(var(--success))] hover:border-[hsl(var(--success))] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar modelo
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use o mesmo formato do Relatório de Produção Diária exportado pelo sistema da clínica.
              </p>
              <div>
                <input
                  type="file" accept=".xlsx,.xls"
                  className="hidden" id="import-receita"
                  onChange={e => { const f = e.target.files?.[0]; if(f) handleImportFile(f, "receita"); e.target.value=""; }}
                />
                <button
                  onClick={() => document.getElementById("import-receita")?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 px-4 py-2 text-xs font-medium text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 transition-colors disabled:opacity-50"
                >
                  {importing ? "Importando..." : <><FileSpreadsheet className="h-3.5 w-3.5" /> Selecionar arquivo de receitas</>}
                </button>
              </div>
            </div>
          )}

          {/* ── Importar Despesas via Excel ──────────────────────────────── */}
          {form.tipo === "despesa" && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-destructive" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">Importar despesas em lote</span>
                </div>
                <button
                  onClick={() => downloadModelo(MODELO_DESPESAS_B64, "modelo_despesas.xlsx")}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar modelo
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Preencha o modelo com as despesas do mês. As categorias devem ser exatamente as da lista da DRE.
              </p>
              <div>
                <input
                  type="file" accept=".xlsx,.xls"
                  className="hidden" id="import-despesa"
                  onChange={e => { const f = e.target.files?.[0]; if(f) handleImportFile(f, "despesa"); e.target.value=""; }}
                />
                <button
                  onClick={() => document.getElementById("import-despesa")?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                >
                  {importing ? "Importando..." : <><FileSpreadsheet className="h-3.5 w-3.5" /> Selecionar arquivo de despesas</>}
                </button>
              </div>
            </div>
          )}


          {/* ── Excluir por período ──────────────────────────────────────── */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">Excluir por período</span>
              </div>
              <button
                onClick={() => setShowDeletePeriod(o => !o)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                {showDeletePeriod ? "Fechar" : "Abrir"}
              </button>
            </div>

            {showDeletePeriod && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Data início</label>
                    <input type="date" value={delStartDate}
                      onChange={e => setDelStartDate(e.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-destructive/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Data fim</label>
                    <input type="date" value={delEndDate} min={delStartDate}
                      onChange={e => setDelEndDate(e.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-destructive/40"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    {(["todos","receita","despesa"] as const).map(t => (
                      <button key={t} onClick={() => setDelTipo(t)}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors capitalize
                          ${delTipo === t ? "bg-destructive text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}>
                        {t === "todos" ? "Todos" : t === "receita" ? "Receitas" : "Despesas"}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleDeletePeriod}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-destructive text-white py-2 text-xs font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Excluindo..." : "Excluir lançamentos do período"}
                </button>
              </div>
            )}
          </div>
          </div>{/* end left column */}

          {/* ── Histórico (coluna direita) ─────────────────────────────── */}
          <Card className="border-none shadow-md lg:col-span-8">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Histórico de lançamentos</CardTitle>
                  {/* Badge mostra qual tipo está sendo listado */}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${form.tipo==="receita"
                      ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                      : "bg-destructive/10 text-destructive"}`}>
                    {form.tipo==="receita"?"Receitas":"Despesas"}
                  </span>
                </div>
                <Select value={filterMes} onValueChange={setFilterMes}>
                  <SelectTrigger className="w-[110px] text-xs"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {MONTHS.map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-3">
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum lançamento de {form.tipo==="receita"?"receita":"despesa"} encontrado.
                </div>
              ) : (
                <div className="overflow-auto max-h-[400px] sm:max-h-[560px] lg:max-h-[680px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Data</TableHead>
                        <TableHead className="text-xs">Categoria</TableHead>
                        <TableHead className="text-xs">Descrição</TableHead>
                        <TableHead className="text-xs text-right">Valor</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="w-16 text-xs text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(l=>(
                        <TableRow key={l.id}
                          className={editingId===l.id?"bg-primary/5 ring-1 ring-inset ring-primary/30":""}>
                          <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(l.data+"T12:00:00").toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0
                                  ${l.tipo==="receita"?"bg-[hsl(var(--success))]":"bg-destructive"}`}/>
                                <span className="text-xs font-medium">{l.categoria}</span>
                              </div>
                              {CAT_DRE_LABEL[l.categoria] && (
                                <span className="text-[10px] text-muted-foreground pl-3">
                                  {CAT_DRE_LABEL[l.categoria]}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs text-muted-foreground max-w-[100px] truncate">
                            {l.descricao||"—"}
                          </TableCell>
                          <TableCell className={`py-2.5 text-xs text-right font-mono font-medium
                            ${l.tipo==="receita"?"text-[hsl(var(--success))]":"text-destructive"}`}>
                            {l.tipo==="despesa"?"-":"+"}{fmt(Number(l.valor))}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant="outline" className={`text-xs ${
                              l.status==="pago"    ?"border-[hsl(var(--success))] text-[hsl(var(--success))]":
                              l.status==="pendente"?"border-warning text-warning":
                              "border-muted-foreground text-muted-foreground"}`}>
                              {l.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Editar */}
                              <button
                                onClick={()=> editingId===l.id ? cancelEdit() : startEdit(l)}
                                title="Editar"
                                className={`rounded p-1 transition-colors
                                  ${editingId===l.id
                                    ?"text-primary bg-primary/10"
                                    :"text-muted-foreground hover:text-primary hover:bg-primary/10"}`}>
                                <Pencil className="h-3.5 w-3.5"/>
                              </button>
                              {/* Excluir */}
                              <button
                                onClick={()=>handleDelete(l.id,l.mes)}
                                title="Excluir"
                                className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-3.5 w-3.5"/>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
