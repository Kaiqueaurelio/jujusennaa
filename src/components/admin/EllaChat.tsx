import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ellaAvatar from '@/assets/ella-avatar.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('ella-chat', {
        body: { messages: chatMessages },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Desculpe, não consegui processar sua solicitação.',
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Invalidate relevant queries if actions were performed
      if (data.actions && data.actions.length > 0) {
        const invalidateKeys = new Set<string>();
        for (const action of data.actions) {
          if (action.includes('product')) invalidateKeys.add('products');
          if (action.includes('link')) invalidateKeys.add('links');
          if (action.includes('ad')) invalidateKeys.add('ads');
          if (action === 'list_data') {
            invalidateKeys.add('products');
            invalidateKeys.add('links');
            invalidateKeys.add('ads');
          }
        }
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: [key] });
        }
        toast.success('Ação executada pela Ella!');
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Erro desconhecido';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Ocorreu um erro: ${errorMsg}` },
      ]);
      toast.error('Erro ao comunicar com a Ella');
    } finally {
      setIsLoading(false);
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
                  <p className="whitespace-pre-wrap">{msg.content}</p>
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

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5"
            >
              <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                <AvatarImage src={ellaAvatar} alt="Ella" />
                <AvatarFallback><Bot className="w-3.5 h-3.5" /></AvatarFallback>
              </Avatar>
              <div className="bg-secondary/60 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
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
