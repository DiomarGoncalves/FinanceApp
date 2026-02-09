# Guia de Configuração: FinAI com Vercel + Neon (PostgreSQL)

Este guia explica como configurar o banco de dados e as variáveis de ambiente.

## 1. Banco de Dados (Neon PostgreSQL)

1. Crie uma conta em [neon.tech](https://neon.tech).
2. Crie um novo projeto.
3. Copie a **Connection String** (ex: `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).
4. Vá para o **SQL Editor** no Neon e rode o script abaixo.

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

Crie um arquivo chamado `.env` na raiz do projeto (para rodar localmente com `vercel dev`) e configure a seguinte variável no painel da Vercel (Settings > Environment Variables).

Conteúdo do arquivo `.env`:

```env
# Conexão do Banco de Dados (Pegue no Neon)
POSTGRES_URL="postgres://usuario:senha@endpoint.neon.tech/neondb?sslmode=require"
```

**Nota:** Não é necessário configurar API_KEY, pois a IA foi desativada.

## 3. Como Rodar Localmente

1. Instale a Vercel CLI: `npm i -g vercel`
2. Rode o projeto:
   ```bash
   vercel dev
   ```

## 4. Deploy

Apenas faça o push para o GitHub e importe o projeto na Vercel.