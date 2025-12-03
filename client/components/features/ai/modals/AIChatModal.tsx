/**
 * AI Chat Modal
 * Quick AI chat interface accessible from floating button
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { 
  MessageSquare, Send, Loader2, Bot, User, 
  Sparkles, ExternalLink
} from 'lucide-react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName 
}: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: studentName 
          ? `Merhaba! ${studentName} hakkında sorularınızı yanıtlamak için buradayım. Size nasıl yardımcı olabilirim?`
          : 'Merhaba! Size nasıl yardımcı olabilirim? Öğrenciler, danışmanlık veya eğitim konularında sorularınızı yanıtlayabilirim.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, studentName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetchWithSchool('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          studentId,
          context: studentName ? `Öğrenci: ${studentName}` : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data?.response || data.response || data.message || 'Yanıt alınamadı.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Yanıt alınamadı');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Mesaj gönderilemedi');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openFullChat = () => {
    onClose();
    navigate(studentId ? `/ai-araclari?tab=ai-asistan&student=${studentId}` : '/ai-araclari?tab=ai-asistan');
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-white text-base">AI Asistan</DialogTitle>
                <DialogDescription className="text-white/80 text-xs">
                  {studentName ? `${studentName} hakkında soru sor` : 'Hızlı sohbet'}
                </DialogDescription>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/20"
              onClick={openFullChat}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Tam Ekran
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Düşünüyor...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın..."
                className="w-full px-4 py-3 pr-12 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                rows={1}
                disabled={loading}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-purple-600 hover:bg-purple-700"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <Sparkles className="h-3 w-3 inline mr-1" />
            AI yanıtları öğrenci verilerine dayalıdır
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
