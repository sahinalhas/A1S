/**
 * AI Parent Communication Modal
 * Generates AI-powered parent communication messages
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Textarea } from "@/components/molecules/EnhancedTextarea";
import { 
  Mail, Send, Loader2, FileText, Calendar, Award, 
  AlertTriangle, Sparkles, Copy, Check
} from 'lucide-react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { toast } from 'sonner';

interface AIParentCommModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
}

type MessageType = 'general' | 'progress_update' | 'meeting_request' | 'achievement' | 'concern';

export default function AIParentCommModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName 
}: AIParentCommModalProps) {
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [specificContent, setSpecificContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const messageTypes = [
    { value: 'general', label: 'Genel Bilgilendirme', icon: Mail, color: 'blue' },
    { value: 'progress_update', label: 'İlerleme Raporu', icon: FileText, color: 'green' },
    { value: 'meeting_request', label: 'Toplantı Daveti', icon: Calendar, color: 'purple' },
    { value: 'achievement', label: 'Başarı Kutlaması', icon: Award, color: 'yellow' },
    { value: 'concern', label: 'Endişe Bildirimi', icon: AlertTriangle, color: 'red' }
  ];

  const generateMessage = async () => {
    if (!studentId) {
      toast.error('Öğrenci seçilmedi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithSchool(`/api/parent-communication/message/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageType, specificContent })
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedMessage(data.data);
        toast.success('Mesaj başarıyla hazırlandı');
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Mesaj oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullMessage = `${generatedMessage.subject}\n\n${generatedMessage.body}`;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    toast.success('Mesaj panoya kopyalandı');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setGeneratedMessage(null);
    setSpecificContent('');
    onClose();
  };

  if (!studentId) return null;

  const selectedType = messageTypes.find(t => t.value === messageType);
  const SelectedIcon = selectedType?.icon || Mail;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white">Veli İletişim Asistanı</DialogTitle>
              <DialogDescription className="text-white/80">
                {studentName} için AI destekli veli mesajı
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="p-6">
            {!generatedMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Message Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Mesaj Tipi</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {messageTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = messageType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setMessageType(type.value as MessageType)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Content */}
                <div className="space-y-2">
                  <Label>Özel İçerik (Opsiyonel)</Label>
                  <Textarea
                    placeholder="Mesajda vurgulamak istediğiniz özel bilgiler..."
                    value={specificContent}
                    onChange={(e) => setSpecificContent(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    AI, öğrenci verilerini ve yazdığınız notları kullanarak profesyonel bir mesaj oluşturacaktır.
                  </p>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateMessage} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Mesaj Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Mesaj Oluştur
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SelectedIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Oluşturulan Mesaj</h3>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                  </Button>
                </div>

                {/* Message Content */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-3 bg-muted/50 border-b">
                    <Label className="text-xs text-muted-foreground">Konu</Label>
                    <p className="font-medium">{generatedMessage.subject}</p>
                  </div>
                  <div className="p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">Mesaj İçeriği</Label>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedMessage.body}
                    </div>
                  </div>
                  {generatedMessage.tone && (
                    <div className="p-3 bg-muted/30 border-t flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Ton:</Label>
                      <span className="text-sm capitalize">{generatedMessage.tone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setGeneratedMessage(null)}>
                    Yeni Mesaj
                  </Button>
                  <Button onClick={handleClose}>
                    Kapat
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
