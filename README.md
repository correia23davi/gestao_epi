# Gestão de EPI

Sistema de controle de EPI (equipamentos de proteção individual): estoque,
retiradas com assinatura digital, e cadastro de colaboradores — com um
back-end próprio (funções serverless) e um banco de dados em JavaScript
pronto para hospedar na Vercel.

Convertido a partir de um export do Figma Make para **React + JavaScript
puro** (sem TypeScript e sem nenhuma dependência do Figma no front-end ou
no back-end).

## Stack

- **Front-end:** React 19 + Vite + Tailwind CSS v4
- **Back-end:** funções serverless da Vercel (Node.js, `/api`)
- **Banco de dados:** Redis (via integração Upstash na Vercel), acessado
  com o cliente JS `@upstash/redis` — sem servidor para gerenciar
- **Segurança:**
  - Senhas: hash com `bcryptjs` (nunca reversível)
  - Dados pessoais dos colaboradores (nome, idade, área, cargo) e os
    registros de retirada (nome de quem retirou + assinatura): cifrados
    com **AES-256-GCM** antes de irem para o banco
  - Sessão: token JWT assinado, enviado no cabeçalho `Authorization`

## Como os dados pessoais são protegidos

- Cada colaborador é salvo no banco como um blob cifrado (`AES-256-GCM`,
  IV aleatório por registro). Quem tiver acesso direto ao banco não
  consegue ler nome, login, idade, área ou cargo sem a chave `DATA_ENCRYPTION_KEY`.
- O **login** (usado só para entrar no sistema) é separado do **nome**
  (usado para exibição — painéis, retiradas, comprovantes). Duas pessoas
  podem ter o mesmo nome, mas o login precisa ser único.
- Para localizar um colaborador pelo login sem guardar esse valor em
  texto puro como chave, usamos um **índice cego**: um HMAC determinístico
  do login (`blindIndex`), que aponta para o registro cifrado.
- Retiradas de equipamento (que ligam um nome + assinatura a um item)
  também são cifradas por completo.
- Senhas nunca são cifradas de forma reversível — usam hash `bcrypt`,
  que é o padrão para credenciais.

Isso é uma proteção contra acesso direto ao banco de dados (ex.: um
vazamento do banco). Ainda assim, quem tiver acesso às variáveis de
ambiente do projeto (`DATA_ENCRYPTION_KEY`, `JWT_SECRET`) consegue decifrar
os dados — proteja essas variáveis como qualquer outro segredo de produção.

## Estrutura do projeto

```
gestao-epi/
├─ src/                    # front-end (React)
│  ├─ components/          # telas e componentes de UI
│  ├─ lib/api.js           # cliente HTTP que fala com /api/*
│  ├─ App.jsx
│  └─ main.jsx
├─ api/                    # back-end (funções serverless da Vercel)
│  ├─ _lib/
│  │  ├─ db.js             # abstração de banco (Redis / arquivo local)
│  │  ├─ crypto.js         # criptografia AES-256-GCM + índice cego
│  │  ├─ passwords.js      # hash de senha (bcrypt)
│  │  ├─ jwt.js            # sessão (JWT)
│  │  ├─ models.js         # regras de usuários/equipamentos/retiradas
│  │  ├─ authGuard.js      # middlewares de autenticação
│  │  └─ seed.js           # cria o admin (e dados de exemplo) no 1º uso
│  ├─ auth/login.js
│  ├─ auth/me.js
│  ├─ users/index.js       # GET/POST — admin cadastra colaboradores
│  ├─ equipment/index.js   # GET/POST — estoque
│  └─ withdrawals/index.js # GET/POST — retiradas
├─ .env.example
├─ vercel.json
└─ package.json
```

## Rodando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie o arquivo de exemplo e gere os segredos:
   ```bash
   cp .env.example .env
   npm run gen-secrets
   ```
   Cole os valores gerados (`JWT_SECRET` e `DATA_ENCRYPTION_KEY`) no `.env`.

3. Rode o projeto completo (front-end + API) com a CLI da Vercel:
   ```bash
   npx vercel dev
   ```
   Sem configurar `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`, os
   dados são salvos num arquivo local em `.data/db.local.json` — ótimo
   para testar, mas **não use isso em produção** (não é o comportamento
   real do Redis e não deve ir para o Git).

   Alternativa mais rápida para mexer só na interface (sem back-end real):
   ```bash
   npm run dev
   ```

4. Acesse a URL exibida no terminal e entre com o usuário administrador
   padrão (`SEED_ADMIN_LOGIN` / `SEED_ADMIN_PASSWORD` do seu `.env`, por
   padrão `admin` / `admin123`). **Troque essa senha assim que possível.**

## Publicando na Vercel

1. Suba este projeto para um repositório Git (GitHub, GitLab ou
   Bitbucket) e importe-o em [vercel.com/new](https://vercel.com/new).

2. Na aba **Storage** do projeto na Vercel, adicione a integração
   **Upstash for Redis** (Marketplace) — ela cria as variáveis
   `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` automaticamente.
   Sem isso, o app funciona, mas os dados não são persistidos entre
   requisições em produção.

3. Em **Settings → Environment Variables**, adicione:
   - `JWT_SECRET`
   - `DATA_ENCRYPTION_KEY`
   - `SEED_ADMIN_NAME`, `SEED_ADMIN_LOGIN` e `SEED_ADMIN_PASSWORD` (defina
     um login e uma senha fortes antes do primeiro deploy — evite deixar o
     valor padrão do exemplo)
   - `SEED_DEMO_DATA` (`true` só se quiser dados de exemplo)

4. Faça o deploy. Na primeira requisição à API, o sistema cria
   automaticamente o usuário administrador.

## Endpoints da API

| Método | Rota                 | Acesso        | Descrição                              |
|--------|-----------------------|---------------|-----------------------------------------|
| POST   | `/api/auth/login`     | público       | Login (login + senha) → token           |
| GET    | `/api/auth/me`        | autenticado   | Dados do usuário logado                 |
| GET    | `/api/users`          | admin         | Lista colaboradores                     |
| POST   | `/api/users`          | admin         | Cadastra um colaborador (único jeito de criar conta) |
| PATCH  | `/api/users/:id`      | admin         | Altera a senha de um colaborador        |
| DELETE | `/api/users/:id`      | admin         | Apaga um colaborador (mantém o histórico de retiradas já feitas) |
| GET    | `/api/equipment`      | autenticado   | Lista o estoque                         |
| POST   | `/api/equipment`      | admin         | Adiciona/atualiza estoque               |
| GET    | `/api/withdrawals`    | autenticado   | Lista retiradas (próprias, ou todas p/ admin) |
| POST   | `/api/withdrawals`    | autenticado   | Registra uma retirada (com assinatura)  |

## O que mudou em relação ao export original do Figma Make

- Projeto convertido de TypeScript para JavaScript puro (`.tsx` → `.jsx`).
- Removidas todas as dependências e arquivos específicos do Figma Make
  (`.figma/`, plugins do `vite.config`, comentários `<!-- figma:* -->` no
  HTML, `CLAUDE.md`/`AGENTS.md`, `.mise.toml`).
- Um back-end de verdade substitui o antigo armazenamento apenas em
  `localStorage` do navegador.
- Dados pessoais de colaboradores agora são cifrados em repouso, e
  senhas usam hash em vez de texto puro.
- Não existe autocadastro: o cadastro de colaboradores é feito apenas pelo
  administrador (tela "CADASTRAR" / `POST /api/users`). Não há nenhuma rota
  pública de registro — só o login é público.
- `.gitignore` atualizado para cobrir `.env`, `.vercel/` e o "banco" local
  de desenvolvimento (`.data/`).
- Na tela "USUÁRIOS", o administrador pode alterar a senha de um
  colaborador ou apagar o cadastro dele (o histórico de retiradas
  anteriores é mantido, para auditoria — só o acesso ao sistema é removido).
- As assinaturas coletadas nas retiradas agora podem ser vistas na tela
  (histórico do usuário, painel do admin e tela de usuários) e baixadas
  como um comprovante em PNG contendo nome do colaborador, equipamento e
  a assinatura.
- **Login separado do nome**: cada colaborador tem um **login** (usado só
  para entrar no sistema) distinto do **nome** (usado para exibição). O
  formulário de cadastro sugere um login a partir do nome digitado, mas o
  administrador pode editar livremente. Duas pessoas podem ter o mesmo
  nome — o que precisa ser único é o login.

## Limitações conhecidas

- O decremento de estoque em `withdrawals` faz leitura-e-escrita simples
  (sem transação atômica do Redis); para o volume de uma equipe pequena
  isso não costuma ser um problema, mas duas retiradas simultâneas do
  último item do mesmo tamanho, em teoria, podem ser uma corrida. Se isso
  for crítico para o seu uso, dá para evoluir para `MULTI`/`WATCH` do
  Redis.
- Sem Redis configurado, o "banco" local não é adequado para produção.
