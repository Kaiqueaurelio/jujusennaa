

# Melhorar Velocidade de Resposta da Ella Ribeiro

## Problema
A Ella demora para responder porque:
1. O frontend espera a resposta **completa** antes de mostrar qualquer texto (sem streaming)
2. O backend busca **todos os dados** do banco antes de cada resposta, mesmo para perguntas simples
3. O loop agentico pode fazer ate 5 chamadas sequenciais a IA, e o usuario so ve o resultado no final

## Solucao: Streaming + Otimizacoes

### O que muda para o usuario
- As respostas vao aparecendo **palavra por palavra** em tempo real, como no ChatGPT
- O tempo ate a primeira palavra aparecer sera de ~1-2 segundos em vez de 5-15 segundos
- Indicador de "digitando..." mais responsivo

---

## Secao Tecnica

### 1. Backend: Streaming na Edge Function (`supabase/functions/ella-chat/index.ts`)

**Mudancas:**
- Manter o agentic loop (tool calls) como esta, pois precisa executar acoes
- Na **ultima iteracao** (quando nao ha mais tool calls), usar `stream: true` na chamada a IA
- Retornar um `ReadableStream` com SSE para o frontend em vez de esperar a resposta completa
- Durante as iteracoes com tool calls, enviar eventos SSE intermediarios de status (ex: "Buscando dados...", "Executando acao...")
- Adicionar `select()` mais enxuto no `fetchContext` - buscar apenas campos essenciais (id, name, price, active)
- Reduzir `MAX_ITERATIONS` de 5 para 3 (na pratica raramente precisa de mais)

Fluxo:
```text
Usuario envia mensagem
  -> Backend busca contexto (otimizado, campos minimos)
  -> Loop agentico:
     - Se tem tool_calls: executa e envia SSE de status ("Executando: add_product...")
     - Se nao tem tool_calls: faz chamada final com stream=true
  -> Tokens da resposta final chegam via SSE em tempo real
```

### 2. Frontend: Renderizacao Progressiva (`src/components/admin/EllaChat.tsx`)

**Mudancas:**
- Trocar `supabase.functions.invoke()` por `fetch()` direto com leitura de SSE
- Implementar parser SSE linha por linha para renderizar tokens conforme chegam
- Atualizar o ultimo `message` do assistant progressivamente (nao criar nova mensagem a cada token)
- Mostrar badges de acao intermediaria em tempo real ("Executando: Produto adicionado...")
- Adicionar cursor piscante (blinking cursor) no final do texto enquanto esta recebendo

### 3. Otimizacoes adicionais no backend

- **Contexto mais leve**: No `fetchContext`, selecionar apenas `id, name, active, price` nos produtos (sem description, tags, full_description)
- **Cache de contexto**: Se o usuario enviar varias mensagens seguidas, reutilizar o contexto por 30 segundos
- **Tool calls em paralelo**: Quando a IA retorna multiplos tool_calls, executar com `Promise.all()` em vez de sequencialmente

### Arquivos modificados
- `supabase/functions/ella-chat/index.ts` - streaming SSE + otimizacoes
- `src/components/admin/EllaChat.tsx` - parser SSE + renderizacao progressiva
