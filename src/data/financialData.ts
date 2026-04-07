// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenuePoint {
  month: string; ano: number; faturamento: number; despesas: number; lucro: number; desconto_total?: number;
}

export interface CashFlowPoint {
  month: string; entradas: number; saidas: number;
}

export interface ExpenseBreakdownPoint {
  name: string; value: number; percentage: number;
}

export interface ServiceRevenuePoint {
  servico: string; valor: number;
}

export interface KPIData {
  faturamentoMensal: number; faturamentoVariacao: number;
  despesasMensal: number;    despesasVariacao: number;
  lucroLiquido: number;      lucroVariacao: number;
  margemLucro: number;       margemVariacao: number;
  ticketMedio: number;       ticketVariacao: number;
  inadimplencia: number;     inadimplenciaVariacao: number;
  inadimplenciaValor: number; inadimplenciaPercFat: number;
  descontoTotal: number; descontoPercFat: number;
}

export interface DreData {
  receitaBruta: number;
  deducoes: { impostos: number; descontos: number; total: number };
  receitaLiquida: number;
  custos: { materiais: number; pessoalAssistencial: number; total: number };
  lucroBruto: number;
  despesasOperacionais: { administrativas: number; comerciais: number; depreciacoes: number; total: number };
  resultadoOperacional: number;
  resultadoFinanceiro: { receitas: number; despesas: number; total: number };
  resultadoAntesIR: number;
  irCsll: number;
  lucroLiquido: number;
}

// ─── Expense row from Supabase (includes new DRE columns) ────────────────────
export type ExpenseRow = {
  month: string;
  ano: number;
  folhaPagamento: number; materiaisInsumos: number; aluguelCondominio: number;
  equipamentos: number;   marketing: number;         impostos: number;
  outros: number;
  receitasFinanceiras: number; despesasFinanceiras: number;
  irCsll: number;              descontosAbatimentos: number;
};

export type ServiceRow = {
  month: string;
  ano: number; consultas: number; exames: number;
  procedimentos: number; retornos: number; outros: number;
};

export type OperationalRow = {
  month: string;
  ano: number; atendimentos: number; inadimplencia: number;
};

// ─── Default / fallback data (zeros) ─────────────────────────────────────────
const ZERO_EXP: Omit<ExpenseRow,"month"> = {
  ano: new Date().getFullYear(),
  folhaPagamento:0, materiaisInsumos:0, aluguelCondominio:0,
  equipamentos:0, marketing:0, impostos:0, outros:0,
  receitasFinanceiras:0, despesasFinanceiras:0, irCsll:0, descontosAbatimentos:0,
};

const ALL_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const CY = new Date().getFullYear();
export const monthlyRevenue: RevenuePoint[] = ALL_MONTHS.map(m=>({month:m,ano:CY,faturamento:0,despesas:0,lucro:0}));
export const monthlyExpenseBreakdown: ExpenseRow[] = ALL_MONTHS.map(m=>({month:m,...ZERO_EXP}));
export const monthlyServiceRevenue: ServiceRow[] = ALL_MONTHS.map(m=>({month:m,ano:CY,consultas:0,exames:0,procedimentos:0,retornos:0,outros:0}));
export const cashFlowData: CashFlowPoint[] = ALL_MONTHS.map(m=>({month:m,entradas:0,saidas:0}));

// ─── Helper functions ─────────────────────────────────────────────────────────
const round1 = (v:number) => Math.round(v*10)/10;
const comparePercent = (cur:number,prev:number) => prev ? round1(((cur-prev)/prev)*100) : 0;

const sumByKeys = <T extends string>(
  rows: Array<Record<T|"month", number|string>>, keys: readonly T[]
) => keys.reduce<Record<T,number>>((acc,key)=>{
  acc[key] = rows.reduce((total,row)=>total+Number(row[key]??0),0);
  return acc;
},{} as Record<T,number>);

const filterByMonths = <T extends {month:string; ano?:number}>(rows:T[], keys:string[]) => {
  if (!keys.length) return [];
  // Detect if keys are year-aware ("2025-Jan") or plain ("Jan")
  const yearAware = keys[0].includes("-");
  return rows.filter(r => {
    if (yearAware) {
      const rowKey = `${r.ano ?? new Date().getFullYear()}-${r.month}`;
      return keys.includes(rowKey);
    }
    return keys.includes(r.month);
  });
};

const getPrevWindow = (keys:string[]) => {
  if (!keys.length) return [];
  const yearAware = keys[0].includes("-");
  if (yearAware) {
    const n = keys.length;
    return keys.map(key => {
      const dash = key.indexOf("-");
      const y = parseInt(key.slice(0, dash));
      const mon = key.slice(dash + 1);
      const mIdx = ALL_MONTHS.indexOf(mon);
      const total = y * 12 + mIdx - n;
      const prevY = Math.floor(total / 12);
      const prevM = ((total % 12) + 12) % 12;
      return `${prevY}-${ALL_MONTHS[prevM]}`;
    });
  }
  const idxs = keys.map(m=>ALL_MONTHS.indexOf(m)).filter(i=>i>=0);
  if (!idxs.length) return [];
  const start=Math.min(...idxs), end=Math.max(...idxs), size=end-start+1;
  const pStart=Math.max(0,start-size), pEnd=start-1;
  if (pEnd<pStart) return [];
  return ALL_MONTHS.slice(pStart,pEnd+1);
};

const expenseKeys = [
  "folhaPagamento","materiaisInsumos","aluguelCondominio","equipamentos",
  "marketing","impostos","outros","receitasFinanceiras","despesasFinanceiras",
  "irCsll","descontosAbatimentos",
] as const;
type ExpKey = typeof expenseKeys[number];

const serviceKeys = ["consultas","exames","procedimentos","retornos","outros"] as const;
const expenseLabels: Record<ExpKey,string> = {
  folhaPagamento:"Pessoal", materiaisInsumos:"Materiais e Insumos",
  aluguelCondominio:"Aluguel", equipamentos:"Equipamentos",
  marketing:"Marketing", impostos:"Impostos", outros:"Outros",
  receitasFinanceiras:"Rec. Financeiras", despesasFinanceiras:"Desp. Financeiras",
  irCsll:"IR e CSLL", descontosAbatimentos:"Descontos",
};
const serviceLabels: Record<typeof serviceKeys[number],string> = {
  consultas:"Consultas", exames:"Exames", procedimentos:"Procedimentos",
  retornos:"Retornos", outros:"Outros",
};

// ─── Dynamic functions (used by Index.tsx) ────────────────────────────────────

export const getExpenseBreakdownFromData = (data:ExpenseRow[], months:string[]): ExpenseBreakdownPoint[] => {
  const filtered = filterByMonths(data,months);
  // Show only actual expense keys (not financial income)
  const displayKeys: ExpKey[] = [
    "folhaPagamento","materiaisInsumos","aluguelCondominio","equipamentos",
    "marketing","impostos","outros","despesasFinanceiras","irCsll","descontosAbatimentos",
  ];
  const totals = sumByKeys(filtered as any, displayKeys);
  const grand = Object.values(totals).reduce((s,v)=>s+v,0);
  return displayKeys
    .filter(k=>totals[k]>0)
    .map(k=>({ name:expenseLabels[k], value:totals[k], percentage:grand>0?Math.round(totals[k]/grand*100):0 }));
};

export const getRevenueByServiceFromData = (data:ServiceRow[], months:string[]): ServiceRevenuePoint[] => {
  const filtered = filterByMonths(data,months);
  const totals = sumByKeys(filtered as any, serviceKeys);
  return [...serviceKeys].map(k=>({servico:serviceLabels[k],valor:totals[k]}));
};

export const getKpisFromData = (
  revenueData:RevenuePoint[], expenseData:ExpenseRow[],
  operationalData:OperationalRow[], months:string[]
): KPIData => {
  const fRev = filterByMonths(revenueData,months);
  const fOps = filterByMonths(operationalData,months);
  const prev = getPrevWindow(months);
  const pRev = filterByMonths(revenueData,prev);
  const pOps = filterByMonths(operationalData,prev);

  const fat   = fRev.reduce((s,i)=>s+i.faturamento,0);
  const desp  = fRev.reduce((s,i)=>s+i.despesas,0);
  // lucro = faturamento - despesas (sem IR estimado — IR só entra se lançado)
  const lucro = fat - desp;
  const margem= fat>0?round1(lucro/fat*100):0;
  const atend = fOps.reduce((s,i)=>s+i.atendimentos,0);
  const ticket= atend>0?Math.round(fat/atend):0;
  const inad  = fOps.length>0?round1(fOps.reduce((s,i)=>s+i.inadimplencia,0)/fOps.length):0;

  const pFat   = pRev.reduce((s,i)=>s+i.faturamento,0);
  const pLucro = pRev.reduce((s,i)=>s+i.lucro,0);
  const pDesp  = pRev.reduce((s,i)=>s+i.despesas,0);
  const pMargem= pFat>0?pLucro/pFat*100:0;
  const pAtend = pOps.reduce((s,i)=>s+i.atendimentos,0);
  const pTicket= pAtend>0?pFat/pAtend:0;
  const pInad  = pOps.length>0?pOps.reduce((s,i)=>s+i.inadimplencia,0)/pOps.length:0;

  return {
    faturamentoMensal:fat, faturamentoVariacao:comparePercent(fat,pFat),
    despesasMensal:desp,   despesasVariacao:comparePercent(desp,pDesp),
    lucroLiquido:lucro,    lucroVariacao:comparePercent(lucro,pLucro),
    margemLucro:margem,    margemVariacao:round1(margem-pMargem),
    ticketMedio:ticket,    ticketVariacao:comparePercent(ticket,pTicket),
    inadimplencia:inad,    inadimplenciaVariacao:round1(inad-pInad),
    inadimplenciaValor: 0,  inadimplenciaPercFat: 0,
    descontoTotal: 0,     descontoPercFat: 0,
  };
};

export const getDreFromData = (
  revenueData:RevenuePoint[], expenseData:ExpenseRow[], months:string[]
): DreData => {
  const fRev = filterByMonths(revenueData,months);
  const fExp = filterByMonths(expenseData,months);

  const receitaBruta = fRev.reduce((s,i)=>s+i.faturamento,0);

  // Deduções — agora vindas de colunas reais
  const impostos   = fExp.reduce((s,e)=>s+e.impostos,0);
  const descontos  = fExp.reduce((s,e)=>s+e.descontosAbatimentos,0);
  const receitaLiquida = receitaBruta - impostos - descontos;

  // Custos diretos
  const materiais          = fExp.reduce((s,e)=>s+e.materiaisInsumos,0);
  const pessoalAssistencial= fExp.reduce((s,e)=>s+Math.round(e.folhaPagamento*0.55),0);
  const custosTotal        = materiais + pessoalAssistencial;
  const lucroBruto         = receitaLiquida - custosTotal;

  // Despesas operacionais
  const pessoalAdmin   = fExp.reduce((s,e)=>s+Math.round(e.folhaPagamento*0.45),0);
  const aluguel        = fExp.reduce((s,e)=>s+e.aluguelCondominio,0);
  const outrosAdmin    = fExp.reduce((s,e)=>s+e.outros,0);
  const administrativas= pessoalAdmin + aluguel + outrosAdmin;
  const comerciais     = fExp.reduce((s,e)=>s+e.marketing,0);
  const depreciacoes   = fExp.reduce((s,e)=>s+e.equipamentos,0);
  const despOp         = administrativas + comerciais + depreciacoes;
  const resOp          = lucroBruto - despOp;

  // Resultado financeiro — agora de colunas reais
  const recFin  = fExp.reduce((s,e)=>s+e.receitasFinanceiras,0);
  const despFin = fExp.reduce((s,e)=>s+e.despesasFinanceiras,0);
  const resFin  = recFin - despFin;

  const resAntesIR = resOp + resFin;
  // IR/CSLL: usa SOMENTE o valor real lançado — sem estimativa automática
  const ir = fExp.reduce((s,e)=>s+e.irCsll,0);

  return {
    receitaBruta,
    deducoes:{ impostos, descontos, total:impostos+descontos },
    receitaLiquida,
    custos:{ materiais, pessoalAssistencial, total:custosTotal },
    lucroBruto,
    despesasOperacionais:{ administrativas, comerciais, depreciacoes, total:despOp },
    resultadoOperacional:resOp,
    resultadoFinanceiro:{ receitas:recFin, despesas:despFin, total:resFin },
    resultadoAntesIR:resAntesIR,
    irCsll:ir,
    lucroLiquido:resAntesIR-ir,
  };
};

// Compat exports (usados por Index.tsx via useFinancialData)
export const expenseBreakdown = getExpenseBreakdownFromData(monthlyExpenseBreakdown, ALL_MONTHS);
export const revenueByService = getRevenueByServiceFromData(monthlyServiceRevenue, ALL_MONTHS);
export const kpis = getKpisFromData(monthlyRevenue, monthlyExpenseBreakdown, [], ALL_MONTHS);
export const dreData = getDreFromData(monthlyRevenue, monthlyExpenseBreakdown, ALL_MONTHS);
