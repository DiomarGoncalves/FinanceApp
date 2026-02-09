import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';
import crypto from 'crypto';

// Função auxiliar simples para hash (Em produção real, use bcrypt ou argon2)
// Usamos crypto nativo para evitar dependências extras neste ambiente
const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password + process.env.API_KEY).digest('hex');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // --- CADASTRO (REGISTER) ---
    if (action === 'register') {
      if (!name) return res.status(400).json({ error: 'Nome é obrigatório para cadastro' });

      // Verificar se email já existe
      const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (checkUser.rows.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
      }

      const userId = crypto.randomUUID();
      const passwordHash = hashPassword(password);
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;

      const query = `
        INSERT INTO users (id, name, email, password, created_at) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING id, name, email, avatar;
      `;
      
      const result = await pool.query(query, [userId, name, email, passwordHash]);
      const user = result.rows[0];
      user.avatar = avatar; // Garante avatar na resposta

      return res.status(201).json(user);
    }

    // --- LOGIN ---
    if (action === 'login') {
      const passwordHash = hashPassword(password);
      
      const query = `SELECT id, name, email FROM users WHERE email = $1 AND password = $2`;
      const result = await pool.query(query, [email, passwordHash]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const user = result.rows[0];
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;

      return res.status(200).json(user);
    }

    return res.status(400).json({ error: 'Ação inválida (use login ou register)' });

  } catch (error: any) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
}