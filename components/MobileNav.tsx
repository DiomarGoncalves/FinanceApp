import React from 'react';
import { LayoutDashboard, ReceiptText, Sparkles } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'dashboard' | 'transactions' | 'advisor';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'advisor') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-surface border-t border-white/5 pb-safe z-40">
      <div className="flex justify-around items-center h-16">
         <button onClick={() => setActiveTab('dashboard')} className={`p-2 flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-secondary'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[10px]">Painel</span>
         </button>
         <button onClick={() => setActiveTab('transactions')} className={`p-2 flex flex-col items-center gap-1 ${activeTab === 'transactions' ? 'text-primary' : 'text-secondary'}`}>
            <ReceiptText size={20} />
            <span className="text-[10px]">Histórico</span>
         </button>
         <button onClick={() => setActiveTab('advisor')} className={`p-2 flex flex-col items-center gap-1 ${activeTab === 'advisor' ? 'text-primary' : 'text-secondary'}`}>
            <Sparkles size={20} />
            <span className="text-[10px]">IA</span>
         </button>
      </div>
    </div>
  );
};