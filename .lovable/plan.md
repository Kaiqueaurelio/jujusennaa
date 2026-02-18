

# Melhorias de Animacao e Sugestoes para o App DECODE

## Parte 1: Melhorias de Animacao

### 1.1 Transicoes de Pagina (Page Transitions)
Adicionar `AnimatePresence` e `layoutId` nas rotas do `App.tsx` para que a navegacao entre paginas tenha transicoes suaves de fade + slide, em vez de cortes bruscos.

### 1.2 Scroll-Triggered Stagger nos Produtos
Atualmente os produtos animam individualmente. Melhorar com um **stagger container** usando `variants` do Framer Motion para que os cards entrem sequencialmente como uma onda coordenada, nao individualmente.

### 1.3 Parallax mais Suave no Header
O header atual tem parallax com spring physics, mas o efeito de `scale(0.95)` ao scrollar pode parecer estranho em telas grandes. Ajustar para usar apenas `opacity` e `backdropFilter`, removendo o `scale` do header e mantendo apenas no logo.

### 1.4 Micro-interacoes nos Chips de Categoria
Adicionar `layoutId` nos chips de categoria para que o indicador ativo anime suavemente entre chips (sliding pill effect), em vez de trocar cor instantaneamente.

### 1.5 Carrossel de Ads com Transicao Cruzada (Crossfade)
Substituir o scroll horizontal por `AnimatePresence` com crossfade real entre slides, criando uma transicao mais cinematica (fade + leve scale).

### 1.6 WhatsApp Floating Button com Entrada Atrasada
Adicionar um leve bounce na entrada e um tooltip animado que aparece apos 3 segundos com a mensagem "Precisa de ajuda?", desaparecendo apos 5 segundos.

### 1.7 Footer com Stagger Sequencial
Os icones sociais e o texto entram com stagger individual em vez de tudo de uma vez.

### 1.8 Product Modal com Transicao de Imagem Compartilhada
Usar `layoutId` no `ProductCard` e no `ProductModal` para criar um efeito de "shared element transition" onde a imagem do card expande suavemente para o modal.

---

## Parte 2: Sugestoes de Melhorias Gerais

### 2.1 Contador de Produtos por Categoria
Mostrar o numero de produtos em cada chip de categoria (ex: "Social Media (5)").

### 2.2 Indicador de Scroll nos Carrosseis
Adicionar uma barra fina animada abaixo dos carrosseis que mostra o progresso do scroll, dando feedback visual de quanto conteudo ainda ha.

### 2.3 "Voltar ao Topo" Animado
Botao flutuante que aparece ao scrollar alem de 500px, com animacao de fade + slide, posicionado acima do botao do WhatsApp.

### 2.4 Skeleton Loaders com Cores do Tema
Os skeletons atuais usam cor fixa. Atualizar para usar variaveis CSS do tema atual (claro/escuro) para melhor integracao visual.

### 2.5 Swipe Gestural nos Ads (Mobile)
Adicionar suporte a gestos de swipe (drag) no carrossel de ads para mobile, usando `drag="x"` do Framer Motion em vez de depender apenas do scroll nativo.

---

## Secao Tecnica

### Implementacao do Stagger Container (1.2)
```text
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 }
  }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" whileInView="visible">
  {products.map(p => <motion.div variants={item} />)}
</motion.div>
```

### Sliding Pill nos Chips (1.4)
Adicionar um `motion.div` com `layoutId="activeChip"` como background absoluto no chip selecionado. O Framer Motion anima automaticamente a posicao entre chips.

### Crossfade nos Ads (1.5)
```text
<AnimatePresence mode="wait">
  <motion.div
    key={currentIndex}
    initial={{ opacity: 0, scale: 1.02 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.5 }}
  />
</AnimatePresence>
```

### Shared Element Transition (1.8)
- No `ProductCard`: `<motion.img layoutId={`product-${product.id}`} />`
- No `ProductModal`: `<motion.img layoutId={`product-${product.id}`} />`
- O Framer Motion anima a imagem do card para o modal automaticamente

### Arquivos que serao editados
- `src/pages/Index.tsx` - Parallax ajustado, page transitions
- `src/components/ProductSection.tsx` - Stagger, sliding pill chips, scroll indicator
- `src/components/ProductCard.tsx` - layoutId na imagem
- `src/components/ProductModal.tsx` - layoutId na imagem, transicao compartilhada
- `src/components/AdsSection.tsx` - Crossfade, swipe gestural
- `src/components/FloatingWhatsApp.tsx` - Tooltip animado
- `src/components/Footer.tsx` - Stagger nos icones
- `src/App.tsx` - AnimatePresence nas rotas

### Ordem de Implementacao
1. Stagger containers nos produtos e links
2. Sliding pill nos chips de categoria
3. Crossfade nos ads
4. Shared element transition card -> modal
5. Parallax refinado no header
6. WhatsApp tooltip animado
7. Footer stagger
8. Page transitions
9. Scroll indicator nos carrosseis
10. Botao voltar ao topo

