import { Transaction, ReceiptData } from "../types";

// Serviço desativado conforme solicitação.
// Mantemos as funções vazias para não quebrar importações antigas caso existam,
// mas elas não fazem nada e não requerem API Key.

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return "";
};

export const scanReceipt = async (base64Data: string): Promise<ReceiptData> => {
  throw new Error("Funcionalidade de IA desativada.");
};

export const getFinancialAdvice = async (transactions: Transaction[], userQuery: string): Promise<string> => {
  return "O consultor de IA está desativado nesta versão.";
};