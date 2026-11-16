# SQL Terminal Agent

Um agente de terminal em Node.js que transforma perguntas em linguagem natural em consultas SQL para um banco SQLite, valida a query antes de executá-la e responde com base nos dados retornados.

## Visão geral

O projeto usa inteligência artificial para:

- receber uma pergunta em linguagem natural;
- gerar uma instrução SQL do tipo `SELECT`;
- validar se a query é segura;
- pedir confirmação antes de executar no banco;
- interpretar os resultados e responder em português.

A aplicação roda no terminal e é ideal para consultas rápidas sobre logs de acesso sem precisar escrever SQL manualmente.

## Funcionalidades

- Geração automática de SQL a partir de perguntas em texto;
- validação de comandos perigosos como `INSERT`, `UPDATE`, `DELETE`, `DROP`, etc.;
- execução opcional da query em banco SQLite;
- resposta natural em linguagem natural com base nos resultados encontrados;
- dados fictícios de logs gerados para testes e demonstração.

## Stack

- Node.js
- SQLite (`node:sqlite`)
- OpenAI via `@ai-sdk/openai`
- `ai` SDK
- `zod` para validação de schemas

## Estrutura do projeto

```text
.
├── src/
│   ├── agent.js          # geração de SQL e resposta em texto
│   ├── agent.spec.js     # teste de integração do agente
│   ├── constants.js      # configuração de caminhos e constantes
│   ├── db.js             # criação e configuração do banco SQLite
│   ├── db.spec.js        # teste de persistência do banco
│   ├── index.js          # loop interativo do terminal
│   ├── ingest.js         # leitura do arquivo de logs e inserção no banco
│   ├── mocks.js          # geração de usuários e registros simulados
│   ├── seed.js           # geração do arquivo de logs em massa
│   └── ...
├── .env                  # configuração local das variáveis de ambiente
├── .gitignore
├── package.json
├── README.md
└── access_logs.db        # banco SQLite gerado em execução
```

## Pré-requisitos

- Node.js 18+
- uma chave da OpenAI em variável de ambiente `OPENAI_API_KEY`
- acesso ao terminal do sistema

## Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd sql-terminal-agent
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente. Crie um arquivo `.env` na raiz com o conteúdo:

```env
OPENAI_API_KEY=sua_chave_aqui
```

Se o projeto tiver um arquivo de exemplo, você também pode usar:

```bash
npm run env:setup
```

## Como usar

### 1) Gerar logs falsos

Cria um arquivo `access.log` com registros simulados:

```bash
npm run seed -- 100
```

O número informado representa a quantidade de registros a serem gerados.

### 2) Importar os logs para o banco SQLite

Carrega os dados do arquivo para a tabela `logs`:

```bash
npm run ingest
```

### 3) Iniciar o agente interativo

```bash
npm run start
```

Ou em modo de desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Exemplo de interação

```text
Bem-vindo ao SQL Terminal Agent! Pressione Ctrl+C para sair.
Digite sua pergunta (ou pressione Ctrl+C para sair): Quantos acessos tivemos por dia?

SQL gerado:
SELECT DATE(timestamp) AS date, COUNT(*) AS access_count FROM logs GROUP BY DATE(timestamp);

Explicação:
Esta query seleciona a data ...

Deseja executar este SQL no banco de dados? (s/n): s
```

A aplicação executa a query, interpreta os resultados e devolve uma resposta em linguagem natural.

## Segurança

A geração de SQL é limitada por validação no código:

- apenas consultas do tipo `SELECT` são permitidas;
- comandos de alteração do banco são bloqueados;
- a query precisa ser validada antes da execução;
- o usuário confirma explicitamente se deseja executar a consulta.

## Testes

Execute os testes do projeto com:

```bash
npm test
```

Os testes cobrem:

- criação e persistência de registros no SQLite;
- geração de SQL válida por parte do agente.

## Observações

O projeto demonstra um fluxo simples de IA aplicada a SQL:

- a IA gera a query com base no schema disponível;
- o código valida a instrução;
- a aplicação executa a consulta com segurança;
- a resposta final é montada a partir dos dados retornados.

Este é um exemplo prático de uso de LLM em ambiente de terminal para consulta de dados sem precisar escrever SQL manualmente.
