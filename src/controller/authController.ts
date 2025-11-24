import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { openDb } from "../models/userModel";

const SECRET = process.env.JWT_SECRET || "chave-secreta-supersegura"; // Use environment variable in production

// Define an interface for the user table
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  try {
    const db = await openDb();
    const hashed = await bcrypt.hash(password, 10);

    await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err: any) {
    console.error("❌ Erro ao cadastrar usuário:", err); // <-- log full error
    res.status(400).json({
    error: "Erro ao cadastrar usuário",
    details: err.message,
  });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const db = await openDb();

    const user: User | undefined = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Senha incorreta" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login bem-sucedido!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Erro no login",
      details: err.message,
    });
  }
}

// Retorna dados do usuário por id (inclui campos aulas/planos/dias parseados)
export async function getUserById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  try {
    const db = await openDb();
    const user: any = await db.get("SELECT id, name, email, aulas, planos, dias FROM users WHERE id = ?", [id]);
    await db.close();
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    // Parse JSON fields (podem ser strings vazias ou JSON)
    const parseJson = (v: any) => {
      try {
        if (typeof v === 'string') return JSON.parse(v || '[]');
        return v || [];
      } catch (e) { return []; }
    };

    const aulas = parseJson(user.aulas);
    const planos = parseJson(user.planos);
    const dias = parseJson(user.dias);

    res.json({ id: user.id, name: user.name, email: user.email, aulas, planos, dias });
  } catch (err: any) {
    console.error('Erro ao buscar usuário', err);
    res.status(500).json({ error: 'Erro ao buscar usuário', details: err.message });
  }
}

// Retorna todos os usuários (SEM senha) com campos parseados
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const db = await openDb();
    const rows: any[] = await db.all("SELECT id, name, email, aulas, planos, dias FROM users");
    await db.close();

    const parseJson = (v: any) => {
      try {
        if (typeof v === 'string') return JSON.parse(v || '[]');
        return v || [];
      } catch (e) { return []; }
    };

    const users = rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      aulas: parseJson(u.aulas),
      planos: parseJson(u.planos),
      dias: parseJson(u.dias)
    }));

    res.json(users);
  } catch (err: any) {
    console.error('Erro ao listar usuários', err);
    res.status(500).json({ error: 'Erro ao listar usuários', details: err.message });
  }
}

// Atualiza nome e email do usuário (não retorna senha)
export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { name, email } = req.body as { name?: string; email?: string };
  if (!id) { res.status(400).json({ error: 'ID inválido' }); return; }

  try {
    const db = await openDb();
    // Apenas atualiza se fornecido
    const updates: any[] = [];
    let sql = 'UPDATE users SET ';
    const parts: string[] = [];
    if (name !== undefined) { parts.push('name = ?'); updates.push(name); }
    if (email !== undefined) { parts.push('email = ?'); updates.push(email); }
    if (parts.length === 0) { await db.close(); res.status(400).json({ error: 'Nenhum campo para atualizar' }); return; }
    sql += parts.join(', ') + ' WHERE id = ?';
    updates.push(id);
    await db.run(sql, updates);

    const user: any = await db.get('SELECT id, name, email, aulas, planos, dias FROM users WHERE id = ?', [id]);
    await db.close();
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const parseJson = (v: any) => {
      try { if (typeof v === 'string') return JSON.parse(v || '[]'); return v || []; } catch(e){ return []; }
    };

    res.json({ id: user.id, name: user.name, email: user.email, aulas: parseJson(user.aulas), planos: parseJson(user.planos), dias: parseJson(user.dias) });
  } catch (err: any) {
    console.error('Erro ao atualizar usuário', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: err.message });
  }
}

// Remove usuário do banco
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: 'ID inválido' }); return; }
  try {
    const db = await openDb();
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    await db.close();
    res.json({ message: 'Usuário removido' });
  } catch (err: any) {
    console.error('Erro ao remover usuário', err);
    res.status(500).json({ error: 'Erro ao remover usuário', details: err.message });
  }
}
