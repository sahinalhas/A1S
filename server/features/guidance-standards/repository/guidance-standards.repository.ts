import type { GuidanceCategory, GuidanceItem } from '../../../../shared/types/index.js';
import { DEFAULT_GUIDANCE_STANDARDS } from '../../../../shared/data/default-guidance-standards.js';

function flattenCategories(categories: GuidanceCategory[]): GuidanceCategory[] {
  const result: GuidanceCategory[] = [];
  for (const category of categories) {
    result.push(category);
    if (category.children) {
      result.push(...flattenCategories(category.children));
    }
  }
  return result;
}

function flattenItems(categories: GuidanceCategory[]): GuidanceItem[] {
  const result: GuidanceItem[] = [];
  for (const category of categories) {
    if (category.items) {
      result.push(...category.items);
    }
    if (category.children) {
      result.push(...flattenItems(category.children));
    }
  }
  return result;
}

export async function getAllCategories(): Promise<GuidanceCategory[]> {
  const allCategories: GuidanceCategory[] = [
    ...DEFAULT_GUIDANCE_STANDARDS.individual,
    ...DEFAULT_GUIDANCE_STANDARDS.group
  ];
  return flattenCategories(allCategories);
}

export async function getCategoryById(id: string): Promise<GuidanceCategory | null> {
  const allCategories = await getAllCategories();
  return allCategories.find(cat => cat.id === id) || null;
}

export async function getCategoriesByType(type: 'individual' | 'group'): Promise<GuidanceCategory[]> {
  const standards = type === 'individual' ? DEFAULT_GUIDANCE_STANDARDS.individual : DEFAULT_GUIDANCE_STANDARDS.group;
  return flattenCategories(standards);
}

export async function getCategoriesByParent(parentId: string | null): Promise<GuidanceCategory[]> {
  const allCategories = await getAllCategories();
  return allCategories.filter(cat => cat.parentId === parentId);
}

export async function createCategory(category: any): Promise<void> {
  // Not implemented - uses default data
}

export async function updateCategory(id: string, title: string): Promise<void> {
  // Not implemented - uses default data
}

export async function deleteCategory(id: string): Promise<void> {
  // Not implemented - uses default data
}

export async function getAllItems(): Promise<GuidanceItem[]> {
  const allCategories: GuidanceCategory[] = [
    ...DEFAULT_GUIDANCE_STANDARDS.individual,
    ...DEFAULT_GUIDANCE_STANDARDS.group
  ];
  return flattenItems(allCategories);
}

export async function getItemById(id: string): Promise<GuidanceItem | null> {
  const allItems = await getAllItems();
  return allItems.find(item => item.id === id) || null;
}

export async function getItemsByCategory(categoryId: string): Promise<GuidanceItem[]> {
  const category = await getCategoryById(categoryId);
  return category?.items || [];
}

export async function createItem(item: any): Promise<void> {
  // Not implemented - uses default data
}

export async function updateItem(id: string, title: string): Promise<void> {
  // Not implemented - uses default data
}

export async function deleteItem(id: string): Promise<void> {
  // Not implemented - uses default data
}

export async function reorderItems(items: { id: string; order: number }[]): Promise<void> {
  // Not implemented - uses default data
}

export async function deleteAllData(): Promise<void> {
  // Not implemented - uses default data
}
