import React from 'react';
import { Wallet, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'transactions';
  setActiveTab: (tab: 'dashboard' | 'transactions') => void;
  onOpenModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenModal }) => {
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Wallet className="text-primary" size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FinAI</span>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`text-sm font-medium transition-colors hover:text-white ${activeTab === 'dashboard' ? 'text-white' : 'text-secondary'}`}
            >
              Painel Geral
            </button>
            <button 
              onClick={() => setActiveTab('transactions')} 
              className={`text-sm font-medium transition-colors hover:text-white ${activeTab === 'transactions' ? 'text-white' : 'text-secondary'}`}
            >
              Extrato & Transações
            </button>
          </div>

          <button 
            onClick={onOpenModal}
            className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nova Transação</span>
          </button>
        </div>
      </div>
    </nav>
  );
};