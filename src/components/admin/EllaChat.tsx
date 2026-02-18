import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ellaAvatar from '@/assets/ella-avatar.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
  isStreaming?: boolean;
}

const actionLabels: Record<string, string> = {
  add_product: '➕ Produto adicionado',
  update_product: '✏️ Produto atualizado',
  delete_product: '🗑️ Produto removido',
  add_link: '➕ Link adicionado',
  update_link: '✏️ Link atualizado',
  delete_link: '🗑️ Link removido',
  add_ad: '➕ Anúncio criado',
  update_ad: '✏️ Anúncio atualizado',
  delete_ad: '🗑️ Anúncio removido',
  list_data: '📋 Dados listados',
  search_data: '🔍 Busca realizada',
};

const toolStatusLabels: Record<string, string> = {
  add_product: '➕ Adicionando produto...',
  update_product: '✏️ Atualizando produto...',
  delete_product: '🗑️ Removendo produto...',
  add_link: '➕ Adicionando link...',
  update_link: '✏️ Atualizando link...',
  delete_link: '🗑️ Removendo link...',
  add_ad: '➕ Criando anúncio...',
  update_ad: '✏️ Atualizando anúncio...',
  delete_ad: '🗑️ Removendo anúncio...',
  list_data: '📋 Buscando dados...',
  search_data: '🔍 Pesquisando...',
};

export default function EllaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! 👋 Eu sou a **Ella Ribeiro**, sua assistente virtual. Posso te ajudar a gerenciar produtos, links e anúncios. O que você precisa?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, statusText]);

  const invalidateActions = useCallback((actions: string[]) => {
    if (!actions || actions.length === 0) return;
    const invalidateKeys = new Set<string>();
    for (const action of actions) {
      if (action.includes('product')) invalidateKeys.add('products');
      if (action.includes('link')) invalidateKeys.add('links');
      if (action.includes('ad')) invalidateKeys.add('ads');
      if (action === 'list_data' || action === 'search_data') {
        invalidateKeys.add('products');
        invalidateKeys.add('links');
        invalidateKeys.add('ads');
      }
    }
    for (const key of invalidateKeys) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    toast.success('Ação executada pela Ella!');
  }, [queryClient]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStatusText('');

    // Add streaming placeholder
    setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/ella-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({ messages: chatMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream não disponível');

      const decoder = new TextDecoder();
      let buffer = '';
      let streamedContent = '';
      let finalActions: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            // Next line should be data
            continue;
          }
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              // Determine event type from the data structure
              if ('content' in data) {
                // Token event
                streamedContent += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
                    updated[lastIdx] = { ...updated[lastIdx], content: streamedContent };
                  }
                  return updated;
                });
                setStatusText('');
              } else if ('tool' in data) {
                // Status event - tool being executed
                const label = toolStatusLabels[data.tool] || `⚙️ Executando ${data.tool}...`;
                setStatusText(label);
              } else if ('actions' in data) {
                // Done event
                finalActions = data.actions || [];
              } else if ('error' in data) {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              // Skip malformed data
              if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
                // Re-throw actual errors (not parse errors)
                if (dataStr.includes('"error"')) {
                  try {
                    const errData = JSON.parse(dataStr);
                    if (errData.error) throw new Error(errData.error);
                  } catch { /* skip */ }
                }
              }
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = {
            role: 'assistant',
            content: streamedContent || 'Pronto! Algo mais?',
            actions: finalActions,
            isStreaming: false,
          };
        }
        return updated;
      });

      invalidateActions(finalActions);
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      const errorMsg = e?.message || 'Erro desconhecido';
      setMessages((prev) => {
        // Replace the streaming placeholder with error
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = { role: 'assistant', content: `❌ Ocorreu um erro: ${errorMsg}`, isStreaming: false };
        } else {
          updated.push({ role: 'assistant', content: `❌ Ocorreu um erro: ${errorMsg}` });
        }
        return updated;
      });
      toast.error('Erro ao comunicar com a Ella');
    } finally {
      setIsLoading(false);
      setStatusText('');
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] min-h-[500px] bg-card/80 border border-border/50 rounded-xl backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-secondary/30">
        <Avatar className="h-10 w-10 ring-2 ring-primary/30">
          <AvatarImage src={ellaAvatar} alt="Ella Ribeiro" />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Ella Ribeiro</h3>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Assistente IA • Gerenciamento do app</p>
        </div>
        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500">
          Online
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                    <AvatarImage src={ellaAvatar} alt="Ella" />
                    <AvatarFallback><Bot className="w-3.5 h-3.5" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary/60 text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
                    )}
                  </p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/30">
                      {msg.actions.map((action, j) => (
                        <Badge key={j} variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary">
                          {actionLabels[action] || action}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Status indicator for tool execution */}
          {isLoading && statusText && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5"
            >
              <div className="ml-9">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary animate-pulse">
                  {statusText}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 p-3 bg-secondary/20">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando para a Ella..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          Ex: "Adiciona um produto Planner 2026 por R$29,90" • "Lista todos os links" • "Desativa o anúncio X"
        </p>
      </div>
    </div>
  );
}
