import { Request, Response } from "express";
import { openDb } from "../models/userModel";

// Registra/atualiza campos de aulas, planos e dias para um usuário existente.
// Espera no body: { id: number, aulas?: any[]|any, planos?: any[]|any, dias?: any[]|any }
// Se os campos forem arrays/objetos eles serão mesclados (adicionados) aos existentes.

export async function registerAula(req: Request, res: Response): Promise<void> {
  const { id, aulas, planos, dias } = req.body as {
    id: number;
    aulas?: any;
    planos?: any;
    dias?: any;
  };

  if (!id) {
    res.status(400).json({ error: "Campo 'id' é obrigatório" });
    return;
  }

  try {
    const db = await openDb();
    
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      await db.close();
      return;
    }

    // Quando o frontend envia um campo (aulas/planos/dias), substituímos
    // o valor no banco pelo array enviado, mas:
    // - garantimos que seja um array
    // - removemos duplicatas
    // - se o payload não incluir o campo, mantemos o valor existente
    const toArray = (v: any): any[] => {
      if (v === undefined || v === null) return [];
      return Array.isArray(v) ? v : [v];
    };

    const dedupe = (arr: any[]): any[] => {
      const seen = new Set<string>();
      const out: any[] = [];
      for (const item of arr) {
        // Use JSON.stringify to support objects as well as primitives
        const key = typeof item === 'object' ? JSON.stringify(item) : String(item);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(item);
        }
      }
      return out;
    };

    const newAulas = aulas !== undefined ? JSON.stringify(dedupe(toArray(aulas))) : user.aulas;
    const newPlanos = planos !== undefined ? JSON.stringify(dedupe(toArray(planos))) : user.planos;
    const newDias = dias !== undefined ? JSON.stringify(dedupe(toArray(dias))) : user.dias;

    await db.run(
      "UPDATE users SET aulas = ?, planos = ?, dias = ? WHERE id = ?",
      [newAulas, newPlanos, newDias, id]
    );

    const updated = await db.get("SELECT id, name, email, aulas, planos, dias FROM users WHERE id = ?", [id]);
    await db.close();

    res.status(200).json({ message: "Dados atualizados com sucesso", user: updated });
  } catch (err: any) {
    console.error("❌ Erro ao atualizar aulas/planos/dias:", err);
    res.status(500).json({ error: "Erro ao atualizar dados", details: err.message });
  }
}