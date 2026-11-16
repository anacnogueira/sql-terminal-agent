import { describe, it } from "node:test";
import { equal } from "node:assert";
import { generateText, Output } from "ai";

describe("Testes oara a integração com modelo de linguagem", () => {
    it("Deve gerar uma query SQL válida para uma pergunta simples", async (ctx) => {
        ctx.mock.module("ai", {
            expots: {
                generateText: async ({ system, prompt }) => {
                    return {
                        experimental_output: {
                            sql: "SELECT DATE(timestamp) AS date, COUNT(*) AS access_count FROM logs GROUP BY DATE(timestamp);",
                            explanation: "Esta query seleciona a data (extraída do timestamp) e conta o número de acessos por dia, agrupando os resultados pela data."
                        }
                    }
                },
                Output: {
                    object: ({ schema }) => {
                        return { schema }
                    }
                }
            }
        });

            
        const { generateSqlObject } = await import("./agent.js");
        const question = "Quantos acessos tivemos por dia";
        const { sql, explanation } = await generateSqlObject(question);

        equal(typeof sql, "string");
        equal(sql.trim().length > 0, true);

        equal(sql.trim().toUpperCase().startsWith("SELECT"), true);

    });
});