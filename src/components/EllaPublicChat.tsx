import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Bot, X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ellaAvatar from '@/assets/ella-avatar.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  whatsappLink?: string;
  isStreaming?: boolean;
}

const QUICK_OPTIONS = [
  '🛒 Ver produtos em destaque',
  '💡 Preciso de ajuda para escolher',
  '📱 Quero saber sobre Social Media',
  '🎓 Produtos para estudos',
];

export function EllaPublicChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou a **Ella**, assistente virtual da Juju Senna. Posso te ajudar a encontrar o produto ideal pra você! O que está buscando?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, statusText]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setStatusText('');

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const chatMessages = [...messages, { role: 'user' as const, content: text.trim() }].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/ella-public-chat`, {
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
      let whatsappLink = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) continue;
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if ('content' in data) {
                streamedContent += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
                    updated[lastIdx] = { ...updated[lastIdx], content: streamedContent };
                  }
                  return updated;
                });
                setStatusText('');
              } else if ('tool' in data) {
                const labels: Record<string, string> = {
                  search_products: '🔍 Buscando produtos...',
                  list_products: '📋 Carregando catálogo...',
                  send_to_whatsapp: '📱 Preparando atendimento...',
                };
                setStatusText(labels[data.tool] || '⚙️ Processando...');
              } else if ('url' in data) {
                whatsappLink = data.url;
              } else if ('error' in data) {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
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

      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = {
            role: 'assistant',
            content: streamedContent || 'Como posso te ajudar? 😊',
            whatsappLink: whatsappLink || undefined,
            isStreaming: false,
          };
        }
        return updated;
      });
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = { role: 'assistant', content: 'Desculpa, tive um probleminha! 😅 Tente novamente.', isStreaming: false };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      setStatusText('');
      abortRef.current = null;
    }
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showQuickOptions = messages.length <= 2 && !isLoading;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center bg-primary hover:brightness-110 active:scale-95 transition-all"
            aria-label="Falar com Ella"
          >
            <Avatar className="h-11 w-11 ring-2 ring-primary-foreground/30">
              <AvatarImage src={ellaAvatar} alt="Ella" />
              <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute inset-0 bg-primary rounded-full -z-10"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
              <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                <AvatarImage src={ellaAvatar} alt="Ella" />
                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground text-sm">Ella</h3>
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground">Assistente de compras • Online</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
                        <AvatarImage src={ellaAvatar} alt="Ella" />
                        <AvatarFallback><Bot className="w-3 h-3" /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-2 max-w-[80%]">
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-secondary/60 text-foreground rounded-bl-md'
                        }`}
                      >
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:my-0.5 [&_ul]:my-1 [&_li]:my-0 [&_strong]:text-inherit [&_a]:text-primary [&_a]:underline">
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
                          )}
                        </div>
                      </div>
                      {msg.whatsappLink && (
                        <a
                          href={msg.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && statusText && (
                  <div className="ml-8">
                    <Badge variant="outline" className="text-[11px] border-primary/30 text-primary animate-pulse">
                      {statusText}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Quick options */}
              {showQuickOptions && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {QUICK_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => sendMessage(opt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-foreground hover:bg-secondary transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-3 bg-secondary/20">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="rounded-full w-9 h-9 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
