import { createInterface } from "node:readline";
import { styleText } from "node:util"
import { generateSqlObject, generateTextAnswer } from "./agent.js";
import { createDb } from "./db.js";
import { DB_NAME } from "./constants.js";

const db = createDb(DB_NAME);
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

function prompt(text) {
    return new Promise((resolve) => rl.question(text, resolve));
}

rl.on("close", () => {
    db.close();
    console.log(styleText("green","Encerrando o programa. Até logo!"));
    process.exit(0);
});

console.log(styleText("green", "Bem-vindo ao SQL Terminal Agent! Pressione Ctrl+C para sair."));

while(true) {
    const question = await prompt(styleText("green", "Digite sua pergunta (ou pressione Ctrl+C para sair): "));

    if (!question.trim()) {
        continue;
    }

    try {
        const sqlObject = await generateSqlObject(question);
        const { sql, explanation } = sqlObject;

        console.log(styleText("green",`\nSQL gerado:\n${sql}\n`));
        console.log(styleText("blue",`\nExplicação:\n${explanation}\n`));

        const confirmation = await prompt(styleText("yellow", "Deseja executar este SQL no banco de dados? (s/n): "));

        if (confirmation.toLowerCase() === "s") {
            try {
                const result = await db.prepare(sql).all().map(row =>({ ...row }));
                
                const answer = await generateTextAnswer({question, sql, rows: result});

                console.log(styleText("green",`\nResposta:\n${answer}\n`));
            } catch (executionError) {
                console.error(styleText("red", `Erro ao executar o SQL: ${executionError.message}`));
            }
        } else {
            console.log(styleText("cyan", "Execução do SQL cancelada pelo usuário."));
        }

    } catch (error) {
        console.error(styleText("red", `Erro ao processar a pergunta: ${error.message}`));
    }
}