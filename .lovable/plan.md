

# Melhorias Recomendadas para o Projeto DECODE

## 1. Busca Funcional de Produtos

Atualmente o botão de busca (lupa) no header nao faz nada. Implementar uma busca real que filtra produtos e links em tempo real, com um overlay elegante estilo "Spotlight Search".

**O que muda:**
- Clicar na lupa abre um campo de busca com overlay
- Digitar filtra produtos e links instantaneamente
- Resultados clicaveis que abrem o produto ou link

---

## 2. Categorias com Filtros na Loja

Os produtos sao exibidos apenas em carrosseis lineares sem opcao de filtrar. Adicionar abas/chips de categorias acima dos produtos para que visitantes filtrem por tipo (ex: "Social Media", "IA", "Estudos", "Ferramentas").

**O que muda:**
- Chips horizontais de categorias clicaveis
- Ao clicar, mostra apenas produtos daquela categoria
- Opcao "Todos" para resetar

---

## 3. Pagina de Detalhes Individual do Produto (SEO)

Atualmente os produtos abrem em modal. Criar rotas individuais (`/produto/:id`) melhora o SEO e permite compartilhamento direto de links de produtos.

**O que muda:**
- Nova rota `/produto/:id` com pagina completa
- Modal continua funcionando no carrossel, mas com opcao de abrir pagina completa
- URLs compartilhaveis para cada produto

---

## 4. Tema Claro / Modo Light

O app so tem tema escuro. Adicionar toggle para tema claro melhora acessibilidade e preferencia do usuario.

**O que muda:**
- Botao de toggle sol/lua no header
- Variaveis CSS para modo claro
- Preferencia salva no localStorage

---

## 5. Performance e Loading States

Melhorar a experiencia de carregamento:
- Imagens com lazy loading e placeholder blur
- Skeleton loaders mais fieis ao layout final
- Otimizacao de imagens dos produtos (formatos WebP)

---

## 6. Footer Completo

O footer atual e minimal demais (so copyright). Adicionar links uteis, redes sociais, e informacoes de contato.

---

## 7. PWA Melhorada

O app ja tem manifest.json e service worker, mas pode melhorar:
- Tela de instalacao personalizada ("Adicionar a tela inicial")
- Cache offline dos produtos ja visitados
- Icones de alta resolucao

---

## Secao Tecnica

### Busca de Produtos (Item 1)
- Criar componente `SearchOverlay.tsx` com input e resultados
- Usar state local para query, filtrar `products` e `links` com `.filter()`
- Ativar com o botao de busca ja existente no header
- Componente `cmdk` ja esta instalado e pode ser usado

### Filtros de Categoria (Item 2)
- Extrair categorias unicas dos produtos via `Set`
- Adicionar estado `selectedCategory` no `ProductSection.tsx`
- Renderizar chips horizontais com scroll

### Rotas de Produto (Item 3)
- Nova rota em `App.tsx`: `<Route path="/produto/:id" element={<ProductPage />} />`
- Novo componente `src/pages/ProductPage.tsx`
- Query individual `useProduct(id)` ou filtrar do cache existente

### Tema Claro (Item 4)
- `next-themes` ja esta instalado
- Adicionar `ThemeProvider` no `App.tsx`
- Definir variaveis `:root` para light mode em `index.css`
- Toggle no header

### Footer (Item 6)
- Novo componente `Footer.tsx`
- Links para redes sociais, WhatsApp, e pagina admin
- Informacoes de contato do perfil

### Ordem de Implementacao Sugerida
1. Busca funcional (maior impacto na UX)
2. Filtros de categoria
3. Footer completo
4. Tema claro
5. Rotas individuais de produto
6. Melhorias de PWA
7. Otimizacao de performance

