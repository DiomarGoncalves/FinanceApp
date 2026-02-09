import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// Configuração do Pool do Banco de Dados (In-line)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    // --- GET: Listar Transações ---
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      );
      return res.status(200).json(result.rows);
    }

    // --- POST: Criar Transação ---
    if (req.method === 'POST') {
      const t = req.body;
      const query = `
        INSERT INTO transactions (id, user_id, date, amount, merchant, category, type, status, recurrence, is_projected)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        t.id, userId, t.date, t.amount, t.merchant, t.category, 
        t.type, t.status, JSON.stringify(t.recurrence), t.isProjected || false
      ];
      
      const result = await pool.query(query, values);
      return res.status(201).json(result.rows[0]);
    }

    // --- PUT: Atualizar Transação ---
    if (req.method === 'PUT') {
      const t = req.body;
      const query = `
        UPDATE transactions 
        SET date=$1, amount=$2, merchant=$3, category=$4, type=$5, status=$6, recurrence=$7, is_projected=$8
        WHERE id = $9 AND user_id = $10
        RETURNING *;
      `;
      const values = [
        t.date, t.amount, t.merchant, t.category, t.type, t.status, 
        JSON.stringify(t.recurrence), t.isProjected || false, t.id, userId
      ];

      const result = await pool.query(query, values);
      return res.status(200).json(result.rows[0]);
    }

    // --- DELETE: Excluir Transação ---
    if (req.method === 'DELETE') {
        const { id } = req.query;
        await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}