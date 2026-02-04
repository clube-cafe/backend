# ☕ Clube do Café - LSD

O **Clube do Café do Laboratório de Sistemas Distribuídos (LSD)** é um sistema web voltado para a **gestão financeira e administrativa** do clube interno de café.  
Ele permite o **gerenciamento de assinantes**, o **controle de pagamentos**, o **envio de notificações automáticas por e-mail** e o **acompanhamento do caixa do clube**.

---

## Objetivo do Sistema

Facilitar a administração do Clube do Café, automatizando tarefas manuais como o controle de mensalidades e comunicação com os assinantes, garantindo **transparência e organização** nas finanças do grupo.

---

## Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **PostgreSQL/MySQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Swagger** - Documentação da API
- **Jest** - Framework de testes
- **Docker** - Containerização
- **Node-cron** - Agendamento de tarefas

---

## Como Executar o Projeto

Para iniciar o servidor do Clube do Café, basta garantir que todas as dependências estão instaladas e que o ambiente foi configurado corretamente.

---

## 1. Instalação das Dependências

Na raiz do projeto, execute:

```bash
npm install
```

---

## 2. Configuração do arquivo .env

Crie um arquivo `.env` na raiz do projeto contendo as seguintes variáveis:

### Variáveis Obrigatórias

```env
# Banco de Dados
DB_DIALECT=postgres          # ou "mysql"
DB_HOST=localhost
DB_PORT=5432                 # 3306 para MySQL
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=nome_do_banco

# Servidor
PORT=3000
NODE_ENV=development         # development, production ou test

# Segurança
JWT_SECRET=sua_chave_secreta_com_pelo_menos_32_caracteres
```

### Variáveis Opcionais

```env
# Frontend
FRONTEND_URL=http://localhost:3001

# Debug
DEBUG=*
```

**⚠️ Importante:**
- Em produção, `JWT_SECRET` deve ter pelo menos 32 caracteres e ser uma string segura
- Não use valores padrão como "your_jwt_secret_key" em produção
- O sistema valida automaticamente essas configurações na inicialização

---

## 3. Executando o Servidor

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado com hot-reload usando `ts-node-dev`.

### Modo Produção

```bash
# Compilar o TypeScript
npm run build

# Iniciar o servidor
npm start
```

### Usando Docker

```bash
# Subir o banco de dados PostgreSQL
npm run docker:up

# Ver logs do banco
npm run docker:logs

# Parar o banco
npm run docker:down

# Limpar volumes (apaga dados)
npm run docker:clean
```

Após iniciar, você deverá ver no terminal:
```bash
Servidor iniciado em http://localhost:3000
Conectado ao banco de dados com sucesso!
```

A documentação da API estará disponível em: `http://localhost:3000/api-docs`

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot-reload |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia o servidor em modo produção |
| `npm test` | Executa todos os testes |
| `npm run test:unit` | Executa apenas os testes unitários |
| `npm run test:integration` | Executa apenas os testes de integração |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:coverage` | Gera relatório de cobertura de testes |
| `npm run lint` | Verifica problemas de lint |
| `npm run lint:fix` | Corrige automaticamente problemas de lint |
| `npm run format` | Formata o código com Prettier |
| `npm run format:check` | Verifica formatação do código |
| `npm run check` | Executa verificação completa (format + lint + build) |
| `npm run check:fix` | Executa correção completa (format + lint:fix + build) |

---

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (banco, rotas, ambiente)
│   ├── controllers/     # Controladores HTTP
│   ├── middlewares/     # Middlewares (auth, roles, etc)
│   ├── models/          # Modelos Sequelize
│   ├── repository/      # Camada de acesso a dados
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── swagger/         # Documentação Swagger
│   ├── utils/           # Utilitários (auth, logger, validators)
│   └── index.ts         # Ponto de entrada da aplicação
├── tests/
│   ├── unit/            # Testes unitários
│   ├── integration/     # Testes de integração
│   └── setup.ts         # Configuração dos testes
├── dist/                # Código compilado (gerado)
└── package.json
```

---

## Funcionalidades Principais

### Gerenciamento de Assinantes
- Cadastro, edição e exclusão de assinaturas
- Controle de status (ativo, cancelado, inadimplente)
- Criação de assinaturas com pagamentos pendentes automáticos
- Validação de duplicatas (um usuário não pode ter múltiplas assinaturas ativas)

### Controle de Pagamentos
- Registro e histórico de mensalidades
- Pagamentos pendentes com controle de vencimento
- Marcação automática de pagamentos atrasados (via cron job)
- Registro completo de pagamento (cria pagamento e atualiza pendente)
- Validação de valores e datas

### Gestão do Caixa
- Acompanhamento de receitas, despesas e saldo atual
- Histórico completo de transações
- Relatórios por período
- Dashboard com métricas consolidadas

### Autenticação e Controle de Acesso
- Login seguro com JWT
- Níveis de permissão (assinante e administrador)
- Token blacklist para logout seguro
- Middleware de autorização por recurso

### Tarefas Agendadas
- Marcação automática de pagamentos vencidos como atrasados
- Execução via cron jobs configuráveis

### Documentação da API
- Swagger UI disponível em `/api-docs`
- Documentação completa de todos os endpoints
- Schemas de validação documentados

---

## Entidades do Sistema

| Entidade | Atributos Principais | Descrição |
|----------|----------------------|-----------|
| **User** | id, username, email, senha, tipo (ADMIN ou ASSINANTE) | Representa uma pessoa cadastrada no sistema |
| **Assinatura** | id, user_id, valor, periodicidade, data_inicio, status | Representa uma assinatura ativa ou cancelada |
| **Pagamento** | id, user_id, valor, data_pagamento, forma_pagamento, status | Registra cada pagamento realizado |
| **PagamentoPendente** | id, user_id, valor, data_vencimento, status, assinatura_id | Representa pagamentos pendentes ou atrasados |
| **Historico** | id, user_id, tipo (ENTRADA/SAIDA), valor, data, descricao | Histórico completo de transações financeiras |
| **TokenBlacklist** | token, expires_at | Lista de tokens invalidados (logout) |

---

## Testes

O projeto possui uma suíte completa de testes:

### Testes Unitários
Testam componentes isolados (services, repositories, utils):
```bash
npm run test:unit
```

### Testes de Integração
Testam fluxos completos através da API:
```bash
npm run test:integration
```

### Cobertura de Testes
```bash
npm run test:coverage
```

**Status atual:** 118 testes passando (unitários e integração)

---

## Segurança

- **Validação de entrada:** Todos os dados são validados antes do processamento
- **Sanitização:** Strings são sanitizadas para prevenir XSS
- **Autenticação JWT:** Tokens seguros com expiração
- **Autorização:** Controle de acesso por recurso e role
- **Validação de UUID:** Todos os IDs são validados como UUIDs
- **Validação de valores:** Valores monetários são validados (positivos, finitos, limites)
- **Validação de datas:** Datas são normalizadas e validadas
- **Transações:** Operações críticas usam transações de banco de dados
- **Locking:** Uso de pessimistic locking para prevenir race conditions

---

## Regras de Negócio Implementadas

- ✅ Um usuário não pode ter múltiplas assinaturas ativas simultaneamente
- ✅ Pagamentos pendentes são criados automaticamente ao criar assinatura
- ✅ Pagamentos vencidos são marcados automaticamente como atrasados (cron job)
- ✅ Validação de transições de status (máquina de estados)
- ✅ Validação de valores monetários (positivos, finitos, com limite máximo)
- ✅ Validação de datas (não podem ser no passado para novos registros)
- ✅ Prevenção de race conditions em operações críticas
- ✅ Validação de existência de usuários antes de criar recursos relacionados

---

## Logging

O sistema utiliza um logger centralizado que registra:
- Erros com stack trace completo
- Informações importantes (criação de recursos, operações críticas)
- Avisos (configurações inseguras, dados inválidos)
- Requisições HTTP (método, path, status, duração)

---

## Tratamento de Erros

O sistema possui tratamento centralizado de erros com classes customizadas:
- `ValidationError` (400) - Dados inválidos
- `NotFoundError` (404) - Recurso não encontrado
- `UnauthorizedError` (401) - Não autenticado
- `ForbiddenError` (403) - Sem permissão
- `ConflictError` (409) - Conflito (ex: duplicata)
- `InternalServerError` (500) - Erro interno

---

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Antes de fazer commit:**
- Execute `npm run check` para garantir que tudo está correto
- Certifique-se de que todos os testes estão passando
- Adicione testes para novas funcionalidades

---

## Licença

Este projeto está sob a licença ISC.

---

## Contato

Para questões ou sugestões, abra uma issue no repositório do projeto.
