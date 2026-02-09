import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const data = useMemo(() => {
    // 1. Pie Chart Data: Expenses by Category
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const byCategory: Record<string, number> = {};
    
    expenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    
    // Sort by value desc to look better
    const pieData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 2. Bar Chart Data: Real Cash Flow (Last 6 Months)
    const today = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      return d;
    });

    const barData = last6Months.map(date => {
      const monthKey = date.toISOString().slice(0, 7); // "2023-10"
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(); // "OUT"
      
      // Filter transactions for this specific month
      const monthlyTx = transactions.filter(t => t.date.startsWith(monthKey));
      
      const income = monthlyTx
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = monthlyTx
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: monthLabel,
        Receita: income,
        Despesa: expense,
      };
    });

    return { pieData, barData };
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Spending Breakdown */}
      <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2">Gastos por Categoria</h3>
        <p className="text-xs text-secondary mb-6">Distribuição das suas despesas totais</p>
        
        {data.pieData.length > 0 ? (
          <>
            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Total Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xs text-secondary">Total</span>
                 <span className="text-xl font-bold text-white">
                   R$ {data.pieData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR', { notation: 'compact' })}
                 </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 max-h-[100px] overflow-y-auto custom-scrollbar">
                {data.pieData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs group">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                           <span className="text-slate-300 truncate max-w-[80px]">{entry.name}</span>
                        </div>
                        <span className="font-mono text-slate-400">R${Math.floor(entry.value)}</span>
                    </div>
                ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-secondary opacity-50 min-h-[200px]">
            <p>Sem dados de despesas</p>
          </div>
        )}
      </div>

      {/* Cash Flow */}
      <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">Fluxo de Caixa</h3>
        <p className="text-xs text-secondary mb-6">Comparativo últimos 6 meses</p>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.barData} barSize={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `K${(val/1000).toFixed(0)}`} 
              />
              <RechartsTooltip
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                cursor={{fill: '#334155', opacity: 0.2}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Bar name="Receita" dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Despesa" dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};