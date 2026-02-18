
# Melhorar Fluidez da Aba de Anuncios

## Problema
O componente `AdsManager` tem animacoes basicas (apenas fade-in nos cards) e a interface carece de transicoes suaves, micro-interacoes e feedback visual que os outros componentes do app ja possuem.

## Melhorias Propostas

### 1. Animacoes com Framer Motion aprimoradas
- **Stats cards**: Adicionar `AnimatePresence` e animacao de contagem nos numeros (counter animation)
- **Lista de anuncios**: Usar `layout` animation nos cards para transicoes suaves ao reordenar/remover
- **Stagger cascade**: Aumentar o efeito de entrada em cascata nos cards com spring physics
- **Exit animations**: Adicionar animacao de saida ao deletar um anuncio (`AnimatePresence` + exit variants)

### 2. Micro-interacoes nos cards
- Hover com `whileHover` (scale sutil + shadow) e `whileTap` (scale down) nos botoes de acao
- Transicao suave no toggle ativo/inativo (mudanca de opacidade animada ao inves de classe estatica)
- Thumbnail com hover zoom suave

### 3. Estado vazio animado
- Animar o icone `Megaphone` com float/bounce no estado vazio
- Fade-in suave no texto

### 4. Dialog com transicao melhorada
- Animacao de entrada/saida no preview da imagem dentro do dialog (scale-in)

---

## Secao Tecnica

### Arquivo: `src/components/admin/AdsManager.tsx`

**Mudancas principais:**

1. Importar `AnimatePresence` e `useAnimationControls` do framer-motion

2. **Stats cards** - Envolver em `motion.div` com stagger:
```tsx
<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
```

3. **Lista de ads** - Adicionar `AnimatePresence` com `layout` e `exit`:
```tsx
<AnimatePresence mode="popLayout">
  {ads?.map((ad, index) => (
    <motion.div
      key={ad.id}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
    >
```

4. **Card hover** - `whileHover={{ scale: 1.01, boxShadow: "..." }}` no Card wrapper

5. **Botoes de acao** - `whileHover={{ scale: 1.15 }}` e `whileTap={{ scale: 0.9 }}` em cada botao

6. **Toggle ativo** - Transicao de opacidade animada via `motion.div` com `animate={{ opacity: ad.active ? 1 : 0.5 }}`

7. **Image preview no dialog** - `motion.div` com `initial={{ scale: 0.8, opacity: 0 }}` e `animate={{ scale: 1, opacity: 1 }}`

8. **Empty state** - Icone Megaphone com `animate={{ y: [0, -8, 0] }}` em loop

9. **Upload area** - Hover animation com border-color pulse
