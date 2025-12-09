import { Router, type Request, type Response } from 'express';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import * as guidanceStandardsService from '../services/guidance-standards.service.js';

const router = Router();
router.use(validateSchoolAccess);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const standards = guidanceStandardsService.getAllStandards();
    res.json({
      success: true,
      data: { standards }
    });
  } catch (error) {
    console.error('Error fetching guidance standards:', error);
    res.status(500).json({
      success: false,
      error: 'Rehberlik standartları yüklenemedi'
    });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = guidanceStandardsService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler yüklenemedi'
    });
  }
});

router.get('/ana-kategoriler', async (_req: Request, res: Response) => {
  try {
    const data = guidanceStandardsService.getAnaKategoriler();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Veri yüklenemedi' });
  }
});

router.get('/hizmet-alanlari', async (req: Request, res: Response) => {
  try {
    const anaKategoriId = req.query.ana_kategori_id ? parseInt(req.query.ana_kategori_id as string) : undefined;
    const data = guidanceStandardsService.getHizmetAlanlari(anaKategoriId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Veri yüklenemedi' });
  }
});

router.get('/drp-bir', async (req: Request, res: Response) => {
  try {
    const hizmetAlaniId = req.query.hizmet_alani_id ? parseInt(req.query.hizmet_alani_id as string) : undefined;
    const data = guidanceStandardsService.getDrpBirler(hizmetAlaniId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Veri yüklenemedi' });
  }
});

router.get('/drp-iki', async (req: Request, res: Response) => {
  try {
    const drpBirId = req.query.drp_bir_id ? parseInt(req.query.drp_bir_id as string) : undefined;
    const data = guidanceStandardsService.getDrpIkiler(drpBirId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Veri yüklenemedi' });
  }
});

router.get('/drp-uc', async (req: Request, res: Response) => {
  try {
    const drpIkiId = req.query.drp_iki_id ? parseInt(req.query.drp_iki_id as string) : undefined;
    const data = guidanceStandardsService.getDrpUcler(drpIkiId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Veri yüklenemedi' });
  }
});

router.get('/hierarchy/:anaKategoriId', async (req: Request, res: Response) => {
  try {
    const anaKategoriId = parseInt(req.params.anaKategoriId);
    const data = guidanceStandardsService.getHierarchyByAnaKategori(anaKategoriId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Veri yüklenemedi' });
  }
});

router.post('/ana-kategoriler', async (req: Request, res: Response) => {
  try {
    const { ad } = req.body;
    if (!ad) {
      return res.status(400).json({ success: false, error: 'Ad gereklidir' });
    }
    const data = guidanceStandardsService.createAnaKategori(ad);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Kayıt oluşturulamadı' });
  }
});

router.post('/hizmet-alanlari', async (req: Request, res: Response) => {
  try {
    const { ana_kategori_id, ad } = req.body;
    if (!ana_kategori_id || !ad) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar gereklidir' });
    }
    const data = guidanceStandardsService.createHizmetAlani(ana_kategori_id, ad);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Kayıt oluşturulamadı' });
  }
});

router.post('/drp-bir', async (req: Request, res: Response) => {
  try {
    const { drp_hizmet_alani_id, ad } = req.body;
    if (!drp_hizmet_alani_id || !ad) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar gereklidir' });
    }
    const data = guidanceStandardsService.createDrpBir(drp_hizmet_alani_id, ad);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Kayıt oluşturulamadı' });
  }
});

router.post('/drp-iki', async (req: Request, res: Response) => {
  try {
    const { drp_bir_id, ad } = req.body;
    if (!drp_bir_id || !ad) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar gereklidir' });
    }
    const data = guidanceStandardsService.createDrpIki(drp_bir_id, ad);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Kayıt oluşturulamadı' });
  }
});

router.post('/drp-uc', async (req: Request, res: Response) => {
  try {
    const { drp_iki_id, kod, aciklama } = req.body;
    if (!drp_iki_id || !aciklama) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar gereklidir' });
    }
    const data = guidanceStandardsService.createDrpUc(drp_iki_id, kod || '', aciklama);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Kayıt oluşturulamadı' });
  }
});

router.put('/ana-kategoriler/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { ad } = req.body;
    if (!ad) {
      return res.status(400).json({ success: false, error: 'Ad gereklidir' });
    }
    guidanceStandardsService.updateAnaKategori(id, ad);
    res.json({ success: true, message: 'Güncellendi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Güncellenemedi' });
  }
});

router.put('/hizmet-alanlari/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { ad } = req.body;
    if (!ad) {
      return res.status(400).json({ success: false, error: 'Ad gereklidir' });
    }
    guidanceStandardsService.updateHizmetAlani(id, ad);
    res.json({ success: true, message: 'Güncellendi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Güncellenemedi' });
  }
});

router.put('/drp-bir/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { ad } = req.body;
    if (!ad) {
      return res.status(400).json({ success: false, error: 'Ad gereklidir' });
    }
    guidanceStandardsService.updateDrpBir(id, ad);
    res.json({ success: true, message: 'Güncellendi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Güncellenemedi' });
  }
});

router.put('/drp-iki/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { ad } = req.body;
    if (!ad) {
      return res.status(400).json({ success: false, error: 'Ad gereklidir' });
    }
    guidanceStandardsService.updateDrpIki(id, ad);
    res.json({ success: true, message: 'Güncellendi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Güncellenemedi' });
  }
});

router.put('/drp-uc/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { kod, aciklama } = req.body;
    if (!aciklama) {
      return res.status(400).json({ success: false, error: 'Açıklama gereklidir' });
    }
    guidanceStandardsService.updateDrpUc(id, kod || '', aciklama);
    res.json({ success: true, message: 'Güncellendi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Güncellenemedi' });
  }
});

router.delete('/ana-kategoriler/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    guidanceStandardsService.deleteAnaKategori(id);
    res.json({ success: true, message: 'Silindi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Silinemedi' });
  }
});

router.delete('/hizmet-alanlari/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    guidanceStandardsService.deleteHizmetAlani(id);
    res.json({ success: true, message: 'Silindi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Silinemedi' });
  }
});

router.delete('/drp-bir/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    guidanceStandardsService.deleteDrpBir(id);
    res.json({ success: true, message: 'Silindi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Silinemedi' });
  }
});

router.delete('/drp-iki/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    guidanceStandardsService.deleteDrpIki(id);
    res.json({ success: true, message: 'Silindi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Silinemedi' });
  }
});

router.delete('/drp-uc/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    guidanceStandardsService.deleteDrpUc(id);
    res.json({ success: true, message: 'Silindi' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Silinemedi' });
  }
});

router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const result = guidanceStandardsService.resetToDefaults();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error resetting:', error);
    res.status(500).json({ success: false, error: 'Varsayılana döndürülemedi' });
  }
});

export default router;
