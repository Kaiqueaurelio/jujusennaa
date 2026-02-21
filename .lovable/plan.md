
# Redesign Completo: Visual Identico ao Netflix

## Objetivo
Transformar a interface publica do app para ser visualmente identica ao Netflix, mantendo todas as funcionalidades, dados e consistencia ja construidos. O foco e no layout, tipografia, cores, espacamento e comportamento visual dos componentes.

## O Que Muda Visualmente

### 1. Header (Barra de Navegacao)
**Hoje:** Logo "DECODE" em vermelho + icones soltos
**Netflix:** Fundo preto solido com gradiente sutil para transparente, logo vermelho a esquerda, navegacao horizontal inline (links como "Loja", "Links", etc.), icones de busca/notificacao/perfil a direita com avatar pequeno redondo

- Remover botao de hamburguer do header (mover para drawer lateral apenas)
- Adicionar navegacao inline com os nomes das categorias (Inicio, Loja, Links)
- Avatar do perfil pequeno (32px) no canto direito substituindo o icone de 3 pontos
- Fundo: gradiente de preto solido para transparente ao rolar

### 2. Hero / Billboard (Substituir HeaderProfile)
**Hoje:** Avatar + nome + bio em linha horizontal simples
**Netflix:** Banner grande (hero) com imagem de destaque, titulo grande, descricao curta, e botoes de acao

- Transformar o HeaderProfile em um "Billboard" estilo Netflix
- Usar o produto destaque (featured) como imagem de fundo do hero
- Nome da loja e bio sobrepostos na imagem com gradiente escuro
- Botoes: "Ver Loja" (branco) e "Mais Informacoes" (cinza translucido)
- Altura: ~60vh no desktop, ~40vh no mobile

### 3. Linhas de Produtos (Product Rows)
**Hoje:** Cards com 260px, bordas arredondadas, badge neon, botao WhatsApp visivel
**Netflix:** Thumbnails horizontais (landscape 16:9), sem bordas, hover expande o card com info overlay, titulo da linha a esquerda em branco

- Cards em formato **landscape** (ratio 16:9) em vez de quadrados
- Largura: ~230px mobile, ~300px desktop
- Sem bordas arredondadas exageradas (usar rounded-md, nao rounded-2xl)
- Remover botao WhatsApp do card (mover para o hover/modal)
- No hover: card escala 1.3x, mostra overlay com titulo + preco + botao play/detalhes
- Titulo do produto aparece embaixo do thumbnail normalmente, mas no hover aparece no overlay
- Setas de navegacao: circulos semi-transparentes grandes nas laterais (estilo Netflix)
- Remover scroll progress bar (Netflix nao tem)
- Manter as 3 linhas: "Destaques", "Minha Loja", "Principais escolhas para voce"

### 4. Links Section
**Hoje:** Cards gradientes coloridos em pill format
**Netflix:** Manter como uma linha horizontal mas com visual mais limpo, cards menores e mais escuros

- Cards com fundo cinza escuro (#181818) em vez de gradientes coloridos
- Icone + titulo apenas, sem dominio
- Hover: borda vermelha sutil

### 5. Secao de Anuncios
- Manter o carrossel mas remover bordas arredondadas excessivas (rounded-lg em vez de rounded-2xl)
- Overlay de info no hover mais sutil
- Badge "Patrocinado" mais discreto

### 6. Footer
**Hoje:** Brand centralizado + icones sociais + copyright
**Netflix:** Links em colunas (cinza), copyright discreto, tudo muito minimalista

- Layout em colunas com links (WhatsApp, Instagram, Email como texto, nao icones)
- Cor: cinza escuro (#737373)
- Sem animacoes de hover elaboradas

### 7. Mobile Menu (Sidebar)
**Hoje:** Fundo card com icones em circulos coloridos
**Netflix:** Fundo preto solido, itens em lista simples, sem circulos decorativos

- Fundo: preto solido (#141414)
- Itens: texto branco simples com icone a esquerda, sem circulos bg
- Avatar do perfil no topo do menu

### 8. Forcar Tema Escuro como Padrao
- Netflix e sempre escuro. Forcar dark mode como padrao no carregamento
- Manter o toggle de tema no header para quem quiser light mode

---

## Secao Tecnica

### Arquivos Modificados

**1. `src/index.css`** - Ajustar cores dark mode
- `--background` dark: `0 0% 5%` (Netflix #141414 em vez de #0a0a0a)
- `--card` dark: `0 0% 11%` (#1c1c1c)
- `--secondary` dark: `0 0% 18%` (#2d2d2d)
- `--border` dark: `0 0% 14%` (mais escuro)
- Adicionar classes utilitarias: `.netflix-row-title`, `.netflix-thumbnail`

**2. `src/pages/Index.tsx`** - Reestruturar layout
- Substituir `HeaderProfile` por novo componente `HeroBillboard`
- Header: remover hamburguer, adicionar nav inline, avatar pequeno
- Remover `space-y-10`, usar `space-y-8` ou `-mt-4` para rows mais juntas (Netflix e compacto)
- Forcar `dark` class no mount se nao definido

**3. `src/components/HeaderProfile.tsx` -> Novo `src/components/HeroBillboard.tsx`**
- Buscar produto featured para background
- Gradiente: `bg-gradient-to-r from-black/80 via-black/40 to-transparent` sobre a imagem
- Titulo grande (text-4xl bold), descricao (text-lg), 2 botoes

**4. `src/components/ProductCard.tsx`** - Redesign completo
- Aspect ratio: 16:9 (landscape) em vez de square
- Remover bordas neon, gradientes purple
- Remover botao WhatsApp do card
- Hover: `scale(1.3)`, overlay escuro com titulo + preco + icone play
- Transicao: 300ms ease com z-index elevado no hover
- Tamanho: `w-[230px] sm:w-[300px]`

**5. `src/components/ProductSection.tsx`** - Ajustar layout das rows
- Remover `ScrollProgressBar`
- Setas: full-height gradient overlays nos lados (como Netflix)
- Titulos: branco, sem icones decorativos (remover Flame, ShoppingCart, Sparkles)
- Category chips: estilo Netflix (underline no ativo, sem pill background)

**6. `src/components/LinkCard.tsx`** - Simplificar
- Fundo: `bg-[#2d2d2d]` uniforme
- Remover gradientes coloridos e pattern overlay
- Hover: `ring-1 ring-primary`

**7. `src/components/LinksSection.tsx`** - Titulo simples
- "Links Rapidos" em branco, sem animacao de entrada elaborada

**8. `src/components/AdsSection.tsx`** - Ajustes visuais
- Reduzir rounded de 2xl para lg
- Badge patrocinado mais discreto

**9. `src/components/Footer.tsx`** - Estilo Netflix
- Layout em grid de links textuais cinza
- Sem icones grandes, sem animacoes bounce

**10. `src/components/MobileMenu.tsx`** - Escurecer
- Fundo #141414
- Itens simples sem circulos decorativos

**11. `src/components/ProductModal.tsx`** - Manter funcionalidade
- Apenas ajustar cores para combinar (fundo mais escuro, menos bordas coloridas)

### Comportamento de Hover dos Cards (Netflix Signature)
O hover dos product cards e o elemento mais marcante do Netflix:
- Card normal: thumbnail simples, titulo embaixo
- Hover: card **escala 1.3x**, z-index 50, sombra grande, overlay aparece com:
  - Titulo em branco bold
  - Preco
  - Badges (tags)
  - Mini botoes: "play" (ver detalhes) e "+" (WhatsApp)
- Delay de 300ms antes do hover ativar (para nao ativar ao passar rapido)

### Nenhuma Funcionalidade Perdida
- Todos os hooks (useProducts, useLinks, useAds, useProfile, etc.) continuam iguais
- WhatsApp float, notificacoes, busca, admin - tudo mantido
- Dados do banco, cupons, analytics - intactos
- Apenas a camada visual e reestruturada
