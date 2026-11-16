import { describe, it } from "node:test";
import { equal } from "node:assert";
import { createDb } from "./db.js";
import { generateUser, generateLogEntry } from "./mocks.js";

describe("Testes para a camada de banco de dados", () => {
    const db = createDb();

    it("Deve inserir um registro no banco de dados", async () => {
        const user = generateUser();
        const record = generateLogEntry(user);

        db.prepare(`INSERT INTO logs (
            ip, username, first_name, last_name, email, location, job_area, company, job_title, id, timestamp
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );`).run(
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

        const all = db.prepare("SELECT COUNT(*) FROM logs;").all();
        equal(all[0]["COUNT(*)"], 1);
    });   
});