# Gestão de EPI

Sistema de controle de EPI (equipamentos de proteção individual): estoque,
retiradas com assinatura digital, e cadastro de colaboradores — com um
back-end próprio (funções serverless) e um banco de dados em JavaScript
pronto para hospedar na Vercel.


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
