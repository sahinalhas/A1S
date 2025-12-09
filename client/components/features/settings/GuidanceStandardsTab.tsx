import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Check, X, Download, Upload, RotateCcw, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { useToast } from '@/hooks/utils/toast.utils';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/organisms/AlertDialog';

interface AnaKategori {
  id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

interface DrpHizmetAlani {
  id: number;
  ana_kategori_id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

interface DrpBir {
  id: number;
  drp_hizmet_alani_id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

interface DrpIki {
  id: number;
  drp_bir_id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

interface DrpUc {
  id: number;
  drp_iki_id: number;
  kod: string;
  aciklama: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

interface GuidanceStandardsData {
  ana_kategoriler: AnaKategori[];
  drp_hizmet_alani: DrpHizmetAlani[];
  drp_bir: DrpBir[];
  drp_iki: DrpIki[];
  drp_uc: DrpUc[];
}

// Hook wrapper that safely handles missing context
const useSettingsContext = () => {
  try {
    return null;
  } catch {
    return null;
  }
};

export default function GuidanceStandardsTab() {
  const { toast } = useToast();
  const componentId = useMemo(() => `guidance-standards-${Date.now()}`, []);

  const [standards, setStandards] = useState<GuidanceStandardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingType, setEditingType] = useState<'ad' | 'kod' | 'aciklama' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number; name: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      setLoading(true);
      const response = await fetchWithSchool('/api/guidance-standards');
      const data = await response.json();

      if (data.success) {
        setStandards(data.data);
      } else {
        throw new Error('Veri yüklenemedi');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Rehberlik standartları yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleEditStart = (id: number, type: 'ad' | 'kod' | 'aciklama', value: string) => {
    setEditingId(String(id));
    setEditingType(type);
    setEditingValue(value);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingType) return;

    try {
      let endpoint = '';
      let body: any = {};

      const drpUc = standards?.drp_uc.find(u => String(u.id) === editingId);
      const drpIki = standards?.drp_iki.find(i => String(i.id) === editingId);
      const drpBir = standards?.drp_bir.find(b => String(b.id) === editingId);
      const hizmetAlani = standards?.drp_hizmet_alani.find(h => String(h.id) === editingId);
      const anaKat = standards?.ana_kategoriler.find(a => String(a.id) === editingId);

      if (drpUc && (editingType === 'kod' || editingType === 'aciklama')) {
        endpoint = `/api/guidance-standards/drp-uc/${editingId}`;
        body = { kod: editingType === 'kod' ? editingValue : drpUc.kod, aciklama: editingType === 'aciklama' ? editingValue : drpUc.aciklama };
      } else if (drpIki) {
        endpoint = `/api/guidance-standards/drp-iki/${editingId}`;
        body = { ad: editingValue };
      } else if (drpBir) {
        endpoint = `/api/guidance-standards/drp-bir/${editingId}`;
        body = { ad: editingValue };
      } else if (hizmetAlani) {
        endpoint = `/api/guidance-standards/hizmet-alanlari/${editingId}`;
        body = { ad: editingValue };
      } else if (anaKat) {
        endpoint = `/api/guidance-standards/ana-kategoriler/${editingId}`;
        body = { ad: editingValue };
      }

      if (!endpoint) return;

      const response = await fetchWithSchool(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        await loadStandards();
        setEditingId(null);
        setEditingType(null);
        setEditingValue('');
        toast({
          title: 'Başarılı',
          description: 'Güncelleme başarılı',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Güncelleme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStart = (type: string, id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let endpoint = '';

      switch (itemToDelete.type) {
        case 'ana_kategoriler':
          endpoint = `/api/guidance-standards/ana-kategoriler/${itemToDelete.id}`;
          break;
        case 'drp_hizmet_alani':
          endpoint = `/api/guidance-standards/hizmet-alanlari/${itemToDelete.id}`;
          break;
        case 'drp_bir':
          endpoint = `/api/guidance-standards/drp-bir/${itemToDelete.id}`;
          break;
        case 'drp_iki':
          endpoint = `/api/guidance-standards/drp-iki/${itemToDelete.id}`;
          break;
        case 'drp_uc':
          endpoint = `/api/guidance-standards/drp-uc/${itemToDelete.id}`;
          break;
      }

      if (!endpoint) return;

      const response = await fetchWithSchool(endpoint, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadStandards();
        toast({
          title: 'Başarılı',
          description: 'Silme başarılı',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Silme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetchWithSchool('/api/guidance-standards/export');
      const data = await response.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rehberlik-standartlari.json';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Başarılı',
        description: 'Standartlar dışa aktarıldı',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dışa aktarma sırasında bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetchWithSchool('/api/guidance-standards/reset', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        await loadStandards();
        toast({
          title: 'Başarılı',
          description: 'Standartlar varsayılana sıfırlandı',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Sıfırlama sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setResetDialogOpen(false);
    }
  };

  const renderDrpUc = (drpUc: DrpUc, depth: number) => {
    const nodeId = `drp-uc-${drpUc.id}`;
    return (
      <div key={drpUc.id} style={{ paddingLeft: `${depth * 24}px` }} className="py-2">
        <div className="group flex items-center gap-2 text-sm">
          <div className="w-4 h-4 flex-shrink-0" />
          {editingId === String(drpUc.id) && editingType === 'kod' ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{drpUc.kod}</span>
              <span className="flex-1 text-muted-foreground">{drpUc.aciklama}</span>
              <Button size="sm" variant="ghost" onClick={() => handleEditStart(drpUc.id, 'kod', drpUc.kod)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDeleteStart('drp_uc', drpUc.id, drpUc.aciklama)} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDrpIki = (drpIki: DrpIki, depth: number) => {
    const nodeId = `drp-iki-${drpIki.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const drpUcItems = standards?.drp_uc.filter(u => u.drp_iki_id === drpIki.id) || [];

    return (
      <div key={drpIki.id} style={{ paddingLeft: `${depth * 24}px` }} className="py-1">
        <div
          className="group flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50"
          onClick={() => toggleNode(nodeId)}
        >
          {drpUcItems.length > 0 ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
          {editingId === String(drpIki.id) ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium">{drpIki.ad}</span>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditStart(drpIki.id, 'ad', drpIki.ad); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        {isExpanded && drpUcItems.length > 0 && (
          <div className="border-l border-muted ml-2">
            {drpUcItems.map(u => renderDrpUc(u, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDrpBir = (drpBir: DrpBir, depth: number) => {
    const nodeId = `drp-bir-${drpBir.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const drpIkiItems = standards?.drp_iki.filter(i => i.drp_bir_id === drpBir.id) || [];

    return (
      <div key={drpBir.id} style={{ paddingLeft: `${depth * 24}px` }} className="py-1">
        <div
          className="group flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50"
          onClick={() => toggleNode(nodeId)}
        >
          {drpIkiItems.length > 0 ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
          {editingId === String(drpBir.id) ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-semibold text-blue-600">{drpBir.ad}</span>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditStart(drpBir.id, 'ad', drpBir.ad); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        {isExpanded && drpIkiItems.length > 0 && (
          <div className="border-l border-muted ml-2">
            {drpIkiItems.map(i => renderDrpIki(i, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderHizmetAlani = (hizmetAlani: DrpHizmetAlani, depth: number) => {
    const nodeId = `hizmet-alani-${hizmetAlani.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const drpBirItems = standards?.drp_bir.filter(b => b.drp_hizmet_alani_id === hizmetAlani.id) || [];

    return (
      <div key={hizmetAlani.id} style={{ paddingLeft: `${depth * 24}px` }} className="py-1">
        <div
          className="group flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50"
          onClick={() => toggleNode(nodeId)}
        >
          {drpBirItems.length > 0 ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
          {editingId === String(hizmetAlani.id) ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-semibold text-green-600">{hizmetAlani.ad}</span>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditStart(hizmetAlani.id, 'ad', hizmetAlani.ad); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        {isExpanded && drpBirItems.length > 0 && (
          <div className="border-l border-muted ml-2">
            {drpBirItems.map(b => renderDrpBir(b, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderAnaKategori = (anaKategori: AnaKategori) => {
    const nodeId = `ana-kategori-${anaKategori.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hizmetAlaniItems = standards?.drp_hizmet_alani.filter(h => h.ana_kategori_id === anaKategori.id) || [];

    return (
      <div key={anaKategori.id} className="py-1">
        <div
          className="group flex items-center gap-2 py-2 px-3 rounded cursor-pointer hover:bg-muted/50"
          onClick={() => toggleNode(nodeId)}
        >
          {hizmetAlaniItems.length > 0 ? (
            isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
          ) : (
            <div className="w-5 h-5" />
          )}
          {editingId === String(anaKategori.id) ? (
            <>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 font-bold text-base text-purple-700">{anaKategori.ad}</span>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditStart(anaKategori.id, 'ad', anaKategori.ad); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        {isExpanded && hizmetAlaniItems.length > 0 && (
          <div className="border-l border-muted ml-3 pl-3">
            {hizmetAlaniItems.map(h => renderHizmetAlani(h, 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!standards) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Veri yüklenemedi
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Rehberlik Standartları (MEB Hiyerarşi)
              </CardTitle>
              <CardDescription>
                5 seviyeli rehberlik standartları yapısı: Ana Kategoriler → Hizmet Alanları → DRP-1 → DRP-2 → DRP-3
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Dışa Aktar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)}>
                <RotateCcw className="h-4 w-4" />
                Sıfırla
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {standards.ana_kategoriler.map((ak) => renderAnaKategori(ak))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{itemToDelete?.name}" silinecektir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Varsayılana Sıfırla</AlertDialogTitle>
            <AlertDialogDescription>
              Tüm özelleştirmeler silinecek ve standartlar MEB varsayılan değerlerine geri dönecektir. Emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Sıfırla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
