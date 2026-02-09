export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum Category {
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HOUSING = 'Moradia',
  ENTERTAINMENT = 'Lazer & Streaming',
  SHOPPING = 'Compras',
  SALARY = 'Salário',
  INVESTMENT = 'Investimentos',
  UTILITIES = 'Contas (Luz/Água)',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  OTHER = 'Outros',
}

export type TransactionStatus = 'pending' | 'completed';

export type RecurrenceType = 'none' | 'monthly' | 'yearly' | 'installment';

export interface Recurrence {
  type: RecurrenceType;
  currentInstallment?: number; // Para parcelados (ex: 1)
  totalInstallments?: number; // Para parcelados (ex: 10)
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  status: TransactionStatus; // Novo campo
  notes?: string;
  recurrence?: Recurrence;
  isProjected?: boolean; // Flag para saber se é uma previsão futura
}

export interface ReceiptData {
  merchant: string;
  date: string;
  amount: number;
  category: string;
}

export interface AdvisorMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TransactionFilter {
  month: string; // YYYY-MM
  search: string;
  category: string;
  type: 'all' | TransactionType;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}