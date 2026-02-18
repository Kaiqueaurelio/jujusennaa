

# Ella Ribeiro - Assistente IA do Painel Admin

## Visao Geral
Criar uma assistente de IA chamada **Ella Ribeiro** integrada ao painel admin, com avatar personalizado. Ella sera capaz de executar acoes reais no app via comandos em linguagem natural, como adicionar produtos, criar links, gerenciar anuncios, e mais.

## Como Funciona

O admin conversa com Ella em um chat. Ella interpreta o que o admin quer fazer e executa a acao diretamente no banco de dados. Exemplos:

- "Adiciona um produto chamado Planner 2026, preco 29.90, categoria Produtividade"
- "Ativa todos os produtos inativos"
- "Cria um link pro meu Instagram @decode"
- "Lista todos os produtos com desconto"
- "Desativa o anuncio da empresa X"

## Componentes a Criar

### 1. Avatar da Ella
Copiar a imagem enviada para `src/assets/ella-avatar.png` e usa-la como foto de perfil no chat.

### 2. Edge Function `ella-chat`
Uma funcao backend que:
- Recebe as mensagens do admin + contexto atual (produtos, links, ads)
- Usa Lovable AI (google/gemini-3-flash-preview) com **tool calling** para interpretar comandos
- Define tools para cada acao possivel:
  - `add_product` - adicionar produto
  - `update_product` - atualizar produto
  - `delete_product` - remover produto
  - `list_products` - listar produtos
  - `add_link` - adicionar link
  - `update_link` - atualizar link
  - `delete_link` - remover link
  - `add_ad` - criar anuncio
  - `update_ad` - atualizar anuncio
  - `delete_ad` - remover anuncio
  - `list_data` - listar dados gerais
- Executa a acao no banco usando o service role key
- Retorna confirmacao + dados atualizados

### 3. Componente `EllaChat`
- Chat panel com avatar da Ella no header
- Mensagens com bolhas estilizadas (admin vs Ella)
- Input de texto na parte inferior
- Streaming de respostas da IA
- Feedback visual quando uma acao e executada (toast + badge)
- Animacoes com Framer Motion

### 4. Integracao no Admin
- Nova aba "Ella IA" no TabsList com icone de sparkles
- O componente EllaChat ocupa o conteudo da aba
- Ella tem acesso de leitura aos dados atuais para contexto

---

## Secao Tecnica

### Edge Function: `supabase/functions/ella-chat/index.ts`

**System prompt da Ella:**
```text
Voce e Ella Ribeiro, assistente virtual do painel DECODE. Voce ajuda o admin a gerenciar
produtos, links e anuncios. Seja amigavel, objetiva e proativa. Sempre confirme as acoes
executadas. Responda sempre em portugues brasileiro.
```

**Tools definidas para o modelo:**
- `add_product(name, description, fullDescription, price, originalPrice, category, tags, featured, active)`
- `update_product(id, ...fields)` 
- `delete_product(id)`
- `add_link(title, url, icon, category, order, active)`
- `update_link(id, ...fields)`
- `delete_link(id)`
- `add_ad(title, description, image_url, link_url, advertiser_name, active, sort_order)`
- `update_ad(id, ...fields)`
- `delete_ad(id)`
- `list_data(type)` - type: "products" | "links" | "ads"

**Fluxo:**
1. Frontend envia mensagens + dados de contexto resumidos
2. Edge function chama Lovable AI com tools
3. Se o modelo retorna tool_calls, executa cada acao no banco via Supabase service role
4. Retorna resultado + mensagem amigavel da Ella

### Componente: `src/components/admin/EllaChat.tsx`

- Estado: array de mensagens `{role, content, actions?}`
- Hook customizado `useEllaChat` para gerenciar o streaming
- Ao receber confirmacao de acao, invalida queries relevantes (products, links, ads)
- Auto-scroll para ultima mensagem
- Mensagem de boas-vindas da Ella ao abrir

### Atualizacao do config.toml
Adicionar entrada para a nova funcao:
```text
[functions.ella-chat]
verify_jwt = false
```

### Arquivos criados/editados
- **Criar**: `src/assets/ella-avatar.png` (copia do upload)
- **Criar**: `supabase/functions/ella-chat/index.ts`
- **Criar**: `src/components/admin/EllaChat.tsx`
- **Editar**: `src/pages/Admin.tsx` (nova aba)
- **Editar**: `supabase/config.toml` (registrar funcao)

### Ordem de implementacao
1. Copiar avatar da Ella
2. Criar edge function ella-chat com tools
3. Criar componente EllaChat
4. Integrar no Admin.tsx como nova aba
5. Deploy da edge function
6. Testar end-to-end

