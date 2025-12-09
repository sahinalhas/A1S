import type { GuidanceCategory, GuidanceItem } from '../../../../shared/types/index.js';

export async function getAllCategories(): Promise<GuidanceCategory[]> {
  return [];
}

export async function getCategoryById(id: string): Promise<GuidanceCategory | null> {
  return null;
}

export async function getCategoriesByType(type: 'individual' | 'group'): Promise<GuidanceCategory[]> {
  return [];
}

export async function getCategoriesByParent(parentId: string | null): Promise<GuidanceCategory[]> {
  return [];
}

export async function createCategory(category: any): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function updateCategory(id: string, title: string): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function deleteCategory(id: string): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function getAllItems(): Promise<GuidanceItem[]> {
  return [];
}

export async function getItemById(id: string): Promise<GuidanceItem | null> {
  return null;
}

export async function getItemsByCategory(categoryId: string): Promise<GuidanceItem[]> {
  return [];
}

export async function createItem(item: any): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function updateItem(id: string, title: string): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function deleteItem(id: string): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function reorderItems(items: { id: string; order: number }[]): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}

export async function deleteAllData(): Promise<void> {
  // Not implemented - data comes from PostgreSQL database
}
