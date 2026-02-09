import { Transaction, TransactionType, TransactionFilter } from '../types';

/**
 * Gera uma lista de meses (Atual + X meses futuros) para o dropdown
 */
export const getMonthOptions = (count: number = 6) => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const value = d.toISOString().slice(0, 7); // YYYY-MM
    // Formatar label: "Outubro 2023"
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const isFuture = i > 0;
    options.push({ value, label, isFuture });
  }
  return options;
};

/**
 * O Coração da Lógica: Projeta transações recorrentes para um mês específico
 * Se for o mês atual, retorna as transações reais.
 * Se for mês futuro, calcula baseados nas recorrentes.
 */
export const getTransactionsForMonth = (
  allTransactions: Transaction[], 
  targetMonth: string // YYYY-MM
): Transaction[] => {
  const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  
  // Se for o mês atual ou passado, filtramos as reais
  if (targetMonth <= currentMonthStr) {
    return allTransactions.filter(t => t.date.startsWith(targetMonth));
  }

  // Lógica de Projeção Futura
  const projectedTransactions: Transaction[] = [];

  allTransactions.forEach(t => {
    // Apenas transações com recorrência são projetadas
    if (!t.recurrence || t.recurrence.type === 'none') return;

    // Data original da transação
    const tDate = new Date(t.date);
    // Dia do mês que a conta cai
    const day = tDate.getDate(); 
    
    // Constrói a data projetada
    // Cuidado: dia 31 em mês de 30 dias. Javascript ajusta sozinho, mas para financeiro simples serve.
    const projectedDateStr = `${targetMonth}-${day.toString().padStart(2, '0')}`;

    if (t.recurrence.type === 'monthly') {
      projectedTransactions.push({
        ...t,
        id: `proj-${t.id}-${targetMonth}`, // ID Temporário
        date: projectedDateStr,
        isProjected: true
      });
    }

    if (t.recurrence.type === 'installment' && t.recurrence.totalInstallments) {
      // Calcular a diferença de meses para saber qual parcela seria
      const startYear = tDate.getFullYear();
      const startMonth = tDate.getMonth() + 1; // 1-12
      
      const monthDiff = (targetYear - startYear) * 12 + (targetMonthNum - startMonth);
      const futureInstallment = (t.recurrence.currentInstallment || 1) + monthDiff;

      // Se a parcela futura ainda estiver dentro do total
      if (futureInstallment <= t.recurrence.totalInstallments) {
         projectedTransactions.push({
          ...t,
          id: `proj-${t.id}-${targetMonth}`,
          date: projectedDateStr,
          isProjected: true,
          recurrence: {
            ...t.recurrence,
            currentInstallment: futureInstallment
          }
        });
      }
    }
  });

  return projectedTransactions;
};

/**
 * Aplica os filtros avançados (Busca, Categoria, Tipo)
 */
export const filterTransactions = (
  transactions: Transaction[],
  filter: TransactionFilter
): Transaction[] => {
  return transactions.filter(t => {
    // Filtro de Texto (Merchant ou Categoria)
    const matchesSearch = 
      t.merchant.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.search.toLowerCase());

    // Filtro de Categoria
    const matchesCategory = filter.category === 'all' || t.category === filter.category;

    // Filtro de Tipo (Receita/Despesa)
    const matchesType = filter.type === 'all' || t.type === filter.type;

    return matchesSearch && matchesCategory && matchesType;
  });
};