import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';

import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Badge } from '@/components/atoms/Badge';
import { Separator } from '@/components/atoms/Separator';
import {
    Loader2, Send, Bot, User, Settings, Sparkles, Copy, Check,
    RefreshCw, Edit2, Trash2, Pin, PinOff, Download, Search,
    X, StopCircle, FileJson, FileCode, Clock, Hash, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { apiClient } from '@/lib/api/core/client';
import { AI_ENDPOINTS, STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    pinned?: boolean;
    editedAt?: Date;
}

interface AIModelsResponse {
    provider: 'openai' | 'ollama' | 'gemini';
    currentModel: string;
    availableModels: string[];
}

function CodeBlock({ inline, className, children, ...props }: any) {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (inline) {
        return (
            <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                {children}
            </code>
        );
    }

    return (
        <div className="relative group my-4">
            <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 opacity-0 group- z-10"
                onClick={handleCopy}
            >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <pre className="rounded-lg bg-[#1E1E1E] p-4 overflow-x-auto">
                <code className="text-sm font-mono text-gray-200" {...props}>
                    {code}
                </code>
            </pre>
        </div>
    );
}

function MessageActions({
    message,
    onCopy,
    onRegenerate,
    onEdit,
    onDelete,
    onPin
}: {
    message: Message;
    onCopy: () => void;
    onRegenerate?: () => void;
    onEdit?: () => void;
    onDelete: () => void;
    onPin: () => void;
}) {
    return (
        <div className="flex items-center gap-1 opacity-0 group-">
            <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 w-7 p-0">
                <Copy className="h-3 w-3" />
            </Button>
            {message.role === 'assistant' && onRegenerate && (
                <Button size="sm" variant="ghost" onClick={onRegenerate} className="h-7 w-7 p-0">
                    <RefreshCw className="h-3 w-3" />
                </Button>
            )}
            {message.role === 'user' && onEdit && (
                <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
                    <Edit2 className="h-3 w-3" />
                </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onPin} className="h-7 w-7 p-0">
                {message.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0 text-destructive">
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
    );
}

export default function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const { data: modelsData } = useQuery<AIModelsResponse>({
        queryKey: [AI_ENDPOINTS.MODELS],
        queryFn: () => apiClient.get<AIModelsResponse>(AI_ENDPOINTS.MODELS, { showErrorToast: false }),
        refetchInterval: 10000
    });

    const { data: studentsData } = useQuery<any[]>({
        queryKey: [STUDENT_ENDPOINTS.BASE],
        queryFn: () => apiClient.get<any[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false })
    });

    const totalWords = useMemo(() => {
        return messages.reduce((acc, msg) => acc + msg.content.split(/\s+/).length, 0);
    }, [messages]);

    const estimatedTokens = useMemo(() => {
        return Math.ceil(totalWords * 1.3);
    }, [totalWords]);

    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return messages;
        const query = searchQuery.toLowerCase();
        return messages.filter(msg => msg.content.toLowerCase().includes(query));
    }, [messages, searchQuery]);

    const pinnedMessages = useMemo(() => {
        return messages.filter(msg => msg.pinned);
    }, [messages]);

    const handleStreamingChat = async (message: string, isRegenerate = false) => {
        try {
            abortControllerRef.current = new AbortController();
            setIsStreaming(true);

            const conversationHistory = isRegenerate
                ? messages.slice(0, -1)
                : messages;

            if (!isRegenerate) {
                const userMessage: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: message,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, userMessage]);
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };
            setMessages(prev => isRegenerate ? [...prev.slice(0, -1), assistantMessage] : [...prev, assistantMessage]);

            const response = await fetch('/api/ai-assistant/chat-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    studentId: selectedStudent || undefined,
                    conversationHistory: conversationHistory.map(m => ({ role: m.role, content: m.content }))
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error('Streaming chat başarısız');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('Stream okunamadı');
            }

            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                accumulatedContent += parsed.content;

                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastIndex = newMessages.length - 1;
                                    newMessages[lastIndex] = {
                                        ...newMessages[lastIndex],
                                        content: accumulatedContent
                                    };
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }

            setIsStreaming(false);
            abortControllerRef.current = null;
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
                toast.info('Yanıt durduruldu');
            } else {
                toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Streaming chat hatası');
            }
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    };

    const handleStopStreaming = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const userMessage = input.trim();
        setInput('');

        await handleStreamingChat(userMessage);
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Mesaj kopyalandı');
    };

    const handleRegenerateResponse = (messageId: string) => {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex > 0) {
            const previousUserMessage = messages[messageIndex - 1];
            if (previousUserMessage.role === 'user') {
                handleStreamingChat(previousUserMessage.content, true);
            }
        }
    };

    const handleEditMessage = (messageId: string) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            setEditingMessageId(messageId);
            setEditingContent(message.content);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingMessageId || !editingContent.trim()) return;

        const messageIndex = messages.findIndex(m => m.id === editingMessageId);
        if (messageIndex !== -1) {
            const updatedMessages = [...messages];
            updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: editingContent,
                editedAt: new Date()
            };

            const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
            setMessages(messagesToKeep);
            setEditingMessageId(null);
            setEditingContent('');

            await handleStreamingChat(editingContent);
        }
    };

    const handleDeleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast.success('Mesaj silindi');
    };

    const handlePinMessage = (messageId: string) => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, pinned: !m.pinned } : m
        ));
    };

    const handleExport = (exportFormat: 'json' | 'txt' | 'md') => {
        let content = '';
        let filename = `chat-${format(new Date(), 'yyyy-MM-dd-HHmm')}.${exportFormat}`;

        if (exportFormat === 'json') {
            content = JSON.stringify(messages, null, 2);
        } else if (exportFormat === 'txt') {
            content = messages.map(m =>
                `[${format(m.timestamp, 'dd/MM/yyyy HH:mm', { locale: tr })}] ${m.role === 'user' ? 'Siz' : 'Asistan'}: ${m.content}`
            ).join('\n\n');
        } else {
            content = messages.map(m =>
                `### ${m.role === 'user' ? '👤 Siz' : '🤖 Asistan'} - ${format(m.timestamp, 'dd/MM/yyyy HH:mm', { locale: tr })}\n\n${m.content}`
            ).join('\n\n---\n\n');
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Sohbet dışa aktarıldı');
    };

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (editingMessageId) {
                handleSaveEdit();
            } else {
                handleSend();
            }
        }
    };

    const suggestedPrompts = useMemo(() => {
        const hasStudent = !!selectedStudent;
        const messageCount = messages.length;

        if (messageCount > 0) {
            return [
                { icon: '', text: 'Daha detaylı analiz et', disabled: false },
                { icon: '', text: 'Özetler ve verilendiri', disabled: false },
                { icon: '', text: 'Ek öneriler sun', disabled: false },
            ];
        }

        // Öğrenci Analizi kategorisi
        const analysisPrompts = [
            { icon: '📊', text: 'Kapsamlı Profil Analizi', disabled: !hasStudent, category: 'Öğrenci Analizi' },
            { icon: '⚠️', text: 'Derin Risk Analizi', disabled: !hasStudent, category: 'Öğrenci Analizi' },
            { icon: '📈', text: 'Pattern ve Trend Analizi', disabled: !hasStudent, category: 'Öğrenci Analizi' },
            { icon: '⭐', text: 'Güçlü Yönler ve Potansiyel', disabled: !hasStudent, category: 'Öğrenci Analizi' },
            { icon: '🧠', text: 'Öğrenme Stili ve Akademik Profil', disabled: !hasStudent, category: 'Öğrenci Analizi' },
        ];

        // Toplantı ve Görüşmeler kategorisi
        const meetingPrompts = [
            { icon: '👨‍👩‍👧', text: 'Veli Görüşmesi Hazırlığı', disabled: !hasStudent, category: 'Toplantı & Görüşme' },
            { icon: '👨‍🏫', text: 'Öğretmen Toplantısı Hazırlığı', disabled: !hasStudent, category: 'Toplantı & Görüşme' },
        ];

        // Müdahale ve Planlama kategorisi
        const interventionPrompts = [
            { icon: '🎯', text: 'Müdahale Planı Oluştur', disabled: !hasStudent, category: 'Müdahale & Planlama' },
            { icon: '📚', text: 'Akademik Destek Planı', disabled: !hasStudent, category: 'Müdahale & Planlama' },
            { icon: '💭', text: 'Sosyal-Duygusal Gelişim Planı', disabled: !hasStudent, category: 'Müdahale & Planlama' },
            { icon: '🤝', text: 'Akran İlişkileri ve Sosyal Beceriler', disabled: !hasStudent, category: 'Müdahale & Planlama' },
        ];

        // Özel Durumlar kategorisi
        const specialPrompts = [
            { icon: '🎓', text: 'Kariyer ve Gelecek Planlaması', disabled: !hasStudent, category: 'Özel Durum' },
            { icon: '🏠', text: 'Aile İşbirliği Stratejileri', disabled: !hasStudent, category: 'Özel Durum' },
        ];

        return [...analysisPrompts, ...meetingPrompts, ...interventionPrompts, ...specialPrompts];
    }, [selectedStudent, messages.length]);

    const promptTemplates: Record<string, string> = {
        // Öğrenci Analizi
        'Kapsamlı Profil Analizi': 'Bu öğrencinin kapsamlı bir profilini çıkar. Akademik, sosyal-duygusal, davranışsal tüm boyutları değerlendir. Güçlü yönler, riskler ve öneriler sun.',
        'Derin Risk Analizi': 'Bu öğrencinin risklerini derinlemesine analiz et. Akademik, davranışsal, sosyal-duygusal risk faktörlerini belirle. Erken uyarı sinyallerini ve koruyucu faktörleri göster.',
        'Pattern ve Trend Analizi': 'Son 6 aydaki verilerden patternleri çıkar. Akademik trendler, davranış döngüleri, devamsızlık patternleri neler? Hangi faktörler birbirleriyle ilişkili? Tekrarlayan örüntüler var mı?',
        'Güçlü Yönler ve Potansiyel': 'Öğrencinin güçlü yönlerini, yeteneklerini, ilgi alanlarını vurgula. Bu güçlü yönler nasıl daha fazla kullanılabilir? Potansiyeli nasıl geliştirebiliriz? Hangi alanlarda öne çıkıyor?',
        'Öğrenme Stili ve Akademik Profil': 'Bu öğrencinin öğrenme stilini, akademik güçlü ve zayıf yönlerini analiz et. Hangi öğretim yöntemleri daha etkili olur? Ders başarısını artırmak için öneriler sun.',

        // Toplantı ve Görüşmeler
        'Veli Görüşmesi Hazırlığı': 'Veli görüşmesi için detaylı hazırlık notları hazırla. Öğrencinin mevcut durumu, güçlü yönleri, gelişim alanları, aileyle iş birliği önerileri ve görüşme stratejileri sun. Veliye nasıl yaklaşmalıyız?',
        'Öğretmen Toplantısı Hazırlığı': 'Öğretmen toplantısı için detaylı brifing hazırla. Öğrencinin akademik durumu, sınıf içi davranışları, ders performansları, öğretmenlerle iş birliği stratejileri ve somut öneriler sun.',

        // Müdahale ve Planlama
        'Müdahale Planı Oluştur': 'Bu öğrenci için kanıta dayalı, somut, adım adım müdahale planı hazırla. Kısa, orta ve uzun vadeli hedefler belirle. Akademik, davranışsal, sosyal-duygusal odak alanlarını belirt. Ölçülebilir hedefler koy.',
        'Akademik Destek Planı': 'Öğrencinin akademik başarısını artırmak için özel destek planı hazırla. Hangi derslerde zorlanıyor? Öğrenme güçlükleri var mı? Somut çalışma stratejileri ve destek önerileri sun.',
        'Sosyal-Duygusal Gelişim Planı': 'Öğrencinin sosyal-duygusal gelişimini desteklemek için plan hazırla. Duygusal farkındalık, öz düzenleme, sosyal beceriler gibi alanlarda somut aktivite ve stratejiler öner.',
        'Akran İlişkileri ve Sosyal Beceriler': 'Öğrencinin akran ilişkilerini ve sosyal becerilerini analiz et. Arkadaşlık ilişkileri nasıl? Sosyal problem çözme becerileri gelişmiş mi? İyileştirme stratejileri öner.',

        // Özel Durumlar
        'Kariyer ve Gelecek Planlaması': 'Öğrencinin ilgi alanları, yetenekleri ve kariyer hedeflerini değerlendir. Hangi meslek grupları uygun? Lise/üniversite seçimi için öneriler sun. Kariyer gelişim yol haritası oluştur.',
        'Aile İşbirliği Stratejileri': 'Öğrencinin gelişimi için aile ile nasıl iş birliği yapılmalı? Evde hangi destekler sağlanabilir? Aile-okul iletişimi nasıl güçlendirilir? Pratik öneriler sun.',

        // Genel yardımcılar
        'Daha detaylı analiz et': 'Lütfen son yanıtını daha detaylı açıkla ve derinleştir.',
        'Özetler ve verilendiri': 'Şu ana kadar konuştuklarımızı özetle ve ana noktaları vurgula.',
        'Ek öneriler sun': 'Bu konunda ek öneriler ve farklı bakış açıları sun.',
    };

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
                <AIToolsLayout
                    title="AI Asistan"
                    description="Öğrenci bazlı AI sohbet, analiz ve toplantı hazırlıkları"
                    icon={Brain}
                >
                    {/* Main Tabs: Chat & Meeting Prep */}
                    {/* Chat Header with Stats */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            {messages.length > 0 && (
                                <>
                                    <Badge variant="outline" className="gap-1 bg-background/50">
                                        <Hash className="h-3 w-3" />
                                        {messages.length} mesaj
                                    </Badge>
                                    {pinnedMessages.length > 0 && (
                                        <Badge variant="outline" className="gap-1 bg-background/50">
                                            <Pin className="h-3 w-3" />
                                            {pinnedMessages.length} sabitlenmiş
                                        </Badge>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chat Tab Content */}
                    <div className="space-y-4">
                        {showSearch && (
                            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Sohbette ara..."
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setShowSearch(false);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {searchQuery && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {filteredMessages.length} sonuç bulundu
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Card className="lg:col-span-1 border-border/50 bg-card/95">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Ayarlar
                                    </CardTitle>
                                    <CardDescription>
                                        Asistan ayarlarını yapılandırın
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Öğrenci Seç
                                        </label>
                                        <Select value={selectedStudent || "none"} onValueChange={(val) => setSelectedStudent(val === "none" ? "" : val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tüm Öğrenciler</SelectItem>
                                                {studentsData?.map((student: any) => (
                                                    <SelectItem key={student.id} value={student.id}>
                                                        {student.name} {student.surname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Belirli bir öğrenci hakkında sohbet edin
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            AI Model
                                        </label>
                                        <div className="text-sm text-muted-foreground">
                                            {modelsData?.currentModel || 'Yükleniyor...'}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {modelsData?.provider === 'ollama'
                                                ? 'Yerel Ollama kullanılıyor'
                                                : 'OpenAI kullanılıyor'}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Hızlı Eylemler
                                        </label>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    setMessages([]);
                                                    setSearchQuery('');
                                                    setShowSearch(false);
                                                    toast.success('Sohbet sıfırlandı');
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3 mr-2" />
                                                Sohbeti Sıfırla
                                            </Button>
                                        </div>
                                    </div>

                                    {pinnedMessages.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                                    <Pin className="h-3 w-3" />
                                                    Sabitlenmiş Mesajlar
                                                </label>
                                                <ScrollArea className="h-32">
                                                    <div className="space-y-2">
                                                        {pinnedMessages.map((msg) => (
                                                            <div key={msg.id} className="text-xs p-2 bg-muted rounded-lg">
                                                                <div className="font-medium mb-1">
                                                                    {msg.role === 'user' ? '👤 Siz' : '🤖 Asistan'}
                                                                </div>
                                                                <div className="text-muted-foreground line-clamp-2">
                                                                    {msg.content}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-3 border-border/50 bg-card/95">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Sohbet</CardTitle>
                                            <CardDescription>
                                                AI asistanınızla konuşun, sorular sorun ve öneriler alın
                                            </CardDescription>
                                        </div>
                                        {isStreaming && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleStopStreaming}
                                                className="gap-2"
                                            >
                                                <StopCircle className="h-4 w-4" />
                                                Durdur
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ScrollArea className="h-[500px] pr-4">
                                        {filteredMessages.length === 0 && !searchQuery ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-4">
                                                <div className="relative mb-4">
                                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                                                    <Bot className="h-16 w-16 text-primary relative z-10" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                                    AI Rehber Asistanınıza Hoş Geldiniz
                                                </h3>
                                                <p className="text-xs text-muted-foreground max-w-md mb-6">
                                                    Öğrencileriniz hakkında sorular sorun, analiz yapın ve rehberlik önerileri alın
                                                </p>
                                                <div className="space-y-5 w-full max-w-2xl">
                                                    {/* Öğrenci Analizi Kategorisi */}
                                                    {suggestedPrompts.filter(p => p.category === 'Öğrenci Analizi').length > 0 && (
                                                        <div className="text-left">
                                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                                                                <span className="text-lg">📊</span>
                                                                <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                                                    Öğrenci Analizi
                                                                </h4>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {suggestedPrompts
                                                                    .filter(p => p.category === 'Öğrenci Analizi')
                                                                    .map((prompt, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            disabled={prompt.disabled}
                                                                            onClick={() => {
                                                                                const template = promptTemplates[prompt.text];
                                                                                if (template) setInput(template);
                                                                            }}
                                                                            className="justify-start h-auto py-2.5 px-3 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                                                                        >
                                                                            <span className="text-base mr-2.5">{prompt.icon}</span>
                                                                            <span className="text-left text-xs font-medium">{prompt.text}</span>
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Toplantı & Görüşme Kategorisi */}
                                                    {suggestedPrompts.filter(p => p.category === 'Toplantı & Görüşme').length > 0 && (
                                                        <div className="text-left">
                                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                                                                <span className="text-lg">👥</span>
                                                                <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                                                    Toplantı & Görüşme
                                                                </h4>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {suggestedPrompts
                                                                    .filter(p => p.category === 'Toplantı & Görüşme')
                                                                    .map((prompt, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            disabled={prompt.disabled}
                                                                            onClick={() => {
                                                                                const template = promptTemplates[prompt.text];
                                                                                if (template) setInput(template);
                                                                            }}
                                                                            className="justify-start h-auto py-2.5 px-3 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                                                                        >
                                                                            <span className="text-base mr-2.5">{prompt.icon}</span>
                                                                            <span className="text-left text-xs font-medium">{prompt.text}</span>
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Müdahale & Planlama Kategorisi */}
                                                    {suggestedPrompts.filter(p => p.category === 'Müdahale & Planlama').length > 0 && (
                                                        <div className="text-left">
                                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                                                                <span className="text-lg">🎯</span>
                                                                <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                                                    Müdahale & Planlama
                                                                </h4>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {suggestedPrompts
                                                                    .filter(p => p.category === 'Müdahale & Planlama')
                                                                    .map((prompt, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            disabled={prompt.disabled}
                                                                            onClick={() => {
                                                                                const template = promptTemplates[prompt.text];
                                                                                if (template) setInput(template);
                                                                            }}
                                                                            className="justify-start h-auto py-2.5 px-3 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                                                                        >
                                                                            <span className="text-base mr-2.5">{prompt.icon}</span>
                                                                            <span className="text-left text-xs font-medium">{prompt.text}</span>
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Özel Durum Kategorisi */}
                                                    {suggestedPrompts.filter(p => p.category === 'Özel Durum').length > 0 && (
                                                        <div className="text-left">
                                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                                                                <span className="text-lg">🌟</span>
                                                                <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                                                    Özel Durum
                                                                </h4>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {suggestedPrompts
                                                                    .filter(p => p.category === 'Özel Durum')
                                                                    .map((prompt, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            disabled={prompt.disabled}
                                                                            onClick={() => {
                                                                                const template = promptTemplates[prompt.text];
                                                                                if (template) setInput(template);
                                                                            }}
                                                                            className="justify-start h-auto py-2.5 px-3 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                                                                        >
                                                                            <span className="text-base mr-2.5">{prompt.icon}</span>
                                                                            <span className="text-left text-xs font-medium">{prompt.text}</span>
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {!selectedStudent && (
                                                    <p className="text-xs text-muted-foreground mt-6 px-3 py-2 bg-muted/30 rounded-md">
                                                        💡 Öğrenci bazlı analizler için önce sol taraftan bir öğrenci seçin
                                                    </p>
                                                )}
                                            </div>
                                        ) : filteredMessages.length === 0 && searchQuery ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">Sonuç Bulunamadı</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    "{searchQuery}" için eşleşen mesaj bulunamadı
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {filteredMessages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                                            } group fade-in slide-in-from-bottom-2`}
                                                    >
                                                        {message.role === 'assistant' && (
                                                            <div className="flex-shrink-0">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                                                                    <Bot className="h-5 w-5 text-primary-foreground" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className={`flex-1 ${message.role === 'user' ? 'max-w-xs' : 'max-w-2xl'}`}>
                                                            <div className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                                : 'bg-muted rounded-bl-none'
                                                                }`}>
                                                                {message.editedAt && (
                                                                    <div className="text-xs opacity-70 mb-1">
                                                                        (düzenlenmiş: {format(message.editedAt, 'HH:mm', { locale: tr })})
                                                                    </div>
                                                                )}
                                                                <>
                                                                    {message.role === 'assistant' ? (
                                                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                                                            <ReactMarkdown
                                                                                remarkPlugins={[remarkGfm]}
                                                                                rehypePlugins={[rehypeRaw]}
                                                                                components={{
                                                                                    code: CodeBlock,
                                                                                }}
                                                                            >
                                                                                {message.content}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                                                    )}
                                                                </>
                                                            </div>
                                                            <MessageActions
                                                                message={message}
                                                                onCopy={() => handleCopyMessage(message.content)}
                                                                onRegenerate={message.role === 'assistant' ? () => handleRegenerateResponse(message.id) : undefined}
                                                                onEdit={message.role === 'user' ? () => handleEditMessage(message.id) : undefined}
                                                                onDelete={() => handleDeleteMessage(message.id)}
                                                                onPin={() => handlePinMessage(message.id)}
                                                            />
                                                        </div>
                                                        {message.role === 'user' && (
                                                            <div className="flex-shrink-0">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center">
                                                                    <User className="h-5 w-5 text-primary-foreground" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        )}
                                    </ScrollArea>

                                    <div className="space-y-3">
                                        {!editingMessageId && suggestedPrompts.length > 0 && messages.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={prompt.disabled}
                                                        onClick={() => {
                                                            const template = promptTemplates[prompt.text];
                                                            if (template) {
                                                                setInput(template);
                                                            }
                                                        }}
                                                        className="text-xs gap-1"
                                                    >
                                                        <span>{prompt.icon}</span>
                                                        {prompt.text}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                            />
                                            <Button
                                                onClick={handleSend}
                                                disabled={!input.trim() || isStreaming}
                                                className="gap-2"
                                            >
                                                {isStreaming ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                                Gönder
                                            </Button>
                                        </div>

                                        {selectedStudent && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 px-1">
                                                <Sparkles className="h-3 w-3" />
                                                Şu anda{' '}
                                                <span className="font-medium text-foreground">
                                                    {studentsData?.find((s: any) => s.id === selectedStudent)?.name || 'Öğrenci'}
                                                </span>{' '}
                                                hakkında konuşuyorsunuz
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>


                </AIToolsLayout>
            </div>
        </TooltipProvider>
    );
}