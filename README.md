# Juju Senna — Loja Oficial

Aplicação web para vitrine de produtos digitais, links públicos e atendimento via WhatsApp, construída com React, Vite, TypeScript, Tailwind CSS e Supabase.

## Segurança

- Configure as credenciais de acesso pelo Supabase Auth.
- Nunca versione senhas, chaves privadas ou arquivos `.env`.
- Use políticas RLS no Supabase para restringir operações administrativas.
- Mantenha chaves de serviço apenas nos secrets das Edge Functions.
- Se uma credencial já foi publicada no repositório, remova-a e faça a rotação no serviço correspondente.

## Desenvolvimento

Instale Node.js e npm e execute:

```sh
git clone https://github.com/Kaiqueaurelio/jujusennaa.git
cd jujusennaa
npm ci
npm run dev
```

## Verificações

```sh
npm run lint
npm test
npm run build
```


This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/450b9cdb-f142-46cf-a037-5848f07532ef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
