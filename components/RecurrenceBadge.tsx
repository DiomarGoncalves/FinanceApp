import React from 'react';
import { CalendarClock, CreditCard } from 'lucide-react';
import { Transaction } from '../types';

interface RecurrenceBadgeProps {
  transaction: Transaction;
}

export const RecurrenceBadge: React.FC<RecurrenceBadgeProps> = ({ transaction }) => {
  if (!transaction.recurrence) return null;

  if (transaction.recurrence.type === 'monthly') {
    return (
      <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 w-fit">
        <CalendarClock size={10} /> Mensal
      </span>
    );
  }

  if (transaction.recurrence.type === 'installment') {
    return (
      <span className="flex items-center gap-1 text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30 w-fit">
        <CreditCard size={10} /> {transaction.recurrence.currentInstallment}/{transaction.recurrence.totalInstallments}
      </span>
    );
  }

  return null;
};