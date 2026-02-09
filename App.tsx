import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from './types';
import { useAuth } from './contexts/AuthContext';

// Components
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { TransactionModal } from './components/TransactionModal';
import { LoginView } from './components/views/LoginView';

// Views
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { AdvisorView } from './components/views/AdvisorView';

// Helper para gerar datas dinâmicas (para o exemplo não ficar velho)
const getDynamicDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Dados Iniciais Dinâmicos (Default)
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: getDynamicDate(2), merchant: 'Supermercado Extra', amount: 345.20, category: Category.FOOD, type: TransactionType.EXPENSE, status: 'completed' },
  { id: '2', date: getDynamicDate(1), merchant: 'Uber', amount: 24.50, category: Category.TRANSPORT, type: TransactionType.EXPENSE, status: 'completed' },
  { id: '3', date: getDynamicDate(5), merchant: 'Salário Mensal', amount: 4200.00, category: Category.SALARY, type: TransactionType.INCOME, status: 'completed' },
  { id: '4', date: getDynamicDate(3), merchant: 'Netflix', amount: 55.90, category: Category.ENTERTAINMENT, type: TransactionType.EXPENSE, status: 'completed', recurrence: { type: 'monthly' } },
  { id: '5', date: getDynamicDate(0), merchant: 'Posto Ipiranga', amount: 150.00, category: Category.TRANSPORT, type: TransactionType.EXPENSE, status: 'pending' },
  { id: '6', date: getDynamicDate(4), merchant: 'TV Samsung 50"', amount: 250.00, category: Category.SHOPPING, type: TransactionType.EXPENSE, status: 'completed', recurrence: { type: 'installment', currentInstallment: 1, totalInstallments: 10 } },
];

type Tab = 'dashboard' | 'transactions' | 'advisor';

function App() {
  const { user, isLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Carregar dados específicos do usuário quando ele loga
  useEffect(() => {
    if (user) {
      const userKey = `finai_data_${user.id}`;
      try {
        const saved = localStorage.getItem(userKey);
        if (saved) {
          setTransactions(JSON.parse(saved));
        } else {
          // Se for usuário novo, começa com dados de exemplo
          setTransactions(INITIAL_TRANSACTIONS);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário", e);
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } else {
        setTransactions([]);
    }
  }, [user]);

  // Salvar dados específicos do usuário quando mudam
  useEffect(() => {
    if (user && transactions.length > 0) {
       const userKey = `finai_data_${user.id}`;
       localStorage.setItem(userKey, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const handleSaveTransaction = (transaction: Transaction) => {
    if (transaction.id && !transaction.id.startsWith('proj-')) {
        // UPDATE existing
        setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
        // CREATE new (or convert projected to real)
        const newTx = { ...transaction, id: Math.random().toString(36).substr(2, 9), isProjected: false };
        setTransactions(prev => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
      // Se for projetada, não deleta do banco, só ignora na view (mas aqui estamos apenas deletando reais)
      if (id.startsWith('proj-')) return;
      setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleEditInit = (t: Transaction) => {
      setEditingTransaction(t);
      setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
      if (id.startsWith('proj-')) {
          // Se o usuário marcar uma projeção como "paga" ou "pendente", precisamos materializá-la
          // Encontrar a transação original na lista de projeções (complexo sem o objeto completo)
          // Simplificação: vamos obrigar o usuário a clicar em Editar para materializar projeções complexas
          alert("Para alterar o status de uma projeção futura, clique em Editar e salve-a como uma transação real.");
          return;
      }

      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
  };

  // Se estiver carregando auth, mostra nada ou loader
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Carregando...</div>;

  // Se não tiver usuário, mostra Login
  if (!user) {
    return <LoginView />;
  }

  // App Principal
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenModal={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
        }} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView 
            transactions={transactions} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'transactions' && (
           <TransactionsView 
                transactions={transactions} 
                onEdit={handleEditInit}
                onDelete={(id) => {
                    if(confirm("Deseja realmente excluir?")) handleDeleteTransaction(id)
                }}
                onToggleStatus={handleToggleStatus}
           />
        )}

        {activeTab === 'advisor' && (
            <AdvisorView transactions={transactions} />
        )}

      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}

export default App;