import { createTable } from "../src/models/userModel"; // relative path from frontend/initDatabase.ts

(async () => {
  try {
  await createTable();
  console.log("✅ Banco de dados e tabela 'users' criados com sucesso!");
  process.exit(0);
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error("❌ Erro ao criar banco de dados:", err.message);
  } else {
    console.error("❌ Erro ao criar banco de dados:", err);
  }
  process.exit(1);
}
})();
