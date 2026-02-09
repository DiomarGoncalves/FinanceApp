import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, ReceiptData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to encode file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url part
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const scanReceipt = async (base64Data: string): Promise<ReceiptData> => {
  try {
    // Usando gemini-3-flash-preview pois suporta multimodal (imagem+texto) e JSON Schema
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: "Analise esta imagem de recibo. Extraia o nome do estabelecimento (merchant), a data (formato YYYY-MM-DD), o valor total e sugira uma categoria em Português (ex: Alimentação, Transporte, Compras). Se a data não estiver clara, use a data de hoje."
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
          },
          required: ["merchant", "amount", "category"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");
    
    return JSON.parse(text) as ReceiptData;
  } catch (error) {
    console.error("Erro ao escanear recibo:", error);
    throw error;
  }
};

export const getFinancialAdvice = async (transactions: Transaction[], userQuery: string): Promise<string> => {
  try {
    // Simplify transaction data to save tokens
    const dataSummary = transactions.map(t => {
        let details = `${t.date}: ${t.merchant} (${t.category}) - R$${t.amount} [${t.type === 'income' ? 'Receita' : 'Despesa'}]`;
        if (t.recurrence?.type === 'installment') {
            details += ` (Parcela ${t.recurrence.currentInstallment}/${t.recurrence.totalInstallments})`;
        } else if (t.recurrence?.type === 'monthly') {
            details += ` (Assinatura Mensal)`;
        }
        return details;
    }).join('\n');

    const prompt = `
      Você é um consultor financeiro especialista pessoal (FinAI). Aqui está o histórico recente do usuário:
      ${dataSummary}
      
      Pergunta do Usuário: ${userQuery}
      
      Forneça uma resposta concisa, útil e amigável em PORTUGUÊS (Brasil).
      Use formatação markdown (negrito, listas).
      Se o usuário perguntar sobre assinaturas ou parcelamentos, analise os dados fornecidos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o FinAI, um assistente financeiro inteligente e prestativo que fala Português.",
      }
    });

    return response.text || "Não consegui gerar um conselho neste momento.";
  } catch (error) {
    console.error("Erro ao obter conselho:", error);
    return "Desculpe, estou com problemas para analisar suas finanças agora.";
  }
};