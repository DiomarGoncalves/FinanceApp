import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe sessão salva ao carregar
    const savedUser = localStorage.getItem('finai_user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao restaurar sessão", e);
        localStorage.removeItem('finai_user_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (name: string) => {
    // SIMULAÇÃO: Cria um ID baseado no nome para separar os dados no localStorage
    // No futuro, isso será substituído por Google Auth
    const userId = `user_${name.toLowerCase().replace(/\s/g, '_')}_${Math.floor(Math.random() * 1000)}`;
    
    // Verificar se já existe um ID persistente para esse nome (simulação simples)
    // Para manter simples agora, criamos um user novo ou usamos o mock
    
    const newUser: User = {
      id: userId,
      name: name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`
    };

    setUser(newUser);
    localStorage.setItem('finai_user_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finai_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};