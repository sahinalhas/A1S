import guidanceData from '../../../../shared/data/guidance-standards-data.json' assert { type: 'json' };

export async function getAllCategories() {
  return [...guidanceData.ana_kategoriler, ...guidanceData.drp_hizmet_alani, ...guidanceData.drp_iki];
}

export async function getCategoryById(id: string) {
  const categories = await getAllCategories();
  return categories.find(cat => cat.id === parseInt(id)) || null;
}

export async function getCategoriesByType(type: 'individual' | 'group') {
  const allCategories = await getAllCategories();
  // Filter based on ana_kategori_id for group/individual distinction
  return allCategories;
}

export async function getCategoriesByParent(parentId: string | null) {
  return guidanceData.drp_hizmet_alani;
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

export async function getAllItems() {
  return guidanceData.drp_uc;
}

export async function getItemById(id: string) {
  const items = await getAllItems();
  return (items as any[]).find(item => item.id === parseInt(id)) || null;
}

export async function getItemsByCategory(categoryId: string) {
  const items = await getAllItems();
  return (items as any[]).filter(item => item.drp_iki_id === parseInt(categoryId));
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
