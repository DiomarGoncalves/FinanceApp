import React, { useState, useEffect } from 'react';
import { X, Check, CalendarClock, Trash2 } from 'lucide-react';
import { Transaction, TransactionType, Category, RecurrenceType, TransactionStatus } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Transaction) => void;
  initialData?: Transaction | null;
  onDelete?: (id: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, initialData, onDelete }) => {
  const [formData, setFormData] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    merchant: '',
    category: '',
    type: TransactionType.EXPENSE,
    status: 'completed' as TransactionStatus,
    recurrenceType: 'none' as RecurrenceType,
    totalInstallments: '2',
  });

  // Carregar dados quando entrar em modo de edição
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          date: initialData.date,
          amount: initialData.amount.toString(),
          merchant: initialData.merchant,
          category: initialData.category,
          type: initialData.type,
          status: initialData.status,
          recurrenceType: initialData.recurrence?.type || 'none',
          totalInstallments: initialData.recurrence?.totalInstallments?.toString() || '2',
        });
      } else {
        // Reset para nova transação
        setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            merchant: '',
            category: '',
            type: TransactionType.EXPENSE,
            status: 'completed',
            recurrenceType: 'none',
            totalInstallments: '2'
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let recurrence = undefined;
    if (formData.recurrenceType === 'installment') {
        recurrence = {
            type: 'installment' as RecurrenceType,
            currentInstallment: initialData?.recurrence?.currentInstallment || 1, // Mantém a parcela atual se editando
            totalInstallments: parseInt(formData.totalInstallments) || 2
        };
    } else if (formData.recurrenceType !== 'none') {
        recurrence = { type: formData.recurrenceType };
    }

    const transaction: Transaction = {
      id: formData.id, // Se vazio, o App irá gerar
      date: formData.date,
      amount: parseFloat(formData.amount),
      merchant: formData.merchant,
      category: formData.category || 'Outros',
      type: formData.type,
      status: formData.status,
      recurrence: recurrence,
    };

    onSave(transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Tipo</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleInputChange}
                className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none"
              >
                <option value={TransactionType.EXPENSE}>Despesa</option>
                <option value={TransactionType.INCOME}>Receita</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-secondary">R$</span>
                <input 
                  type="number" 
                  name="amount"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-white/10 rounded-lg p-2.5 pl-9 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Nome / Estabelecimento</label>
            <input 
              type="text" 
              name="merchant"
              required
              value={formData.merchant}
              onChange={handleInputChange}
              className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Ex: Netflix, Supermercado, Salário"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Data</label>
              <input 
                type="date" 
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Categoria</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none"
              >
                 <option value="" disabled>Selecione</option>
                 {Object.values(Category).map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                 ))}
              </select>
            </div>
          </div>

          {/* Status Field */}
          <div>
              <label className="block text-xs font-medium text-secondary mb-1">Status</label>
              <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, status: 'completed'}))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${formData.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-transparent border-white/10 text-secondary'}`}
                  >
                      {formData.type === TransactionType.INCOME ? 'Recebido' : 'Pago'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, status: 'pending'}))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${formData.status === 'pending' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-transparent border-white/10 text-secondary'}`}
                  >
                      Pendente
                  </button>
              </div>
          </div>

          {/* Área de Recorrência / Parcelamento */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
             <label className="block text-xs font-medium text-secondary mb-2 flex items-center gap-2">
                 <CalendarClock size={14} />
                 Recorrência / Parcelas
             </label>
             <select 
                name="recurrenceType" 
                value={formData.recurrenceType} 
                onChange={handleInputChange}
                disabled={!!initialData && initialData.recurrence?.type === 'installment'} // Não mudar tipo se já for parcela
                className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-3 disabled:opacity-50"
             >
                <option value="none">Transação Única</option>
                <option value="monthly">Assinatura Mensal (SaaS, Contas)</option>
                <option value="yearly">Assinatura Anual</option>
                <option value="installment">Compra Parcelada</option>
             </select>

             {formData.recurrenceType === 'installment' && (
                 <div className="animate-fade-in">
                     <label className="block text-xs font-medium text-secondary mb-1">Total de Parcelas</label>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-white">
                            {initialData?.recurrence?.currentInstallment || 1} de
                        </span>
                        <input 
                            type="number" 
                            name="totalInstallments"
                            min="2"
                            max="60"
                            value={formData.totalInstallments}
                            onChange={handleInputChange}
                            className="w-full bg-background border border-white/10 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                     </div>
                 </div>
             )}
          </div>

          <div className="flex gap-3 pt-2">
            {initialData && onDelete && (
                <button
                    type="button"
                    onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta transação?")) {
                            onDelete(initialData.id);
                            onClose();
                        }
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-xl transition-colors"
                >
                    <Trash2 size={20} />
                </button>
            )}
            <button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <Check size={20} />
                {initialData ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};