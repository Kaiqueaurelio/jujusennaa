import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Bot, Paperclip, X, Image as ImageIcon, Film } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ellaAvatar from '@/assets/ella-avatar.png';

interface Attachment {
  file: File;
  preview: string;
  type: 'image' | 'video';
  uploadedUrl?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
  isStreaming?: boolean;
  attachments?: { url: string; type: 'image' | 'video' }[];
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

const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function EllaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! 👋 Eu sou a **Juju**, assistente virtual do painel. Posso ajudar com produtos, links, anúncios e informações públicas documentadas do perfil @juju.sennaa. O que você precisa?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    toast.success('Ação executada pela Juju!');
  }, [queryClient]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: Attachment[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} excede o limite de 20MB`);
        continue;
      }

      const isImage = ACCEPTED_TYPES.image.includes(file.type);
      const isVideo = ACCEPTED_TYPES.video.includes(file.type);

      if (!isImage && !isVideo) {
        toast.error(`${file.name}: formato não suportado. Use JPG, PNG, GIF, WebP, MP4 ou WebM`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      validFiles.push({ file, preview, type: isImage ? 'image' : 'video' });
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5));
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAttachments = async (): Promise<{ url: string; type: 'image' | 'video' }[]> => {
    const uploaded: { url: string; type: 'image' | 'video' }[] = [];

    for (const att of attachments) {
      const fileExt = att.file.name.split('.').pop();
      const fileName = `chat-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { error } = await supabase.storage.from('images').upload(filePath, att.file);
      if (error) {
        console.error('Upload error:', error);
        toast.error(`Erro ao enviar ${att.file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      uploaded.push({ url: publicUrl, type: att.type });
    }

    return uploaded;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || isLoading) return;

    setIsLoading(true);
    setIsUploading(attachments.length > 0);
    setStatusText(attachments.length > 0 ? '📤 Enviando arquivos...' : '');

    let uploadedFiles: { url: string; type: 'image' | 'video' }[] = [];

    // Upload attachments first
    if (attachments.length > 0) {
      uploadedFiles = await uploadAttachments();
      // Clean up previews
      attachments.forEach(a => URL.revokeObjectURL(a.preview));
      setAttachments([]);
      setIsUploading(false);
    }

    // Build content with file references
    let messageContent = text;
    if (uploadedFiles.length > 0) {
      const fileDescriptions = uploadedFiles.map(f =>
        f.type === 'image' ? `[Imagem enviada: ${f.url}]` : `[Vídeo enviado: ${f.url}]`
      ).join('\n');
      messageContent = messageContent
        ? `${messageContent}\n\n${fileDescriptions}`
        : fileDescriptions;
    }

    const userMsg: Message = {
      role: 'user',
      content: text || (uploadedFiles.length > 0 ? '📎 Arquivo(s) enviado(s)' : ''),
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Add streaming placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const chatMessages = [...messages, { role: 'user' as const, content: messageContent }].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Sua sessão expirou. Entre novamente para usar a Ella.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('A integração com o Supabase não está configurada.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ella-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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
                const label = toolStatusLabels[data.tool] || `⚙️ Executando ${data.tool}...`;
                setStatusText(label);
              } else if ('actions' in data) {
                finalActions = data.actions || [];
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
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = { role: 'assistant', content: `❌ Ocorreu um erro: ${errorMsg}`, isStreaming: false };
        } else {
          updated.push({ role: 'assistant', content: `❌ Ocorreu um erro: ${errorMsg}` });
        }
        return updated;
      });
      toast.error('Erro ao comunicar com a Juju');
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
          <AvatarImage src={ellaAvatar} alt="Juju" />
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Juju</h3>
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
                    <AvatarImage src={ellaAvatar} alt="Juju" />
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
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.attachments.map((att, j) => (
                        <div key={j} className="rounded-lg overflow-hidden max-w-[200px]">
                          {att.type === 'image' ? (
                            <img src={att.url} alt="Anexo" className="w-full h-auto rounded-lg" />
                          ) : (
                            <video src={att.url} controls className="w-full h-auto rounded-lg" style={{ maxHeight: '150px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-0.5 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_strong]:text-inherit [&_a]:text-primary [&_a]:underline">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
                    )}
                  </div>
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

          {/* Status indicator */}
          {isLoading && statusText && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
              <div className="ml-9">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary animate-pulse">
                  {statusText}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-secondary/20 px-3 py-2 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-1">
              {attachments.map((att, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-secondary"
                >
                  {att.type === 'image' ? (
                    <img src={att.preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Film className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-border/50 p-3 bg-secondary/20">
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando para a Juju..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          📎 Fotos e vídeos • Ex: "Adiciona um produto Planner 2026 por R$29,90" • "Lista todos os links"
        </p>
      </div>
    </div>
  );
}
