/**
 * AI Settings Tab - Modern & Compact
 * Zarif, kullanıcı dostu AI yapılandırma arayüzü
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSettingsTabDirty } from '@/pages/Settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Switch } from '@/components/atoms/Switch';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { 
  Brain, 
  CheckCircle, 
  Loader2, 
  Server, 
  Info, 
  Zap, 
  Settings2, 
  Sparkles,
  AlertCircle,
  ChevronDown,
  Rocket,
  Activity,
  Gauge
} from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { toast } from 'sonner';
import { Separator } from '@/components/atoms/Separator';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/organisms/Collapsible/collapsible';
import { AI_PROVIDERS, AI_FEATURES, type AIProviderType, type AIModel } from '@/constants/ai-providers';

const SPEED_ICONS = {
  fast: Rocket,
  balanced: Activity,
  powerful: Gauge
};

const SPEED_LABELS = {
  fast: 'Hızlı',
  balanced: 'Dengeli',
  powerful: 'Güçlü'
};

const SPEED_COLORS = {
  fast: 'text-green-600 bg-green-50 dark:bg-green-950/30',
  balanced: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  powerful: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30'
};

export default function AISettingsTab() {
  const settingsContext = useSettingsTabDirty();
  const componentId = useMemo(() => `ai-settings-${Date.now()}`, []);
  const saveSettingsRef = useRef<() => Promise<void>>();

  const [aiEnabled, setAiEnabled] = useState(true);
  const [provider, setProvider] = useState<AIProviderType>('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [savedProvider, setSavedProvider] = useState<AIProviderType>('gemini');
  const [savedModel, setSavedModel] = useState('gemini-2.5-flash');
  const [savedAiEnabled, setSavedAiEnabled] = useState(true);
  const [savedOllamaUrl, setSavedOllamaUrl] = useState('http://localhost:11434');

  const hasUnsavedChanges = 
    provider !== savedProvider || 
    model !== savedModel || 
    aiEnabled !== savedAiEnabled ||
    (provider === 'ollama' && ollamaUrl !== savedOllamaUrl);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    updateAvailableModels();
  }, [provider]);

  const loadSettings = async () => {
    try {
      const response = await fetchWithSchool('/api/ai-assistant/models');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const loadedProvider = data.data.provider || 'gemini';
          const loadedModel = data.data.currentModel || 'gemini-2.5-flash';
          
          setProvider(loadedProvider);
          setModel(loadedModel);
          setSavedProvider(loadedProvider);
          setSavedModel(loadedModel);
          
          if (data.data.ollamaBaseUrl) {
            setOllamaUrl(data.data.ollamaBaseUrl);
            setSavedOllamaUrl(data.data.ollamaBaseUrl);
          }

          if (data.data.availableModels?.length > 0) {
            setAvailableModels(data.data.availableModels);
          }
        }
      }

      const settingsResponse = await fetchWithSchool('/api/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.success && settingsData.data?.aiEnabled !== undefined) {
          setAiEnabled(settingsData.data.aiEnabled);
          setSavedAiEnabled(settingsData.data.aiEnabled);
        }
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      toast.error('AI ayarları yüklenemedi');
    }
  };

  const updateAvailableModels = async () => {
    const providerInfo = AI_PROVIDERS[provider];
    
    if (providerInfo.models.length > 0) {
      const modelValues = providerInfo.models.map(m => m.value);
      setAvailableModels(modelValues);
      if (!modelValues.includes(model)) {
        setModel(modelValues[0]);
      }
    } else if (provider === 'ollama') {
      setAvailableModels([]);
      setConnectionStatus('idle');
      
      setIsLoadingModels(true);
      try {
        const response = await fetch(`${ollamaUrl}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          if (data.models && data.models.length > 0) {
            const modelNames = data.models.map((m: any) => m.name);
            setAvailableModels(modelNames);
            
            if (model && modelNames.includes(model)) {
              
            } else if (savedModel && modelNames.includes(savedModel)) {
              setModel(savedModel);
            } else if (modelNames.length > 0) {
              setModel(modelNames[0]);
            }
            setConnectionStatus('success');
          }
        }
      } catch (error) {
        setConnectionStatus('idle');
      } finally {
        setIsLoadingModels(false);
      }
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      if (provider === 'ollama') {
        // Ollama için eski logic
        const response = await fetch(`${ollamaUrl}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          if (data.models && data.models.length > 0) {
            const modelNames = data.models.map((m: any) => m.name);
            setAvailableModels(modelNames);
            setConnectionStatus('success');
            toast.success(`Ollama bağlantısı başarılı! ${modelNames.length} model bulundu.`);
            
            if (model && modelNames.includes(model)) {
              
            } else if (savedModel && modelNames.includes(savedModel)) {
              setModel(savedModel);
            } else if (modelNames.length > 0) {
              setModel(modelNames[0]);
            }
          }
        } else {
          throw new Error('Ollama sunucusu erişilemiyor');
        }
      } else {
        // Gemini ve OpenAI için yeni validate endpoint
        const response = await fetchWithSchool('/api/ai-assistant/validate-provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, model })
        });

        const data = await response.json();

        if (data.success && data.available) {
          setConnectionStatus('success');
          toast.success(`${AI_PROVIDERS[provider].name} bağlantısı başarılı!`);
        } else {
          setConnectionStatus('error');
          const errorMsg = data.error || `${AI_PROVIDERS[provider].name} yapılandırılmamış`;
          toast.error(errorMsg);
          console.warn(`Provider ${provider} validation hint:`, data.hint);
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      const errorText = error instanceof Error ? error.message : 'Servis erişilemiyor';
      toast.error(`Bağlantı hatası: ${errorText}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    try {
      const enabledResponse = await fetch('/api/settings/ai-enabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: aiEnabled })
      });

      if (!enabledResponse.ok) {
        throw new Error('AI durum ayarı kaydedilemedi');
      }

      const providerSettings = {
        provider,
        model,
        ...(provider === 'ollama' && { ollamaBaseUrl: ollamaUrl })
      };

      const providerResponse = await fetchWithSchool('/api/ai-assistant/set-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerSettings)
      });

      if (!providerResponse.ok) {
        throw new Error('Provider ayarları kaydedilemedi');
      }

      setSavedProvider(provider);
      setSavedModel(model);
      setSavedAiEnabled(aiEnabled);
      if (provider === 'ollama') {
        setSavedOllamaUrl(ollamaUrl);
      }

      setConnectionStatus('idle');
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  useEffect(() => {
    saveSettingsRef.current = saveSettings;
  }, [aiEnabled, provider, model, ollamaUrl]);

  useEffect(() => {
    if (!settingsContext?.registerTabSubmit) return;
    
    settingsContext.registerTabSubmit(componentId, async () => {
      if (hasUnsavedChanges && saveSettingsRef.current) {
        await saveSettingsRef.current();
      }
    });

    return () => {
      if (settingsContext?.unregisterTabSubmit) {
        settingsContext.unregisterTabSubmit(componentId);
      }
    };
  }, [componentId, settingsContext]);

  const ProviderIcon = AI_PROVIDERS[provider].icon;
  const currentModelInfo = AI_PROVIDERS[provider].models.find(m => m.value === model);

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-gradient-to-r from-background to-accent/20">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${aiEnabled ? 'from-blue-500 to-indigo-500' : 'from-gray-400 to-gray-500'} text-white shadow-lg`}>
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">AI Yapılandırması</h2>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="border-orange-500 text-orange-600 animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Kaydedilmedi
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {aiEnabled ? (
                <>
                  Aktif: <span className="font-medium text-foreground">{AI_PROVIDERS[savedProvider].name}</span>
                  {savedModel && <span className="text-xs"> • {AI_PROVIDERS[savedProvider].models.find(m => m.value === savedModel)?.name || savedModel}</span>}
                </>
              ) : (
                'AI özellikleri şu anda kapalı'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="ai-toggle" className="text-sm font-medium">
            {aiEnabled ? 'Aktif' : 'Kapalı'}
          </Label>
          <Switch
            id="ai-toggle"
            checked={aiEnabled}
            onCheckedChange={setAiEnabled}
            className="data-[state=checked]:bg-green-500"
          />
          {hasUnsavedChanges && (
            <Button
              onClick={async () => {
                setIsSaving(true);
                try {
                  await saveSettings();
                  toast.success('AI ayarları kaydedildi');
                } catch (error) {
                  toast.error('Ayarlar kaydedilemedi');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Kaydediliyor
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Kaydet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {aiEnabled && (
        <>
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Provider Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(AI_PROVIDERS) as AIProviderType[]).map((key) => {
                  const info = AI_PROVIDERS[key];
                  const Icon = info.icon;
                  const isSelected = provider === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setProvider(key)}
                      className={`relative p-3 rounded-lg border-2 transition-all text-left group hover:shadow-md ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className={`p-1.5 rounded-md bg-gradient-to-br ${info.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{info.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{info.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {provider === 'ollama' && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="ollama-url" className="flex items-center gap-2 text-sm">
                    <Server className="h-3.5 w-3.5" />
                    Ollama Sunucu Adresi
                  </Label>
                  <Input
                    id="ollama-url"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Ollama servisinin çalıştığı adres. Kurulu değilse{' '}
                      <a 
                        href="https://ollama.com/download" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        buradan indirebilirsiniz
                      </a>
                    </span>
                  </p>
                </div>
              )}

              {provider === 'gemini' && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-xs">
                    <strong>Ücretsiz:</strong> Gemini API key'inizi{' '}
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-green-600 dark:text-green-400 font-medium underline"
                    >
                      Google AI Studio
                    </a>
                    {' '}üzerinden alabilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              {provider === 'openai' && (
                <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                  <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-xs">
                    <strong>Ücretli:</strong> OpenAI API key'inizi{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-orange-600 dark:text-orange-400 font-medium underline"
                    >
                      OpenAI Platform
                    </a>
                    {' '}üzerinden alabilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection}
                  variant="outline"
                  size="sm"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Kontrol ediliyor...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-3.5 w-3.5" />
                      Bağlantıyı Test Et
                    </>
                  )}
                </Button>

                {connectionStatus === 'success' && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Bağlantı Başarılı
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Model Seçimi
                </CardTitle>
                {availableModels.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {availableModels.length} model
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingModels ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Modeller yükleniyor...
                </div>
              ) : availableModels.length > 0 ? (
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-auto py-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((m) => {
                      const modelInfo = AI_PROVIDERS[provider].models.find(model => model.value === m);
                      const SpeedIcon = modelInfo?.speed ? SPEED_ICONS[modelInfo.speed] : null;
                      
                      return (
                        <SelectItem key={m} value={m} className="py-2.5">
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{modelInfo?.name || m}</span>
                                {modelInfo?.recommended && (
                                  <Badge variant="default" className="text-xs px-1.5 py-0 h-4">
                                    Önerilen
                                  </Badge>
                                )}
                              </div>
                              {modelInfo?.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{modelInfo.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {modelInfo?.contextWindow && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                  {modelInfo.contextWindow}
                                </Badge>
                              )}
                              {SpeedIcon && modelInfo?.speed && (
                                <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${SPEED_COLORS[modelInfo.speed]}`}>
                                  <SpeedIcon className="h-3 w-3 mr-1" />
                                  {SPEED_LABELS[modelInfo.speed]}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {provider === 'ollama' 
                      ? 'Model bulunamadı. Ollama sunucunuzun çalıştığından emin olun ve "Bağlantıyı Test Et" butonuna tıklayın.'
                      : 'Model listesi yüklenemedi. Lütfen bağlantıyı test edin.'}
                  </AlertDescription>
                </Alert>
              )}

              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <Settings2 className="h-3.5 w-3.5" />
                      Gelişmiş Ayarlar
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-xs">
                      Gelişmiş parametreler yakında eklenecek (Temperature, Max Tokens, System Prompt)
                    </AlertDescription>
                  </Alert>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-background to-accent/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Aktif Özellikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {AI_FEATURES.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 p-2 border rounded-md hover:bg-accent/30 transition-colors"
                  >
                    <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{feature.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </>
      )}

      {!aiEnabled && (
        <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription>
            <p className="font-semibold text-sm mb-1">AI Özellikleri Kapalı</p>
            <p className="text-xs text-muted-foreground">
              AI özellikleri şu anda devre dışı. Aktif etmek için yukarıdaki anahtarı açın ve kaydedin.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
