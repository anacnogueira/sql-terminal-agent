import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4o-mini",{
  apiKey: process.env.OPENAI_API_KEY,
});

const sqlSuggestionSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
});

const SCHEMA_DESCRIPTION = `
tabelas: logs:
colunas: ip, username, first_name, last_name, email, location, job_area, company, job_title, id, timestamp`;

const BLOCKED_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "COMMENT",
];

export function validateSql(sql) {
  if (typeof sql !== "string" || !sql.trim()) {
    throw new Error("A query SQL deve ser uma string não vazia");
  }

  const safeSql = sql.trim().replace(/;\s*$/, "");

  for (const keyword of BLOCKED_KEYWORDS) {
    if(new RegExp(`\\b${keyword}\\b`, "i").test(safeSql)) {
      throw new Error(`A query SQL não pode conter o comando "${keyword}"`);
    }
  }

  return safeSql;
}

export async function generateSqlObject(question) {
  const { experimental_output } = await generateText({
    model,
    experimental_output: Output.object({ schema: sqlSuggestionSchema }),
    system: `
      Você é um assistente especialista em SQLinte. 
      Sua tarefa é gerar uma única query SQL para responder pergunta do usuário.

      Regras obrigatórias:
      - Gere apenas SELECT
      - Use apenas tabelas e colunas existentes no banco de dados
      - Não use ${BLOCKED_KEYWORDS.join(", ")} ou qualquer outro comando que modifique o banco de dados
      - Não gere múltiplas queries
      - Não use comentário SQL
      - Se a pergunta não puder ser respondida com o schema disponível,
      gere uma query simples de inspeção ou explique a limitação.

      Schema disponível:
      ${SCHEMA_DESCRIPTION}`,
    prompt: `
      Pergunta do usuário:
      ${question}
    `,   
  });

  if (!experimental_output?.sql) {
    throw new Error("O modelo não retornou uma sugestão SQL válida");
  }

  return {
    sql: validateSql(experimental_output.sql),
    explanation: experimental_output.explanation,
  }
}

generateSqlObject("Quais são os 5 usuários mais recentes que acessaram o sistema?")
  .then((result) => {
    console.log("SQL gerado:", result.sql);
    console.log("Explicação:", result.explanation);
  })
  .catch((error) => {
    console.error("Erro ao gerar SQL:", error.message);
  });