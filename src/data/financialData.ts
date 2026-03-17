type ExpenseCategoryKey =
  | "folhaPagamento"
  | "materiaisInsumos"
  | "aluguelCondominio"
  | "equipamentos"
  | "marketing"
  | "impostos"
  | "outros";

type ServiceKey = "consultas" | "exames" | "procedimentos" | "retornos" | "outros";

export const monthlyRevenue = [
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

const sumByKeys = <T extends string>(
  rows: Array<Record<T | "month", number | string>>,
  keys: T[],
) => keys.reduce<Record<T, number>>((acc, key) => {
  acc[key] = rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
  return acc;
}, {} as Record<T, number>);

export const getExpenseBreakdownByMonths = (months: string[]) => {
  const filtered = monthlyExpenseBreakdown.filter((item) => months.includes(item.month));
  const keys = Object.keys(expenseLabels) as ExpenseCategoryKey[];
  const totals = sumByKeys(filtered, keys);
  const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return keys.map((key) => ({
    name: expenseLabels[key],
    value: totals[key],
    percentage: grandTotal > 0 ? Math.round((totals[key] / grandTotal) * 100) : 0,
  }));
};

export const getRevenueByServiceByMonths = (months: string[]) => {
  const filtered = monthlyServiceRevenue.filter((item) => months.includes(item.month));
  const keys = Object.keys(serviceLabels) as ServiceKey[];
  const totals = sumByKeys(filtered, keys);

  return keys.map((key) => ({
    servico: serviceLabels[key],
    valor: totals[key],
  }));
};

export const expenseBreakdown = getExpenseBreakdownByMonths(monthlyRevenue.map((item) => item.month));

export const revenueByService = getRevenueByServiceByMonths(monthlyRevenue.map((item) => item.month));

export const dreData = {
  receitaBruta: 2805000,
  deducoes: {
    impostos: 280500,
    descontos: 56100,
    total: 336600,
  },
  receitaLiquida: 2468400,
  custos: {
    materiais: 245000,
    pessoalAssistencial: 420000,
    total: 665000,
  },
  lucroBruto: 1803400,
  despesasOperacionais: {
    administrativas: 380000,
    comerciais: 95000,
    depreciacoes: 72000,
    total: 547000,
  },
  resultadoOperacional: 1256400,
  resultadoFinanceiro: {
    receitas: 45000,
    despesas: 68000,
    total: -23000,
  },
  resultadoAntesIR: 1233400,
  irCsll: 296016,
  lucroLiquido: 937384,
};

export const cashFlowData = [
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

export const kpis = {
  faturamentoMensal: 290000,
  faturamentoVariacao: 5.5,
  despesasMensal: 155000,
  despesasVariacao: 4.7,
  lucroLiquido: 135000,
  lucroVariacao: 6.3,
  margemLucro: 46.6,
  margemVariacao: 0.8,
  ticketMedio: 385,
  ticketVariacao: 3.2,
  inadimplencia: 4.2,
  inadimplenciaVariacao: -0.5,
};
