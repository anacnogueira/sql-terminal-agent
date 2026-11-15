import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { LOG_FILE, LOG_INTERVAL } from "./constants.js";
import { createDb } from "./db.js";

const db = createDb();
const fileStream = createReadStream(LOG_FILE);
const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
});

console.log(`Lendo registros de log de ${LOG_FILE} e inserindo no banco de dados...`);

let count = 0;

for await (const line of rl) {
    if (!line.trim()) continue; // Ignora linhas vazias

    let record;
    try {
        record = JSON.parse(line);
    } catch (_) {
        continue;
    }

   db.prepare(`
        INSERT INTO logs (
            ip, username, first_name, last_name, email, location, job_area, company, job_title, id, timestamp
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );
    `).run(
        record.ip ?? null,
        record.username ?? null,
        record.first_name ?? null,
        record.last_name ?? null,
        record.email ?? null,
        typeof record.location === 'object' ? JSON.stringify(record.location) : (record.location ?? null),
        record.job_area ?? null,
        record.company ?? null,
        record.job_title ?? null,
        record.id ?? null,
        record.timestamp ?? null
    );

    count++;

    if (count % LOG_INTERVAL === 0) {
        console.log(`Inseridos ${count} registros no banco de dados...`);
    }
}


console.log(`Inserção concluída. Total de registros inseridos: ${count}`);
db.close();
