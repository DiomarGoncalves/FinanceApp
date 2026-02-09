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

type Tab = 'dashboard' | 'transactions' | 'advisor';

function App() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Carregar dados da API
  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        setIsDataLoading(true);
        try {
          const res = await fetch(`/api/transactions?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            // Converter string de decimal/json se necessário
            const parsedData = data.map((t: any) => ({
              ...t,
              amount: parseFloat(t.amount), // Postgres retorna numeric como string as vezes
              // O node-postgres com Vercel já deve parsear JSONB para objeto, mas garantimos
              recurrence: typeof t.recurrence === 'string' ? JSON.parse(t.recurrence) : t.recurrence
            }));
            setTransactions(parsedData);
          } else {
            console.error("Falha ao buscar transações");
          }
        } catch (e) {
          console.error("Erro de conexão", e);
        } finally {
          setIsDataLoading(false);
        }
      } else {
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleSaveTransaction = async (transaction: Transaction) => {
    if (!user) return;

    // Otimistic Update (Atualiza UI antes de confirmar)
    const originalTransactions = [...transactions];
    
    // Determinar se é novo ou edição para UI
    const isNew = !transaction.id || transaction.id.startsWith('proj-');
    const tempId = transaction.id || Math.random().toString(36).substr(2, 9);
    
    // Transação formatada para envio
    const payload = {
        ...transaction,
        id: isNew ? tempId : transaction.id, // Se for novo, manda o ID gerado ou deixa o back gerar (aqui mandamos para consistência)
        isProjected: false // Ao salvar, vira real
    };

    // Atualiza Estado Local
    if (!isNew) {
        setTransactions(prev => prev.map(t => t.id === transaction.id ? payload : t));
    } else {
        setTransactions(prev => [payload, ...prev]);
    }

    try {
        const method = isNew ? 'POST' : 'PUT';
        const res = await fetch(`/api/transactions?userId=${user.id}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Erro ao salvar no banco");
        
        // Se for novo, o banco pode ter retornado dados normalizados, ideal seria atualizar
        // const savedTx = await res.json();
    } catch (e) {
        console.error("Erro ao salvar:", e);
        alert("Erro ao salvar alterações no servidor.");
        setTransactions(originalTransactions); // Rollback
    }
  };

  const handleDeleteTransaction = async (id: string) => {
      if (!user) return;
      if (id.startsWith('proj-')) return;

      const originalTransactions = [...transactions];
      setTransactions(prev => prev.filter(t => t.id !== id));

      try {
          const res = await fetch(`/api/transactions?id=${id}&userId=${user.id}`, {
              method: 'DELETE'
          });
          if (!res.ok) throw new Error("Erro ao deletar");
      } catch (e) {
          console.error("Erro ao deletar:", e);
          alert("Erro ao deletar no servidor.");
          setTransactions(originalTransactions);
      }
  };

  const handleEditInit = (t: Transaction) => {
      setEditingTransaction(t);
      setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
      if (id.startsWith('proj-')) {
          alert("Para alterar o status de uma projeção futura, clique em Editar e salve-a como uma transação real.");
          return;
      }

      const txToUpdate = transactions.find(t => t.id === id);
      if (!txToUpdate) return;

      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const updatedTx = { ...txToUpdate, status: newStatus as any };
      
      handleSaveTransaction(updatedTx);
  };

  // Se estiver carregando auth, mostra nada ou loader
  if (isAuthLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Carregando FinAI...</div>;

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
        
        {isDataLoading && transactions.length === 0 ? (
            <div className="flex justify-center p-10"><span className="text-secondary animate-pulse">Sincronizando dados...</span></div>
        ) : (
            <>
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
            </>
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