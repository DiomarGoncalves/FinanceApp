import { Pool } from 'pg';

// Cria um pool de conexões usando a string do ambiente
// Certifique-se de adicionar POSTGRES_URL no seu .env da Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para conexão com Neon/Vercel em alguns ambientes
  },
});

export default pool;