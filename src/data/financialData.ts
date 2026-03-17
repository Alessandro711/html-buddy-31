type ExpenseCategoryKey =
  | "folhaPagamento"
  | "materiaisInsumos"
  | "aluguelCondominio"
  | "equipamentos"
  | "marketing"
  | "impostos"
  | "outros";

type ServiceKey = "consultas" | "exames" | "procedimentos" | "retornos" | "outros";

export interface RevenuePoint {
  month: string;
  faturamento: number;
  despesas: number;
  lucro: number;
}

export interface CashFlowPoint {
  month: string;
  entradas: number;
  saidas: number;
}

export interface ExpenseBreakdownPoint {
  name: string;
  value: number;
  percentage: number;
}

export interface ServiceRevenuePoint {
  servico: string;
  valor: number;
}

export interface KPIData {
  faturamentoMensal: number;
  faturamentoVariacao: number;
  despesasMensal: number;
  despesasVariacao: number;
  lucroLiquido: number;
  lucroVariacao: number;
  margemLucro: number;
  margemVariacao: number;
  ticketMedio: number;
  ticketVariacao: number;
  inadimplencia: number;
  inadimplenciaVariacao: number;
}

export interface DreData {
  receitaBruta: number;
  deducoes: {
    impostos: number;
    descontos: number;
    total: number;
  };
  receitaLiquida: number;
  custos: {
    materiais: number;
    pessoalAssistencial: number;
    total: number;
  };
  lucroBruto: number;
  despesasOperacionais: {
    administrativas: number;
    comerciais: number;
    depreciacoes: number;
    total: number;
  };
  resultadoOperacional: number;
  resultadoFinanceiro: {
    receitas: number;
    despesas: number;
    total: number;
  };
  resultadoAntesIR: number;
  irCsll: number;
  lucroLiquido: number;
}

export const monthlyRevenue: RevenuePoint[] = [
  { month: "Jan", faturamento: 185000, despesas: 112000, lucro: 73000 },
  { month: "Fev", faturamento: 198000, despesas: 118000, lucro: 80000 },
  { month: "Mar", faturamento: 210000, despesas: 125000, lucro: 85000 },
  { month: "Abr", faturamento: 195000, despesas: 115000, lucro: 80000 },
  { month: "Mai", faturamento: 225000, despesas: 130000, lucro: 95000 },
  { month: "Jun", faturamento: 240000, despesas: 135000, lucro: 105000 },
  { month: "Jul", faturamento: 232000, despesas: 128000, lucro: 104000 },
  { month: "Ago", faturamento: 250000, despesas: 140000, lucro: 110000 },
  { month: "Set", faturamento: 245000, despesas: 138000, lucro: 107000 },
  { month: "Out", faturamento: 260000, despesas: 142000, lucro: 118000 },
  { month: "Nov", faturamento: 275000, despesas: 148000, lucro: 127000 },
  { month: "Dez", faturamento: 290000, despesas: 155000, lucro: 135000 },
];

const expenseLabels: Record<ExpenseCategoryKey, string> = {
  folhaPagamento: "Folha de Pagamento",
  materiaisInsumos: "Materiais e Insumos",
  aluguelCondominio: "Aluguel e Condomínio",
  equipamentos: "Equipamentos",
  marketing: "Marketing",
  impostos: "Impostos",
  outros: "Outros",
};

const serviceLabels: Record<ServiceKey, string> = {
  consultas: "Consultas",
  exames: "Exames",
  procedimentos: "Procedimentos",
  retornos: "Retornos",
  outros: "Outros",
};

export const monthlyExpenseBreakdown = [
  { month: "Jan", folhaPagamento: 42000, materiaisInsumos: 21000, aluguelCondominio: 15000, equipamentos: 12000, marketing: 8000, impostos: 10000, outros: 4000 },
  { month: "Fev", folhaPagamento: 44000, materiaisInsumos: 22000, aluguelCondominio: 15000, equipamentos: 12000, marketing: 8500, impostos: 10500, outros: 4000 },
  { month: "Mar", folhaPagamento: 45000, materiaisInsumos: 23000, aluguelCondominio: 15000, equipamentos: 13000, marketing: 8500, impostos: 12000, outros: 4500 },
  { month: "Abr", folhaPagamento: 43000, materiaisInsumos: 21000, aluguelCondominio: 15000, equipamentos: 12000, marketing: 8000, impostos: 12000, outros: 4000 },
  { month: "Mai", folhaPagamento: 45000, materiaisInsumos: 25000, aluguelCondominio: 15000, equipamentos: 14000, marketing: 9000, impostos: 16000, outros: 6000 },
  { month: "Jun", folhaPagamento: 46000, materiaisInsumos: 26000, aluguelCondominio: 15000, equipamentos: 16000, marketing: 9000, impostos: 17000, outros: 6000 },
  { month: "Jul", folhaPagamento: 45000, materiaisInsumos: 24000, aluguelCondominio: 15000, equipamentos: 15000, marketing: 9000, impostos: 15000, outros: 5000 },
  { month: "Ago", folhaPagamento: 47000, materiaisInsumos: 27000, aluguelCondominio: 15000, equipamentos: 16000, marketing: 9000, impostos: 18000, outros: 8000 },
  { month: "Set", folhaPagamento: 46000, materiaisInsumos: 26000, aluguelCondominio: 15000, equipamentos: 16000, marketing: 9000, impostos: 18000, outros: 8000 },
  { month: "Out", folhaPagamento: 47000, materiaisInsumos: 26000, aluguelCondominio: 15000, equipamentos: 15000, marketing: 8500, impostos: 20000, outros: 10500 },
  { month: "Nov", folhaPagamento: 48000, materiaisInsumos: 27000, aluguelCondominio: 15000, equipamentos: 15000, marketing: 8500, impostos: 22000, outros: 12500 },
  { month: "Dez", folhaPagamento: 52000, materiaisInsumos: 29000, aluguelCondominio: 15000, equipamentos: 14000, marketing: 9000, impostos: 19500, outros: 16500 },
];

export const monthlyServiceRevenue = [
  { month: "Jan", consultas: 65000, exames: 43000, procedimentos: 38000, retornos: 24000, outros: 15000 },
  { month: "Fev", consultas: 68000, exames: 45000, procedimentos: 40000, retornos: 25000, outros: 20000 },
  { month: "Mar", consultas: 72000, exames: 47000, procedimentos: 43000, retornos: 27000, outros: 21000 },
  { month: "Abr", consultas: 67000, exames: 44000, procedimentos: 40000, retornos: 25000, outros: 19000 },
  { month: "Mai", consultas: 78000, exames: 50000, procedimentos: 47000, retornos: 28000, outros: 22000 },
  { month: "Jun", consultas: 82000, exames: 53000, procedimentos: 50000, retornos: 30000, outros: 25000 },
  { month: "Jul", consultas: 80000, exames: 51000, procedimentos: 48000, retornos: 29000, outros: 24000 },
  { month: "Ago", consultas: 86000, exames: 55000, procedimentos: 52000, retornos: 31000, outros: 26000 },
  { month: "Set", consultas: 84000, exames: 54000, procedimentos: 51000, retornos: 30000, outros: 26000 },
  { month: "Out", consultas: 90000, exames: 57000, procedimentos: 54000, retornos: 32000, outros: 27000 },
  { month: "Nov", consultas: 95000, exames: 60000, procedimentos: 57000, retornos: 33000, outros: 30000 },
  { month: "Dez", consultas: 101000, exames: 61000, procedimentos: 60000, retornos: 36000, outros: 32000 },
];

const monthlyOperationalMetrics = [
  { month: "Jan", atendimentos: 480, inadimplencia: 4.8 },
  { month: "Fev", atendimentos: 500, inadimplencia: 4.7 },
  { month: "Mar", atendimentos: 520, inadimplencia: 4.5 },
  { month: "Abr", atendimentos: 495, inadimplencia: 4.4 },
  { month: "Mai", atendimentos: 545, inadimplencia: 4.3 },
  { month: "Jun", atendimentos: 575, inadimplencia: 4.2 },
  { month: "Jul", atendimentos: 560, inadimplencia: 4.1 },
  { month: "Ago", atendimentos: 590, inadimplencia: 4.1 },
  { month: "Set", atendimentos: 585, inadimplencia: 4.0 },
  { month: "Out", atendimentos: 610, inadimplencia: 4.0 },
  { month: "Nov", atendimentos: 640, inadimplencia: 3.9 },
  { month: "Dez", atendimentos: 670, inadimplencia: 3.8 },
];

const allMonths = monthlyRevenue.map((item) => item.month);
const expenseKeys = Object.keys(expenseLabels) as ExpenseCategoryKey[];
const serviceKeys = Object.keys(serviceLabels) as ServiceKey[];

const round1 = (value: number) => Math.round(value * 10) / 10;

const comparePercent = (current: number, previous: number) => {
  if (!previous) return 0;
  return round1(((current - previous) / previous) * 100);
};

const getSelectedIndexes = (months: string[]) => {
  const indexes = months.map((month) => allMonths.indexOf(month)).filter((index) => index >= 0);
  const start = indexes.length ? Math.min(...indexes) : 0;
  const end = indexes.length ? Math.max(...indexes) : allMonths.length - 1;
  return { start, end };
};

const getPreviousWindowMonths = (months: string[]) => {
  const { start, end } = getSelectedIndexes(months);
  const windowSize = end - start + 1;
  const previousStart = Math.max(0, start - windowSize);
  const previousEnd = start - 1;

  if (previousEnd < previousStart) return [] as string[];

  return allMonths.slice(previousStart, previousEnd + 1);
};

const sumByKeys = <T extends string>(
  rows: Array<Record<T | "month", number | string>>,
  keys: readonly T[],
) => keys.reduce<Record<T, number>>((acc, key) => {
  acc[key] = rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
  return acc;
}, {} as Record<T, number>);

const filterByMonths = <T extends { month: string }>(rows: T[], months: string[]) => rows.filter((item) => months.includes(item.month));

export const getExpenseBreakdownByMonths = (months: string[]): ExpenseBreakdownPoint[] => {
  const filtered = filterByMonths(monthlyExpenseBreakdown, months);
  const totals = sumByKeys(filtered, expenseKeys);
  const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return expenseKeys.map((key) => ({
    name: expenseLabels[key],
    value: totals[key],
    percentage: grandTotal > 0 ? Math.round((totals[key] / grandTotal) * 100) : 0,
  }));
};

export const getRevenueByServiceByMonths = (months: string[]): ServiceRevenuePoint[] => {
  const filtered = filterByMonths(monthlyServiceRevenue, months);
  const totals = sumByKeys(filtered, serviceKeys);

  return serviceKeys.map((key) => ({
    servico: serviceLabels[key],
    valor: totals[key],
  }));
};

export const getKpisByMonths = (months: string[]): KPIData => {
  const filteredRevenue = filterByMonths(monthlyRevenue, months);
  const filteredOperational = filterByMonths(monthlyOperationalMetrics, months);
  const previousMonths = getPreviousWindowMonths(months);
  const previousRevenue = filterByMonths(monthlyRevenue, previousMonths);
  const previousOperational = filterByMonths(monthlyOperationalMetrics, previousMonths);

  const faturamentoMensal = filteredRevenue.reduce((sum, item) => sum + item.faturamento, 0);
  const despesasMensal = filteredRevenue.reduce((sum, item) => sum + item.despesas, 0);
  const lucroLiquido = filteredRevenue.reduce((sum, item) => sum + item.lucro, 0);
  const margemLucro = faturamentoMensal > 0 ? round1((lucroLiquido / faturamentoMensal) * 100) : 0;

  const atendimentos = filteredOperational.reduce((sum, item) => sum + item.atendimentos, 0);
  const ticketMedio = atendimentos > 0 ? Math.round(faturamentoMensal / atendimentos) : 0;
  const inadimplencia = filteredOperational.length > 0
    ? round1(filteredOperational.reduce((sum, item) => sum + item.inadimplencia, 0) / filteredOperational.length)
    : 0;

  const prevFaturamento = previousRevenue.reduce((sum, item) => sum + item.faturamento, 0);
  const prevDespesas = previousRevenue.reduce((sum, item) => sum + item.despesas, 0);
  const prevLucro = previousRevenue.reduce((sum, item) => sum + item.lucro, 0);
  const prevMargem = prevFaturamento > 0 ? (prevLucro / prevFaturamento) * 100 : 0;
  const prevAtendimentos = previousOperational.reduce((sum, item) => sum + item.atendimentos, 0);
  const prevTicket = prevAtendimentos > 0 ? prevFaturamento / prevAtendimentos : 0;
  const prevInadimplencia = previousOperational.length > 0
    ? previousOperational.reduce((sum, item) => sum + item.inadimplencia, 0) / previousOperational.length
    : 0;

  return {
    faturamentoMensal,
    faturamentoVariacao: comparePercent(faturamentoMensal, prevFaturamento),
    despesasMensal,
    despesasVariacao: comparePercent(despesasMensal, prevDespesas),
    lucroLiquido,
    lucroVariacao: comparePercent(lucroLiquido, prevLucro),
    margemLucro,
    margemVariacao: round1(margemLucro - prevMargem),
    ticketMedio,
    ticketVariacao: comparePercent(ticketMedio, prevTicket),
    inadimplencia,
    inadimplenciaVariacao: round1(inadimplencia - prevInadimplencia),
  };
};

export const getDreByMonths = (months: string[]): DreData => {
  const filteredRevenue = filterByMonths(monthlyRevenue, months);
  const filteredExpenses = filterByMonths(monthlyExpenseBreakdown, months);
  const expenseTotals = sumByKeys(filteredExpenses, expenseKeys);

  const receitaBruta = filteredRevenue.reduce((sum, item) => sum + item.faturamento, 0);
  const impostos = expenseTotals.impostos;
  const descontos = Math.round(receitaBruta * 0.02);
  const receitaLiquida = receitaBruta - impostos - descontos;

  const materiais = expenseTotals.materiaisInsumos;
  const pessoalAssistencial = Math.round(expenseTotals.folhaPagamento * 0.55);
  const custosTotal = materiais + pessoalAssistencial;
  const lucroBruto = receitaLiquida - custosTotal;

  const administrativas = Math.round(expenseTotals.folhaPagamento * 0.45) + expenseTotals.aluguelCondominio + expenseTotals.outros;
  const comerciais = expenseTotals.marketing;
  const depreciacoes = expenseTotals.equipamentos;
  const despesasOperacionaisTotal = administrativas + comerciais + depreciacoes;
  const resultadoOperacional = lucroBruto - despesasOperacionaisTotal;

  const receitasFinanceiras = Math.round(receitaBruta * 0.015);
  const despesasFinanceiras = Math.round(receitaBruta * 0.022);
  const resultadoFinanceiroTotal = receitasFinanceiras - despesasFinanceiras;
  const resultadoAntesIR = resultadoOperacional + resultadoFinanceiroTotal;
  const irCsll = resultadoAntesIR > 0 ? Math.round(resultadoAntesIR * 0.24) : 0;
  const lucroLiquido = resultadoAntesIR - irCsll;

  return {
    receitaBruta,
    deducoes: {
      impostos,
      descontos,
      total: impostos + descontos,
    },
    receitaLiquida,
    custos: {
      materiais,
      pessoalAssistencial,
      total: custosTotal,
    },
    lucroBruto,
    despesasOperacionais: {
      administrativas,
      comerciais,
      depreciacoes,
      total: despesasOperacionaisTotal,
    },
    resultadoOperacional,
    resultadoFinanceiro: {
      receitas: receitasFinanceiras,
      despesas: despesasFinanceiras,
      total: resultadoFinanceiroTotal,
    },
    resultadoAntesIR,
    irCsll,
    lucroLiquido,
  };
};

export const expenseBreakdown = getExpenseBreakdownByMonths(allMonths);
export const revenueByService = getRevenueByServiceByMonths(allMonths);
export const kpis = getKpisByMonths(allMonths);
export const dreData = getDreByMonths(allMonths);

export const cashFlowData: CashFlowPoint[] = [
  { month: "Jan", entradas: 195000, saidas: 145000 },
  { month: "Fev", entradas: 208000, saidas: 152000 },
  { month: "Mar", entradas: 220000, saidas: 160000 },
  { month: "Abr", entradas: 205000, saidas: 148000 },
  { month: "Mai", entradas: 235000, saidas: 165000 },
  { month: "Jun", entradas: 250000, saidas: 170000 },
  { month: "Jul", entradas: 242000, saidas: 162000 },
  { month: "Ago", entradas: 260000, saidas: 175000 },
  { month: "Set", entradas: 255000, saidas: 172000 },
  { month: "Out", entradas: 270000, saidas: 178000 },
  { month: "Nov", entradas: 285000, saidas: 185000 },
  { month: "Dez", entradas: 300000, saidas: 192000 },
];
