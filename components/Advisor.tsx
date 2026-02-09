import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { AdvisorMessage, Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface AdvisorProps {
  transactions: Transaction[];
}

export const Advisor: React.FC<AdvisorProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    { role: 'model', text: "Olá! Sou o FinAI, seu assistente financeiro pessoal. Analisei suas transações recentes. Pergunte-me qualquer coisa sobre seus hábitos de consumo, dicas de economia ou despesas específicas!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const advice = await getFinancialAdvice(transactions, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: advice }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Peço desculpas, mas estou com dificuldade de conexão com meu cérebro agora." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-white/5 shadow-xl h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-background/50 flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="text-purple-500" size={20} />
        </div>
        <div>
            <h3 className="text-white font-bold">Consultor FinAI</h3>
            <p className="text-xs text-emerald-400">Online & Analisando</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-background border border-white/5 text-slate-200 rounded-tl-none'
            }`}>
              {msg.role === 'model' ? (
                 <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                     // Simple markdown parsing for bold/lists
                     __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>') 
                 }} />
              ) : (
                  msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
            </div>
            <div className="bg-background border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-background/50">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre seus gastos..."
            className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-secondary focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};