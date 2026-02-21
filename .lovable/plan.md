
# Criar Páginas Funcionais: Termos de Uso, Privacidade e Contato

## O que será feito

### 1. Página "Termos de Uso" (`src/pages/TermosDeUso.tsx`)
Página completa com termos de uso reais e profissionais para a Decode Analytics, cobrindo:
- Aceitacao dos termos
- Descricao dos servicos oferecidos (produtos digitais, ferramentas, design, etc.)
- Propriedade intelectual
- Politica de pagamentos e reembolsos
- Limitacao de responsabilidade
- Modificacoes nos termos
- Contato

Visual: fundo escuro (#141414), texto claro, tipografia limpa, botao de voltar ao topo.

### 2. Página "Privacidade" (`src/pages/Privacidade.tsx`)
Politica de privacidade completa cobrindo:
- Dados coletados (nome, email, WhatsApp, navegacao)
- Como os dados sao usados
- Cookies e rastreamento
- Compartilhamento com terceiros
- Direitos do usuario (LGPD)
- Retencao de dados
- Contato do responsavel

### 3. Página "Contato" (`src/pages/Contato.tsx`)
Pagina simples com:
- Email de contato
- Link direto para WhatsApp (usando o numero do perfil)
- Link para Instagram
- Formulario basico (nome, email, mensagem) -- apenas visual, sem backend por enquanto

### 4. Atualizar Footer (`src/components/Footer.tsx`)
- Trocar `href: '#'` por links reais usando React Router (`/termos`, `/privacidade`, `/contato`)
- Usar `Link` do react-router-dom em vez de `<a>` para navegacao interna

### 5. Atualizar Rotas (`src/App.tsx`)
- Adicionar 3 novas rotas: `/termos`, `/privacidade`, `/contato`

---

## Secao Tecnica

### Novos Arquivos
- `src/pages/TermosDeUso.tsx` -- pagina completa com texto juridico adaptado
- `src/pages/Privacidade.tsx` -- politica de privacidade LGPD
- `src/pages/Contato.tsx` -- informacoes de contato + formulario visual

### Arquivos Modificados
- `src/App.tsx` -- adicionar 3 rotas novas
- `src/components/Footer.tsx` -- trocar hrefs para `/termos`, `/privacidade`, `/contato` e usar `Link` do react-router-dom

### Estrutura das Paginas
Todas as 3 paginas seguirao o mesmo layout:
- Header simplificado com botao de voltar (seta + "Voltar") e logo "DECODE"
- Conteudo em `max-w-3xl mx-auto` com padding
- Fundo `bg-background` (escuro, consistente com o tema Netflix)
- Titulos em `text-3xl font-bold text-foreground`
- Paragrafos em `text-muted-foreground leading-relaxed`
- Footer reutilizado no final
