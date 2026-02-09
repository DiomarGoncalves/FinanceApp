import React from 'react';
import { Transaction } from '../../types';
import { Advisor } from '../Advisor';

interface AdvisorViewProps {
  transactions: Transaction[];
}

export const AdvisorView: React.FC<AdvisorViewProps> = ({ transactions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-surface p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-white mb-2">Como funciona</h3>
          <p className="text-sm text-secondary leading-relaxed">
            O FinAI analisa seu histórico de transações localmente e envia resumos seguros para o motor de IA Gemini.
            <br/><br/>
            Faça perguntas como:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-primary">
            <li className="flex items-center gap-2 cursor-pointer hover:underline">"Quanto gastei com Uber este mês?"</li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">"Dê-me 3 dicas para economizar."</li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">"Minhas assinaturas estão caras?"</li>
          </ul>
        </div>
      </div>
      <div className="lg:col-span-2">
        <Advisor transactions={transactions} />
      </div>
    </div>
  );
};