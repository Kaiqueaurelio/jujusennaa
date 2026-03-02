

## Plano: Gerar thumbnails profissionais para todos os produtos via IA

### Situação atual
- 32 dos 33 produtos usam imagens estáticas locais (`/src/assets/products/*.jpg`)
- 1 produto já tem imagem gerada por IA armazenada no Storage
- Já existe a edge function `generate-image` funcional que gera imagens com estética neon/cyberpunk premium e salva no bucket `images`
- Já existe o modelo `google/gemini-2.5-flash-image-preview` configurado

### O que será feito

1. **Criar edge function de geração em lote** (`generate-all-images`)
   - Recebe lista de product IDs (ou flag "all")
   - Para cada produto, chama a mesma lógica de geração de imagem (prompt premium neon/cyberpunk)
   - Faz upload para o bucket `images` no Storage
   - Atualiza o campo `image_url` de cada produto no banco com a URL pública
   - Processa sequencialmente para evitar rate limits
   - Requer autenticação admin

2. **Adicionar botão "Gerar Todas as Imagens" no Admin**
   - Na aba de Produtos do painel admin, adicionar um botão no topo
   - Mostra progresso (ex: "Gerando 5/33...")
   - Permite cancelar
   - Ao finalizar, invalida o cache de produtos para atualizar a loja

3. **Atualizar o prompt de geração** para incluir o nome do produto visualmente na imagem, reforçando a identidade de cada thumbnail

### Detalhes técnicos

- A edge function processará no máximo 5 produtos por vez com delay entre chamadas para evitar rate limit 429
- O `ProductCard` já suporta URLs externas via `getProductImage()` — quando `image_url` começar com `http`, será usado diretamente sem precisar do mapeamento local
- As imagens locais em `src/assets/products/` continuarão como fallback caso alguma geração falhe

