import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar as CalendarIcon, AlertCircle, Download, TrendingUp, TrendingDown, ReceiptText, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Transaction, Category, TransactionType, TransactionFilter } from '../../types';
import { RecurrenceBadge } from '../RecurrenceBadge';
import { getMonthOptions, getTransactionsForMonth, filterTransactions } from '../../utils/financeHelpers';

interface TransactionsViewProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onEdit, onDelete, onToggleStatus }) => {
  // Estado Local dos Filtros
  const [filters, setFilters] = useState<TransactionFilter>({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM atual
    search: '',
    category: 'all',
    type: 'all'
  });

  // 1. Obter opções de meses para o select
  const monthOptions = useMemo(() => getMonthOptions(12), []); // Próximos 12 meses

  // 2. Primeiro, obtemos as transações do mês (Reais OU Projetadas)
  const monthlyData = useMemo(() => {
    return getTransactionsForMonth(transactions, filters.month);
  }, [transactions, filters.month]);

  // 3. Depois, aplicamos os filtros de pesquisa/categoria sobre os dados do mês
  const filteredData = useMemo(() => {
    return filterTransactions(monthlyData, filters);
  }, [monthlyData, filters]);

  // Totais calculados sobre a visualização atual
  const totals = useMemo(() => {
    const income = filteredData.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredData.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    // Calcular pendente apenas para o mês atual
    const pending = filteredData.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
    
    return { income, expense, balance: income - expense, pending };
  }, [filteredData]);

  const handleFilterChange = (key: keyof TransactionFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportCSV = () => {
    // Cabeçalho
    const headers = ["Data", "Estabelecimento", "Categoria", "Tipo", "Valor", "Status"];
    
    // Linhas
    const rows = filteredData.map(t => [
      t.date,
      `"${t.merchant.replace(/"/g, '""')}"`, // Escapar aspas
      t.category,
      t.type === TransactionType.INCOME ? "Receita" : "Despesa",
      t.amount.toFixed(2).replace('.', ','),
      t.status === 'completed' ? "Pago" : "Pendente"
    ]);

    // Montar CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Criar Blob e Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato-finai-${filters.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFutureView = filters.month > new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* --- Barra de Ferramentas Avançada --- */}
      <div className="bg-surface p-4 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4">
        
        {/* Linha 1: Seleção de Mês, Resumo e Exportar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <CalendarIcon size={20} />
             </div>
             <div className="flex flex-col w-full">
               <label className="text-[10px] text-secondary uppercase font-bold tracking-wider">Período de Visualização</label>
               <select 
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                  className="bg-transparent text-white font-semibold text-lg outline-none cursor-pointer hover:text-primary transition-colors"
               >
                 {monthOptions.map(opt => (
                   <option key={opt.value} value={opt.value} className="bg-surface text-base">
                     {opt.label} {opt.isFuture ? '(Projeção)' : ''}
                   </option>
                 ))}
               </select>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
             <div className="flex gap-6 text-sm flex-1 justify-center xl:justify-end w-full">
                <div className="text-center">
                    <p className="text-secondary text-xs">Receitas</p>
                    <p className="text-emerald-400 font-bold">+R$ {totals.income.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="text-center">
                    <p className="text-secondary text-xs">Despesas</p>
                    <p className="text-red-400 font-bold">-R$ {totals.expense.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="text-center border-l border-white/10 pl-6">
                    <p className="text-secondary text-xs">A Pagar/Receber</p>
                    <p className="font-bold text-orange-400">
                    R$ {totals.pending.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                </div>
             </div>

             <button 
               onClick={handleExportCSV}
               className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-colors border border-white/10"
             >
               <Download size={14} />
               Exportar CSV
             </button>
          </div>
        </div>

        {/* Linha 2: Filtros de Pesquisa */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Busca Texto */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-3 text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-secondary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Categoria */}
          <div className="md:col-span-3">
             <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
             >
                <option value="all">Todas Categorias</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>
          </div>

          {/* Tipo */}
          <div className="md:col-span-3">
             <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
             >
                <option value="all">Todos os Tipos</option>
                <option value={TransactionType.INCOME}>Receitas</option>
                <option value={TransactionType.EXPENSE}>Despesas</option>
             </select>
          </div>

        </div>
      </div>

      {/* --- Lista de Resultados --- */}
      <div className="bg-surface rounded-2xl border border-white/5 shadow-xl overflow-hidden min-h-[400px]">
        {isFutureView && (
          <div className="bg-purple-500/10 border-b border-purple-500/20 p-3 flex items-center justify-center gap-2 text-purple-300 text-sm">
             <AlertCircle size={16} />
             <span>Visualizando projeção futura baseada em gastos recorrentes.</span>
          </div>
        )}
        
        {filteredData.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/50">
                  <tr className="text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    <th className="px-4 py-4 w-10">Status</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Estabelecimento</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-4 py-4 w-20">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredData.map((t) => (
                    <tr key={t.id} className={`group hover:bg-white/5 transition-colors ${t.status === 'pending' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                      <td className="px-4 py-4">
                          <button 
                            onClick={() => onToggleStatus(t.id, t.status)}
                            className={`p-1 rounded-full transition-colors ${t.status === 'completed' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-white'}`}
                            title={t.status === 'completed' ? 'Marcar como pendente' : 'Marcar como pago'}
                          >
                             {t.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                          </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {t.isProjected && <span className="mr-2 text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded">Previsto</span>}
                        {t.date.split('-').reverse().slice(0, 2).join('/')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        <div className="flex flex-col">
                          <span className="group-hover:text-primary transition-colors cursor-pointer" onClick={() => onEdit(t)}>{t.merchant}</span>
                          <div className="mt-1">
                              <RecurrenceBadge transaction={t} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-200 text-xs border border-white/5">
                          {t.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}R$ {t.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => onEdit(t)} className="p-1.5 hover:bg-white/10 rounded-lg text-secondary hover:text-primary transition-colors" title="Editar">
                                  <Edit2 size={16} />
                              </button>
                              <button onClick={() => onDelete(t.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-secondary hover:text-red-400 transition-colors" title="Excluir">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (View Adaptada) */}
            <div className="md:hidden divide-y divide-white/5">
               {filteredData.map((t) => (
                 <div key={t.id} className={`p-4 flex flex-col gap-3 ${t.isProjected ? 'bg-purple-500/5' : ''}`}>
                    
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <button 
                                onClick={() => onToggleStatus(t.id, t.status)}
                                className={`shrink-0 ${t.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'}`}
                            >
                                {t.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                           </button>

                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {t.type === TransactionType.INCOME ? <TrendingUp size={18} /> : <ReceiptText size={18} />}
                           </div>
                           
                           <div className="flex flex-col cursor-pointer" onClick={() => onEdit(t)}>
                                <span className={`text-sm font-medium line-clamp-1 ${t.status === 'completed' ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'}`}>
                                    {t.merchant}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-secondary">{t.date.slice(5).split('-').reverse().join('/')}</span>
                                    {t.isProjected && <span className="text-[10px] text-purple-400">Projeção</span>}
                                </div>
                           </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className={`text-sm font-bold whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                                {t.type === TransactionType.INCOME ? '+' : '-'}R$ {t.amount.toFixed(0)}
                                <span className="text-xs">,{t.amount.toFixed(2).split('.')[1]}</span>
                            </span>
                             <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded border border-white/5 mt-1">
                                {t.category}
                             </span>
                        </div>
                    </div>

                    {/* Mobile Actions (Swipe simulation or just a row) */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-white/5 mt-1">
                        <button onClick={() => onEdit(t)} className="text-xs text-secondary flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg">
                            <Edit2 size={12} /> Editar
                        </button>
                         <button onClick={() => onDelete(t.id)} className="text-xs text-red-400 flex items-center gap-1 px-3 py-1.5 bg-red-500/10 rounded-lg">
                            <Trash2 size={12} /> Excluir
                        </button>
                    </div>

                 </div>
               ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-12 text-center text-secondary">
             <div className="flex flex-col items-center gap-2">
               <Filter size={32} className="text-slate-600" />
               <p>Nenhuma transação encontrada para este período/filtro.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};