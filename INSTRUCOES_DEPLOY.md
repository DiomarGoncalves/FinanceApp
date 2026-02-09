# Guia de Configuração: FinAI com Vercel + Neon (PostgreSQL)

Este guia explica como configurar o banco de dados e as variáveis de ambiente para o seu sistema financeiro.

## 1. Banco de Dados (Neon PostgreSQL)

1. Crie uma conta em [neon.tech](https://neon.tech).
2. Crie um novo projeto.
3. Copie a **Connection String** (ex: `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).
4. Vá para o **SQL Editor** no Neon e rode o script abaixo.

**SE VOCÊ JÁ CRIOU AS TABELAS ANTES, RODE ESTE COMANDO PARA ATUALIZAR:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
```

**SE FOR A PRIMEIRA VEZ, RODE O SCRIPT COMPLETO:**
```sql
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    merchant TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
    recurrence JSONB,
    is_projected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

---

## 2. Configurando o .env (Variáveis de Ambiente)

Crie um arquivo chamado `.env` na raiz do projeto (para rodar localmente com `vercel dev`) e configure as mesmas variáveis no painel da Vercel (Settings > Environment Variables).

Conteúdo do arquivo `.env`:

```env
# Conexão do Banco de Dados (Pegue no Neon)
POSTGRES_URL="postgres://usuario:senha@endpoint.neon.tech/neondb?sslmode=require"

# API Key do Google Gemini (Pegue em aistudio.google.com)
# O backend (API Routes) usa process.env.API_KEY
API_KEY="sua_chave_do_google_aqui"

# O Frontend (React/Vite) usa import.meta.env.VITE_API_KEY
# Recomendado manter ambas sincronizadas com o mesmo valor para este projeto híbrido
VITE_API_KEY="sua_chave_do_google_aqui"
```

## 3. Como Rodar Localmente com API

Como agora temos uma API Serverless (`/api`), o `npm run dev` padrão do Vite não processa essas funções. Você deve usar a CLI da Vercel:

1. Instale a Vercel CLI: `npm i -g vercel`
2. Rode o projeto:
   ```bash
   vercel dev
   ```

## 4. Deploy

Apenas faça o push para o GitHub e importe o projeto na Vercel.
