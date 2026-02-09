import React, { useState } from 'react';
import { Wallet, ArrowRight, ShieldCheck, PieChart, Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginView: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Limpa erro ao digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error("Nome é obrigatório.");
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-surface border border-white/10 rounded-2xl shadow-2xl mb-6">
            <Wallet className="text-primary w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">FinAI</h1>
          <p className="text-secondary text-lg">Seu consultor financeiro pessoal.</p>
        </div>

        {/* Card de Login */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          
          {/* Toggle Tabs */}
          <div className="flex p-1 bg-background/50 rounded-xl mb-6">
            <button
              onClick={() => { setIsLoginMode(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLoginMode ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-white'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLoginMode(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLoginMode ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-white'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLoginMode && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-secondary" size={18} />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu Nome"
                  className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-secondary" size={18} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Seu E-mail"
                required
                className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-secondary" size={18} />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Sua Senha"
                required
                className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Processando...</span>
              ) : (
                <>
                  <span>{isLoginMode ? 'Acessar FinAI' : 'Cadastrar Grátis'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features Rápidas */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center opacity-80">
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] text-secondary">Criptografia</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <PieChart size={20} />
                </div>
                <span className="text-[10px] text-secondary">Análise 360º</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Sparkles size={20} />
                </div>
                <span className="text-[10px] text-secondary">IA Advisor</span>
            </div>
        </div>
      </div>
    </div>
  );
};