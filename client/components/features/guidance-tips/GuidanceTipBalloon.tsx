import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Lightbulb, Star, ChevronRight, RefreshCw, BookOpen, Users, Heart, Briefcase, 
  AlertTriangle, Brain, Scale, Wrench, Settings, User, Shield, ShieldAlert, UserX,
  HeartHandshake, Home, HeartPulse, Gamepad2, ClipboardCheck, UsersRound, School,
  FileWarning, Trophy, Clock, MessageCircle, Puzzle, CheckCircle, Gem, Smartphone,
  Layers, Cpu, Sparkles, Circle, Compass, Target, Network, BookText, UserCircle,
  Focus, HelpCircle, FileText, AlertCircle, Search, MessageSquare, Flag, Handshake,
  ClipboardList, FileEdit, ChevronDown, ChevronUp, Package
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Switch } from '@/components/atoms/Switch';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Badge } from '@/components/atoms/Badge';
import { Progress } from '@/components/atoms/Progress';
import { cn } from '@/lib/utils';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

interface GuidanceTip {
  id: string;
  category: string;
  title: string;
  content: string;
  importance: 'DUSUK' | 'NORMAL' | 'YUKSEK' | 'KRITIK';
}

interface BatchResponse {
  tips: GuidanceTip[];
  totalCount: number;
  remainingInQueue: number;
  batchId: string;
  generatedAt: string;
}

interface CategoryInfo {
  value: string;
  label: string;
  description: string;
  icon: string;
  group: string;
}

interface CategoryGroup {
  id: string;
  label: string;
  description: string;
}

const ICON_MAP: Record<string, typeof Lightbulb> = {
  Brain, Briefcase, Users, Heart, AlertTriangle, Star, BookOpen, Scale, Wrench, Lightbulb,
  User, Shield, ShieldAlert, UserX, HeartHandshake, Home, HeartPulse, Gamepad2, ClipboardCheck,
  UsersRound, School, FileWarning, Trophy, Clock, MessageCircle, Puzzle, CheckCircle, Gem,
  Smartphone, Layers, Cpu, Sparkles, Circle, Compass, Target, Network, BookText, UserCircle,
  Focus, HelpCircle, FileText, AlertCircle, Search, MessageSquare, Flag, Handshake, ClipboardList,
  FileEdit, Accessibility: User, BookX: BookOpen, Ear: MessageCircle, Mirror: RefreshCw
};

const GROUP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  temel: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  psikoloji: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  egitim: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  gelisim: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  beceri: { bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  kuramlar: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  danismanlik: { bg: 'bg-pink-50 dark:bg-pink-950', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  etik: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
};

const IMPORTANCE_STYLES: Record<string, string> = {
  'DUSUK': 'border-gray-200',
  'NORMAL': 'border-blue-200',
  'YUKSEK': 'border-orange-300 shadow-orange-100',
  'KRITIK': 'border-red-300 shadow-red-100 animate-pulse',
};

const STORAGE_KEY = 'guidance_tips_queue';
const LOW_QUEUE_THRESHOLD = 3;

interface StoredQueue {
  tips: GuidanceTip[];
  currentIndex: number;
  viewedTipIds: string[];
  batchId: string;
  fetchedAt: string;
}

interface GuidanceTipBalloonProps {
  autoShow?: boolean;
  showInterval?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'header-right';
  onDismiss?: () => void;
}

export default function GuidanceTipBalloon({ 
  autoShow = true, 
  showInterval = 30 * 60 * 1000,
  position = 'bottom-right',
  onDismiss
}: GuidanceTipBalloonProps) {
  const [tipQueue, setTipQueue] = useState<GuidanceTip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedTipIds, setViewedTipIds] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [enabledCategories, setEnabledCategories] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [totalTipsViewed, setTotalTipsViewed] = useState(0);
  const fetchingRef = useRef(false);

  const tip = tipQueue[currentIndex] || null;
  const remainingTips = tipQueue.length - currentIndex;

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredQueue = JSON.parse(stored);
        if (data.tips && data.tips.length > 0) {
          setTipQueue(data.tips);
          setCurrentIndex(data.currentIndex || 0);
          setViewedTipIds(data.viewedTipIds || []);
          setTotalTipsViewed(data.viewedTipIds?.length || 0);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load tips from storage:', error);
    }
    return false;
  }, []);

  const saveToStorage = useCallback((tips: GuidanceTip[], index: number, viewed: string[], batchId: string = '') => {
    try {
      const data: StoredQueue = {
        tips,
        currentIndex: index,
        viewedTipIds: viewed,
        batchId,
        fetchedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('tipQueueUpdated'));
    } catch (error) {
      console.error('Failed to save tips to storage:', error);
    }
  }, []);

  const fetchBatch = useCallback(async (forceNew: boolean = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetchingBatch(true);
    
    try {
      const url = forceNew ? '/api/guidance-tips/batch?forceNew=true' : '/api/guidance-tips/batch';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        const batchData: BatchResponse = data.data;
        
        if (batchData.tips.length > 0) {
          const newViewed: string[] = [];
          setTipQueue(batchData.tips);
          setCurrentIndex(0);
          setViewedTipIds(newViewed);
          saveToStorage(batchData.tips, 0, newViewed, batchData.batchId);
          
          if (!isVisible) {
            setIsVisible(true);
            setIsExpanded(false);
            setRating(0);
          }
          
          console.log(`Fetched new batch: ${batchData.tips.length} tips`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch batch tips:', error);
    } finally {
      setIsFetchingBatch(false);
      fetchingRef.current = false;
    }
  }, [isVisible, saveToStorage]);

  const showNextTip = useCallback(async () => {
    if (isLoading) return;
    
    const currentTip = tipQueue[currentIndex];
    if (currentTip && !viewedTipIds.includes(currentTip.id)) {
      const newViewed = [...viewedTipIds, currentTip.id];
      setViewedTipIds(newViewed);
      setTotalTipsViewed(prev => prev + 1);
      
      try {
        await fetch(`/api/guidance-tips/dismiss/${currentTip.id}`, { method: 'POST' });
      } catch (error) {
        console.error('Failed to mark tip as viewed:', error);
      }
    }
    
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < tipQueue.length) {
      setCurrentIndex(nextIndex);
      setIsExpanded(false);
      setRating(0);
      saveToStorage(tipQueue, nextIndex, viewedTipIds, '');
      
      const newRemaining = tipQueue.length - nextIndex;
      if (newRemaining <= LOW_QUEUE_THRESHOLD && !fetchingRef.current) {
        console.log(`Low queue (${newRemaining} remaining), fetching new batch...`);
        fetchBatch(true);
      }
    } else {
      console.log('Queue exhausted, fetching new batch...');
      setIsLoading(true);
      await fetchBatch(true);
      setIsLoading(false);
    }
  }, [currentIndex, tipQueue, viewedTipIds, isLoading, saveToStorage, fetchBatch]);

  const dismissTip = useCallback(async () => {
    if (!tip) return;
    
    if (!viewedTipIds.includes(tip.id)) {
      const newViewed = [...viewedTipIds, tip.id];
      setViewedTipIds(newViewed);
      setTotalTipsViewed(prev => prev + 1);
      
      try {
        await fetch(`/api/guidance-tips/dismiss/${tip.id}`, { method: 'POST' });
      } catch (error) {
        console.error('Failed to dismiss tip:', error);
      }
    }
    
    setIsVisible(false);
    setShowSettings(false);
    onDismiss?.();
  }, [tip, viewedTipIds, onDismiss]);

  const rateTip = useCallback(async (value: number) => {
    if (!tip) return;
    setRating(value);
    
    try {
      await fetch(`/api/guidance-tips/rate/${tip.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value })
      });
    } catch (error) {
      console.error('Failed to rate tip:', error);
    }
  }, [tip]);

  const savePreferences = useCallback(async (newCategories: string[]) => {
    setIsSaving(true);
    try {
      await fetchWithSchool('/api/guidance-tips/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledCategories: newCategories })
      });
      localStorage.removeItem(STORAGE_KEY);
      setTipQueue([]);
      setCurrentIndex(0);
      setViewedTipIds([]);
      await fetchBatch(true);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  }, [fetchBatch]);

  const toggleCategory = (categoryValue: string) => {
    const newCategories = enabledCategories.includes(categoryValue)
      ? enabledCategories.filter(c => c !== categoryValue)
      : [...enabledCategories, categoryValue];
    
    if (newCategories.length === 0) return;
    
    setEnabledCategories(newCategories);
    savePreferences(newCategories);
  };

  const toggleGroupCategories = (groupId: string, enable: boolean) => {
    const groupCategories = categories.filter(c => c.group === groupId).map(c => c.value);
    let newCategories: string[];
    
    if (enable) {
      newCategories = [...new Set([...enabledCategories, ...groupCategories])];
    } else {
      newCategories = enabledCategories.filter(c => !groupCategories.includes(c));
      if (newCategories.length === 0) {
        newCategories = [categories[0].value];
      }
    }
    
    setEnabledCategories(newCategories);
    savePreferences(newCategories);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const isGroupEnabled = (groupId: string) => {
    const groupCategories = categories.filter(c => c.group === groupId);
    return groupCategories.every(c => enabledCategories.includes(c.value));
  };

  const isGroupPartiallyEnabled = (groupId: string) => {
    const groupCategories = categories.filter(c => c.group === groupId);
    const enabledCount = groupCategories.filter(c => enabledCategories.includes(c.value)).length;
    return enabledCount > 0 && enabledCount < groupCategories.length;
  };

  useEffect(() => {
    fetch('/api/guidance-tips/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.data);
          setGroups(data.groups || []);
        }
      })
      .catch(console.error);

    fetch('/api/guidance-tips/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.enabledCategories) {
          setEnabledCategories(data.data.enabledCategories);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const hasStoredData = loadFromStorage();
    
    if (!hasStoredData) {
      const timer = setTimeout(() => {
        fetchBatch();
      }, autoShow ? 3000 : 0);
      return () => clearTimeout(timer);
    } else {
      if (!autoShow) {
        setIsVisible(true);
      } else {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [loadFromStorage, fetchBatch, autoShow]);

  useEffect(() => {
    if (!autoShow) return;

    const interval = setInterval(() => {
      if (!isVisible && tipQueue.length > currentIndex) {
        setIsVisible(true);
        setIsExpanded(false);
        setRating(0);
      }
    }, showInterval);

    return () => clearInterval(interval);
  }, [autoShow, showInterval, isVisible, tipQueue.length, currentIndex]);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-6',
    'bottom-left': 'bottom-20 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6',
    'header-right': 'top-10 right-2 md:right-5',
  };

  const getCategoryConfig = (category: string) => {
    const categoryInfo = categories.find(c => c.value === category);
    const iconName = categoryInfo?.icon || 'Lightbulb';
    const Icon = ICON_MAP[iconName] || Lightbulb;
    const groupColors = GROUP_COLORS[categoryInfo?.group || 'temel'] || GROUP_COLORS.temel;
    return { Icon, groupColors, categoryInfo };
  };

  const { Icon: CategoryIcon, groupColors, categoryInfo } = tip ? getCategoryConfig(tip.category) : { Icon: Lightbulb, groupColors: GROUP_COLORS.temel, categoryInfo: null };

  const progressPercentage = tipQueue.length > 0 ? ((currentIndex) / tipQueue.length) * 100 : 0;

  return (
    <>
      <AnimatePresence>
        {isVisible && tip && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50',
              positionClasses[position],
              'max-w-lg w-full'
            )}
          >
            <div className={cn(
              'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2',
              IMPORTANCE_STYLES[tip.importance],
              'overflow-hidden'
            )}>
              <div className={cn(
                'flex items-center gap-3 p-4',
                groupColors.bg
              )}>
                <div className={cn(
                  'p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 flex-shrink-0',
                  groupColors.text
                )}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn('text-[11px] font-medium', groupColors.text)}>
                      {categoryInfo?.label || tip.category}
                    </p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-white/60 dark:bg-gray-800/60">
                      <Package className="h-2.5 w-2.5 mr-1" />
                      {remainingTips} kaldı
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                    {tip.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full",
                      showSettings && "bg-white/50 dark:bg-gray-800/50"
                    )}
                  >
                    <Settings className={cn("h-4 w-4 transition-transform", showSettings && "rotate-90")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissTip}
                    className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {tipQueue.length > 1 && (
                <div className="px-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Progress value={progressPercentage} className="h-1 flex-1" />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {currentIndex + 1}/{tipQueue.length}
                    </span>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {showSettings ? (
                  <motion.div
                    key="settings"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Bilgi Kategorileri</h4>
                        <span className="text-[11px] text-muted-foreground">
                          {enabledCategories.length}/{categories.length} aktif
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-4">
                        Hangi alanlardan bilgi almak istediğinizi seçin
                      </p>
                      
                      <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-2">
                          {groups.map(group => {
                            const groupCats = categories.filter(c => c.group === group.id);
                            const isExpandedGroup = expandedGroups.includes(group.id);
                            const groupColor = GROUP_COLORS[group.id] || GROUP_COLORS.temel;
                            const allEnabled = isGroupEnabled(group.id);
                            const partialEnabled = isGroupPartiallyEnabled(group.id);
                            
                            return (
                              <div key={group.id} className={cn("rounded-lg border", groupColor.border)}>
                                <div 
                                  className={cn(
                                    "flex items-center justify-between p-3 cursor-pointer",
                                    groupColor.bg
                                  )}
                                  onClick={() => toggleGroup(group.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    {isExpandedGroup ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <div>
                                      <span className={cn("font-medium text-sm", groupColor.text)}>{group.label}</span>
                                      <span className="text-xs text-muted-foreground ml-2">({groupCats.length})</span>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={allEnabled}
                                    onCheckedChange={(checked) => {
                                      toggleGroupCategories(group.id, checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(partialEnabled && !allEnabled && "data-[state=unchecked]:bg-gray-400")}
                                  />
                                </div>
                                
                                {isExpandedGroup && (
                                  <div className="p-2 space-y-1 bg-white/50 dark:bg-gray-900/50">
                                    {groupCats.map(cat => {
                                      const CatIcon = ICON_MAP[cat.icon] || Lightbulb;
                                      return (
                                        <div 
                                          key={cat.value}
                                          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                          <div className="flex items-center gap-2">
                                            <CatIcon className={cn("h-4 w-4", groupColor.text)} />
                                            <div>
                                              <span className="text-sm">{cat.label}</span>
                                              <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                                            </div>
                                          </div>
                                          <Switch
                                            checked={enabledCategories.includes(cat.value)}
                                            onCheckedChange={() => toggleCategory(cat.value)}
                                            disabled={enabledCategories.length === 1 && enabledCategories.includes(cat.value)}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      
                      {isSaving && (
                        <div className="mt-3 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Tercihler kaydediliyor ve yeni paket yükleniyor...
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : isExpanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2 max-h-96 overflow-y-auto">
                        {tip.content.split('\n').map((line, idx) => {
                          const numMatch = line.match(/^(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*)/);
                          const boldMatch = line.match(/^\*\*(.*?)\*\*:\s*(.*)/);
                          const normalLine = line.trim();
                          
                          if (numMatch) {
                            const [, num, title, desc] = numMatch;
                            return (
                              <div key={idx} className="pl-3 border-l-2 border-blue-300 dark:border-blue-700">
                                <p className="font-semibold text-gray-900 dark:text-white">{num}. {title}</p>
                                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 mt-1">{desc}</p>
                              </div>
                            );
                          } else if (boldMatch && normalLine.startsWith('**')) {
                            return (
                              <div key={idx} className="font-semibold text-gray-900 dark:text-white">
                                {boldMatch[1]}
                              </div>
                            );
                          } else if (normalLine.length > 0) {
                            return (
                              <p key={idx} className="leading-relaxed text-gray-600 dark:text-gray-300">
                                {normalLine}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 mr-2">Değerlendir:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => rateTip(star)}
                              className={cn(
                                'p-1 transition-colors',
                                rating >= star ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                              )}
                            >
                              <Star className={cn('h-4 w-4', rating >= star && 'fill-current')} />
                            </button>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isLoading || isFetchingBatch}
                          onClick={showNextTip}
                          className="text-xs gap-1"
                        >
                          <RefreshCw className={cn("h-3 w-3", (isLoading || isFetchingBatch) && "animate-spin")} />
                          {isLoading || isFetchingBatch ? 'Yükleniyor...' : `Sonraki (${remainingTips - 1})`}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                      {tip.content.split('\n')[0]}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(true)}
                      className="mt-2 text-xs gap-1 text-primary hover:text-primary"
                    >
                      Devamını Oku
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {isFetchingBatch && !isLoading && (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Yeni bilgi paketi hazırlanıyor...
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
