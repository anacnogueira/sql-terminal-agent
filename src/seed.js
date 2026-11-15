import { createWriteStream, statSync } from "node:fs"
import { faker } from '@faker-js/faker'
import { LOG_FILE, LOG_INTERVAL } from "./constants.js"

const maxRecords = Number(process.argv[2] || Infinity)

if ((!Number.isInteger(maxRecords) && Number.isFinite(maxRecords))
   || Number.isNaN(maxRecords) 
   || maxRecords <= 0) {
    console.error("Uso: npm run seed -- <quantidade>");
    console.error("A quantidade deve ser um número inteiro maior que zero");
    process.exit(1);   
}

const stream = createWriteStream(LOG_FILE);

function generateUser() {
    return {
        ip: faker.internet.ip(),
        username: faker.internet.userName(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        location: faker.location.city(),
        job_area: faker.person.jobArea(),
        company: faker.company.name(),
        job_title: faker.person.jobTitle(),        
    }
}

function generateLogEntry(user) {    
    return { 
        ...user,
        id: faker.string.uuid(),
        timestamp: faker.date.recent().toISOString(),
    }
}

//Backpressure handling
function writeRecord(line) {
    return new Promise((resolve) => {
        if (!stream.write(line)) {
            stream.once('drain', resolve);
        } else {
            resolve();
        }
    });
}

console.log(`Gerando registros de log em ${LOG_FILE}...(Ctrl+C para parar)`);
console.log(`Máximo de registros: ${maxRecords.toLocaleString()}`);

const users  = Array.from({ length: 5 }, generateUser);

function convertBytesToGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(4);
}

process.on('SIGINT', () => {
    stream.end(() => {
        const { size } = statSync(LOG_FILE);
        console.log(`Geração interrompida pelo usuário.`);
        console.log(`Registros gerados: ${count.toLocaleString()} | Tamanho do arquivo: ${convertBytesToGB(size)} GB`);
    });
});

let count = 0;

while (count < maxRecords) {
    const user = faker.helpers.arrayElement(users);
    const record = generateLogEntry(user);
    const line = JSON.stringify(record) + "\n";
    await writeRecord(line);
    count++;

    if (count % LOG_INTERVAL === 0) {
        const { size } = statSync(LOG_FILE);
        console.log(`Registros gerados: ${count.toLocaleString()} | Tamanho do arquivo: ${convertBytesToGB(size)} GB`);
    }
}

stream.end(() => {
    const { size } = statSync(LOG_FILE);
    console.log(`Registros gerados: ${count.toLocaleString()} | Tamanho do arquivo: ${convertBytesToGB(size)} GB`);
    console.log("Arquivo de log gerado com sucesso!");
});
