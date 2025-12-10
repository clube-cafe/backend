# ☕ Clube do Café - LSD

O **Clube do Café do Laboratório de Sistemas Distribuídos (LSD)** é um sistema web voltado para a **gestão financeira e administrativa** do clube interno de café.  
Ele permite o **gerenciamento de assinantes**, o **controle de pagamentos**, o **envio de notificações automáticas por e-mail** e o **acompanhamento do caixa do clube**.

---

## Objetivo do Sistema

Facilitar a administração do Clube do Café, automatizando tarefas manuais como o controle de mensalidades e comunicação com os assinantes, garantindo **transparência e organização** nas finanças do grupo.

---

## Como Executar o Projeto

Para iniciar o servidor do Clube do Café, basta garantir que todas as dependências estão instaladas e que o ambiente foi configurado corretamente.

---

## 1. Instalação das Dependências

Na raiz do projeto, execute:

```bash
npm install
```
## 2. Configuração do arquivo .env

Crie um arquivo .env na raiz do projeto contendo:

- DB_DIALECT=
- DB_HOST=
- DB_PORT=
- DB_USER=
- DB_PASS=
- DB_NAME=
- PORT=3000

## 3. Executando o Servidor

O projeto já possui um script configurado no package.json. Para executar o server:

```bash
npm run dev
```

Após iniciar, você deverá ver no terminal:
```bash
Servidor iniciado em http://localhost:3000
Conectado ao banco de dados com sucesso!
```
---

## Funcionalidades Principais

- **Gerenciamento de assinantes**
  - Cadastro, edição e exclusão de contas.
  - Controle de status (ativo/inadimplente).

- **Controle de pagamentos**
  - Registro e histórico de mensalidades.
  - Integração com sistemas de pagamento online.

- **Envio de notificações**
  - E-mails automáticos sobre vencimentos, confirmações e comunicados.

- **Gestão do caixa**
  - Acompanhamento de receitas, despesas e saldo atual.

- **Autenticação e controle de acesso**
  - Login seguro com níveis de permissão (assinante e administrador).

---

## Entidades do Sistema

| Entidade | Atributos Principais | Descrição |
|-----------|----------------------|------------|
| **Usuário** | id, nome, email, senha, tipo (admin ou assinante) | Representa uma pessoa cadastrada no sistema. |
| **Assinante** | id, user_id, status, data_cadastro | Extensão de usuário com informações sobre a assinatura. |
| **Pagamento** | id, assinante_id, valor, data_pagamento, status | Registra cada mensalidade paga ou pendente. |
| **Caixa** | id, saldo_atual, total_receitas, total_despesas | Representa o controle financeiro geral do clube. |
| **Aviso** | id, titulo, mensagem, data_envio | Representa uma notificação enviada aos assinantes. |

---

## Esboço do Diagrama de Classes (UML)

```mermaid
classDiagram
    class Usuario {
        +int id
        +string nome
        +string email
        +string senha
        +string tipo
    }

    class Assinante {
        +int id
        +int user_id
        +string status
        +date data_cadastro
    }

    class Pagamento {
        +int id
        +int assinante_id
        +float valor
        +date data_pagamento
        +string status
    }

    class Caixa {
        +int id
        +float saldo_atual
        +float total_receitas
        +float total_despesas
    }

    class Aviso {
        +int id
        +string titulo
        +string mensagem
        +date data_envio
    }

    Usuario <|-- Assinante
    Assinante "1" --> "N" Pagamento
    Caixa "1" --> "N" Pagamento
    Usuario "1" --> "N" Aviso
