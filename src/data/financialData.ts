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

export const expenseBreakdown = [
  { name: "Folha de Pagamento", value: 520000, percentage: 38 },
  { name: "Materiais e Insumos", value: 245000, percentage: 18 },
  { name: "Aluguel e Condomínio", value: 180000, percentage: 13 },
  { name: "Equipamentos", value: 150000, percentage: 11 },
  { name: "Marketing", value: 95000, percentage: 7 },
  { name: "Impostos", value: 120000, percentage: 9 },
  { name: "Outros", value: 55000, percentage: 4 },
];

export const revenueByService = [
  { servico: "Consultas", valor: 980000 },
  { servico: "Exames", valor: 620000 },
  { servico: "Procedimentos", valor: 540000 },
  { servico: "Retornos", valor: 280000 },
  { servico: "Outros", valor: 185000 },
];

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
