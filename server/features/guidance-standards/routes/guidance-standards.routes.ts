import { Router, type Request, type Response } from 'express';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import * as guidanceStandardsService from '../services/guidance-standards.service.js';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateItemRequest,
  UpdateItemRequest,
  ReorderItemsRequest,
} from '../../../../shared/types/index.js';

const router = Router();
router.use(validateSchoolAccess);

router.get('/', (_req: Request, res: Response) => {
  try {
    const standards = guidanceStandardsService.getAllStandards();
    res.json({
      success: true,
      data: { standards },
    });
  } catch (error) {
    console.error('Error fetching guidance standards:', error);
    res.status(500).json({
      success: false,
      error: 'Rehberlik standartları yüklenemedi',
    });
  }
});

router.get('/category/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = guidanceStandardsService.getCategoryWithChildren(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Kategori bulunamadı',
      });
    }
    
    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Kategori yüklenemedi',
    });
  }
});

router.post('/category', (req: Request, res: Response) => {
  try {
    const data = req.body as CreateCategoryRequest;
    
    if (!data.title || !data.type) {
      return res.status(400).json({
        success: false,
        error: 'Başlık ve tip gereklidir',
      });
    }
    
    const category = guidanceStandardsService.createCategory(data);
    
    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Kategori oluşturulamadı',
    });
  }
});

router.put('/category/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateCategoryRequest;
    
    if (!data.title) {
      return res.status(400).json({
        success: false,
        error: 'Başlık gereklidir',
      });
    }
    
    guidanceStandardsService.updateCategory(id, data.title);
    
    res.json({
      success: true,
      data: { message: 'Kategori güncellendi' },
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Kategori güncellenemedi',
    });
  }
});

router.delete('/category/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    guidanceStandardsService.deleteCategory(id);
    
    res.json({
      success: true,
      data: { message: 'Kategori silindi' },
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Kategori silinemedi',
    });
  }
});

router.post('/item', (req: Request, res: Response) => {
  try {
    const data = req.body as CreateItemRequest;
    
    if (!data.title || !data.categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Başlık ve kategori ID gereklidir',
      });
    }
    
    const item = guidanceStandardsService.createItem(data);
    
    res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Konu oluşturulamadı',
    });
  }
});

router.put('/item/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateItemRequest;
    
    if (!data.title) {
      return res.status(400).json({
        success: false,
        error: 'Başlık gereklidir',
      });
    }
    
    guidanceStandardsService.updateItem(id, data.title);
    
    res.json({
      success: true,
      data: { message: 'Konu güncellendi' },
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Konu güncellenemedi',
    });
  }
});

router.delete('/item/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    guidanceStandardsService.deleteItem(id);
    
    res.json({
      success: true,
      data: { message: 'Konu silindi' },
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Konu silinemedi',
    });
  }
});

router.put('/items/reorder', (req: Request, res: Response) => {
  try {
    const data = req.body as ReorderItemsRequest;
    
    if (!data.items || !Array.isArray(data.items)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz sıralama verisi',
      });
    }
    
    guidanceStandardsService.reorderItems(data.items);
    
    res.json({
      success: true,
      data: { message: 'Sıralama güncellendi' },
    });
  } catch (error) {
    console.error('Error reordering items:', error);
    res.status(500).json({
      success: false,
      error: 'Sıralama güncellenemedi',
    });
  }
});

router.get('/export', (_req: Request, res: Response) => {
  try {
    const standards = guidanceStandardsService.exportStandards();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=rehberlik-standartlari.json');
    res.json(standards);
  } catch (error) {
    console.error('Error exporting standards:', error);
    res.status(500).json({
      success: false,
      error: 'Standartlar dışa aktarılamadı',
    });
  }
});

router.post('/import', (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    if (!data || !data.individual || !data.group) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
      });
    }
    
    guidanceStandardsService.importStandards(data);
    
    res.json({
      success: true,
      data: { message: 'Standartlar içe aktarıldı' },
    });
  } catch (error) {
    console.error('Error importing standards:', error);
    res.status(500).json({
      success: false,
      error: 'Standartlar içe aktarılamadı',
    });
  }
});

router.post('/reset', (_req: Request, res: Response) => {
  try {
    guidanceStandardsService.resetToDefaults();
    
    res.json({
      success: true,
      data: { message: 'Standartlar varsayılana sıfırlandı' },
    });
  } catch (error) {
    console.error('Error resetting standards:', error);
    res.status(500).json({
      success: false,
      error: 'Standartlar sıfırlanamadı',
    });
  }
});

export default router;
