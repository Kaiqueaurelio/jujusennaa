
# Refinamentos Netflix: Detalhes que Faltam

## Resumo
Ajustes finos para aproximar ainda mais do visual Netflix sem alterar os designs ja aprovados (links coloridos, cards com hover 1.3x, billboard, rows). Foco em detalhes que o Netflix tem e que ainda nao foram implementados.

---

## Melhorias Propostas

### 1. Maturity Rating Badge no Billboard
O Netflix sempre mostra uma classificacao (ex: "16+", "L") no canto do billboard. Adicionar um badge discreto de categoria do produto em destaque no hero.

### 2. Top 10 Badge nos Cards
O Netflix mostra numeros grandes (1, 2, 3...) ao lado dos itens mais populares. Criar uma variacao na row "Destaques" com numeracao estilo Netflix ao lado dos thumbnails.

### 3. "Minha Lista" / Notificacao integrada ao card
No hover do card, o botao "+" atualmente abre WhatsApp. Manter isso mas adicionar um icone de "sino" (notificacao) ao lado, integrando com o sistema de push ja existente.

### 4. Efeito de som/haptic no hover (visual apenas)
Adicionar uma micro-animacao de "breathing" sutil no card ao entrar no hover (antes do scale 1.3x) - um leve brilho na borda superior.

### 5. Netflix-style "More Info" Modal
O ProductModal atual usa Dialog padrao. Transformar para abrir "inline" expandindo o card para baixo (como Netflix faz ao clicar na seta), com o Dialog completo apenas ao clicar em "Play".

### 6. Skeleton Loading igual Netflix
O Netflix mostra placeholders animados em forma de retangulos cinza pulsantes nas rows. Os skeletons atuais sao genericos - ajustar para ter o formato exato 16:9 dos cards.

### 7. Smooth scroll com snap nos carrosseis
Adicionar `scroll-snap-type: x mandatory` nos carrosseis de produtos para que ao rolar, os cards "encaixem" suavemente.

### 8. Header: esconder ao rolar para baixo, mostrar ao rolar para cima
Netflix esconde o header quando voce rola para baixo e mostra quando rola para cima. Implementar esse comportamento com framer-motion.

### 9. Transicao de fade na troca de categorias
Quando o usuario troca a categoria nos filtros, os produtos devem fazer um fade out/in suave em vez de trocar instantaneamente.

---

## Secao Tecnica

### Arquivos Modificados

**1. `src/components/HeroBillboard.tsx`**
- Adicionar badge de classificacao/categoria no canto inferior direito (ex: badge com categoria do produto featured)
- Adicionar efeito de "vignette" mais forte nas bordas

**2. `src/components/ProductCard.tsx`**
- Aceitar prop `rank?: number` para exibir numeracao Top 10
- Quando `rank` existe, renderizar numero grande (text-7xl font-black) ao lado esquerdo do card com stroke/outline
- Adicionar micro-brilho (gradient shimmer) na borda superior ao iniciar hover

**3. `src/components/ProductSection.tsx`**
- Passar `rank` para cards na row "Destaques" (index + 1)
- Adicionar `scroll-snap-type: x mandatory` e `scroll-snap-align: start` nos carrosseis
- Envolver lista filtrada em `AnimatePresence` + `motion.div` com fade transition ao trocar categoria
- Renomear "Destaques" para "Top 10 no Brasil Hoje" quando houver >= 3 featured

**4. `src/components/SkeletonLoaders.tsx`**
- Ajustar `ProductsSkeleton` para usar aspect-video e mesmas dimensoes dos cards reais (w-[230px] sm:w-[300px])

**5. `src/pages/Index.tsx`**
- Implementar logica de "hide on scroll down, show on scroll up" no header usando `useMotionValueEvent` do framer-motion
- Manter o gradiente transparente-para-solido ja existente

**6. `src/components/ProductModal.tsx`**
- Ajustar fundo para `bg-[#181818]` fixo (mais Netflix)
- Remover bordas coloridas, usar `border-[#2a2a2a]`
- Botao CTA: manter verde mas sem glow exagerado

### Detalhes do Top 10
O Netflix renderiza numeros grandes com borda/stroke ao lado dos thumbnails. Implementacao:
- Numero em `text-[80px] font-black` com `-webkit-text-stroke: 2px` em cinza
- Card deslocado para direita para abrir espaco para o numero
- Apenas na row "Destaques" / "Top 10"

### Header Hide/Show
Usar `useMotionValueEvent(scrollY, "change")` para detectar direcao do scroll:
- Scroll down: `translateY(-100%)`
- Scroll up: `translateY(0)`
- Transicao suave de 300ms

### Scroll Snap
Adicionar nos containers de scroll:
```text
scroll-snap-type: x mandatory
```
E nos items:
```text
scroll-snap-align: start
```
