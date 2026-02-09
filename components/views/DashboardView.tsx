import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ReceiptText } from 'lucide-react';
import { Transaction, TransactionType } from '../../types';
import { StatsCard } from '../StatsCard';
import { Dashboard } from '../Dashboard'; // Renamed import to avoid conflict if necessary, or keep as is
import { RecurrenceBadge } from '../RecurrenceBadge';

interface DashboardViewProps {
  transactions: Transaction[];
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'advisor') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ transactions, setActiveTab }) => {
  // Logic derived within the view to keep App.tsx clean
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Saldo Total" 
          value={`R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="blue"
          trend="+12.5%"
          trendUp={true}
        />
        <StatsCard 
          title="Receita Mensal" 
          value={`R$ ${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard 
          title="Despesas Mensais" 
          value={`R$ ${stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="red"
          trend="+5.2%"
          trendUp={false}
        />
      </div>

      {/* Main Dashboard Visuals */}
      <Dashboard transactions={transactions} />

      {/* Recent Transactions List (Mini) */}
      <div className="bg-surface rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white">Transações Recentes</h3>
          <button onClick={() => setActiveTab('transactions')} className="text-sm text-primary hover:underline">Ver Todas</button>
        </div>
        <div>
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {t.type === TransactionType.INCOME ? <TrendingUp size={18} /> : <ReceiptText size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{t.merchant}</p>
                    <RecurrenceBadge transaction={t} />
                  </div>
                  <p className="text-xs text-secondary">{t.date} • {t.category}</p>
                </div>
              </div>
              <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                {t.type === TransactionType.INCOME ? '+' : '-'}R$ {t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};