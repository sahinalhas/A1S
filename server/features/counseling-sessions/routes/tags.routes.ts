import { Request, Response } from 'express';
import { ALL_SESSION_TAGS, TAG_CATEGORIES, suggestTagsForTopic, getTagById } from '../constants/session-tags.js';

export function getAllTags(req: Request, res: Response) {
  try {
    res.json(ALL_SESSION_TAGS);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Etiketler yüklenemedi' });
  }
}

export function getTagsByCategory(req: Request, res: Response) {
  try {
    const { category } = req.params;
    
    if (!TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json(TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]);
  } catch (error) {
    console.error('Error fetching tags by category:', error);
    res.status(500).json({ error: 'Etiketler yüklenemedi' });
  }
}

export function getSuggestedTags(req: Request, res: Response) {
  try {
    const { topic } = req.query;
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Konu parametresi gereklidir' });
    }
    
    const suggestions = suggestTagsForTopic(topic);
    res.json(suggestions);
  } catch (error) {
    console.error('Error suggesting tags:', error);
    res.status(500).json({ error: 'Öneri oluşturulamadı' });
  }
}

export function getTagDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tag = getTagById(id);
    
    if (!tag) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag details:', error);
    res.status(500).json({ error: 'Etiket bilgisi alınamadı' });
  }
}
