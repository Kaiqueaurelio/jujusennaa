

## Plano: Otimizar anúncios + Criar fluxo de checkout interativo

### 1. Otimizar performance do carrossel de anúncios

**Problema:** O `AnimatePresence mode="wait"` com `drag` + `useMotionValue` + `useTransform` na mesma `motion.a` causa re-renders pesados e travamentos, especialmente no mobile.

**Solução:**
- Trocar `AnimatePresence mode="wait"` por transições CSS simples (opacity + transform) sem montar/desmontar o DOM a cada slide
- Remover o `drag` com `useMotionValue`/`useTransform` e usar um handler de touch events nativo (touchstart/touchend) para detectar swipe, muito mais leve
- Pré-carregar as imagens dos slides adjacentes com `<link rel="preload">`
- Usar `will-change: transform` no container para GPU acceleration
- Simplificar as animações dos botões de navegacao (remover `whileHover`/`whileTap` do framer-motion, usar CSS `:hover`/`:active`)

### 2. Criar fluxo de checkout interativo antes do WhatsApp

**O que muda:** Ao clicar em "Garantir o meu agora", ao invés de abrir o WhatsApp direto, abre um formulário de checkout em etapas dentro do modal.

**Etapas do checkout:**
1. **Quantidade** - Seletor de quantidade (1-10) com cálculo do total atualizado em tempo real
2. **Dados do comprador** - Nome completo, E-mail, Telefone (opcional)
3. **Resumo do pedido** - Mostra produto, quantidade, preço unitário, cupom aplicado, total final, e dados do comprador
4. **Confirmação** - Botão "Enviar pedido via WhatsApp" que monta a mensagem completa com todos os dados

**Implementação:**
- Criar componente `CheckoutFlow.tsx` com 4 steps controlados por estado local
- Validação com zod: nome obrigatório (min 2 chars), email obrigatório e válido, quantidade >= 1
- Integrar dentro do `ProductModal.tsx` existente, substituindo o botão direto do WhatsApp
- A mensagem do WhatsApp incluirá: nome do cliente, email, produto, quantidade, valor unitário, cupom (se houver), e valor total
- Botão "Voltar" em cada etapa para o usuário revisar

### Detalhes técnicos

- O `CheckoutFlow` será um componente separado que recebe `product`, `finalPrice`, `appliedCoupon`, `whatsapp` como props
- Sem necessidade de banco de dados - os dados são usados apenas para compor a mensagem do WhatsApp
- Animações leves entre steps com CSS transitions (não framer-motion) para manter a fluidez
- Mobile-first: inputs com `inputMode` adequado (email, tel, numeric)

