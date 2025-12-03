import getDatabase from '../../../lib/database.js';
import type { GuidanceCategory, GuidanceItem } from '../../../../shared/types/index.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllCategories: db.prepare(`
      SELECT * FROM guidance_categories ORDER BY "order" ASC
    `),
    getCategoryById: db.prepare('SELECT * FROM guidance_categories WHERE id = ?'),
    getCategoriesByType: db.prepare('SELECT * FROM guidance_categories WHERE type = ? ORDER BY "order" ASC'),
    getCategoriesByParent: db.prepare('SELECT * FROM guidance_categories WHERE parent_id = ? ORDER BY "order" ASC'),
    getRootCategories: db.prepare('SELECT * FROM guidance_categories WHERE parent_id IS NULL ORDER BY "order" ASC'),
    
    insertCategory: db.prepare(`
      INSERT INTO guidance_categories (id, title, type, parent_id, level, "order", is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    updateCategory: db.prepare('UPDATE guidance_categories SET title = ?, updated_at = datetime(\'now\') WHERE id = ?'),
    deleteCategory: db.prepare('DELETE FROM guidance_categories WHERE id = ?'),
    
    getAllItems: db.prepare('SELECT * FROM guidance_items ORDER BY "order" ASC'),
    getItemById: db.prepare('SELECT * FROM guidance_items WHERE id = ?'),
    getItemsByCategory: db.prepare('SELECT * FROM guidance_items WHERE category_id = ? ORDER BY "order" ASC'),
    
    insertItem: db.prepare(`
      INSERT INTO guidance_items (id, title, category_id, "order", is_custom)
      VALUES (?, ?, ?, ?, ?)
    `),
    updateItem: db.prepare('UPDATE guidance_items SET title = ?, updated_at = datetime(\'now\') WHERE id = ?'),
    deleteItem: db.prepare('DELETE FROM guidance_items WHERE id = ?'),
    reorderItem: db.prepare('UPDATE guidance_items SET "order" = ? WHERE id = ?'),
    
    deleteAllCategories: db.prepare('DELETE FROM guidance_categories'),
    deleteAllItems: db.prepare('DELETE FROM guidance_items'),
  };
  
  isInitialized = true;
}

interface CategoryRow {
  id: string;
  title: string;
  type: 'individual' | 'group';
  parent_id: string | null;
  level: number;
  order: number;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

interface ItemRow {
  id: string;
  title: string;
  category_id: string;
  order: number;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

function rowToCategory(row: CategoryRow): GuidanceCategory {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    parentId: row.parent_id,
    level: row.level,
    order: row.order,
    isCustom: row.is_custom === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToItem(row: ItemRow): GuidanceItem {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    order: row.order,
    isCustom: row.is_custom === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllCategories(): GuidanceCategory[] {
  ensureInitialized();
  const rows = statements.getAllCategories.all() as CategoryRow[];
  return rows.map(rowToCategory);
}

export function getCategoryById(id: string): GuidanceCategory | null {
  ensureInitialized();
  const row = statements.getCategoryById.get(id) as CategoryRow | undefined;
  return row ? rowToCategory(row) : null;
}

export function getCategoriesByType(type: 'individual' | 'group'): GuidanceCategory[] {
  ensureInitialized();
  const rows = statements.getCategoriesByType.all(type) as CategoryRow[];
  return rows.map(rowToCategory);
}

export function getCategoriesByParent(parentId: string | null): GuidanceCategory[] {
  ensureInitialized();
  const rows = parentId 
    ? statements.getCategoriesByParent.all(parentId) as CategoryRow[]
    : statements.getRootCategories.all() as CategoryRow[];
  return rows.map(rowToCategory);
}

export function createCategory(category: Omit<GuidanceCategory, 'createdAt' | 'updatedAt' | 'children' | 'items'>): void {
  ensureInitialized();
  statements.insertCategory.run(
    category.id,
    category.title,
    category.type,
    category.parentId,
    category.level,
    category.order,
    category.isCustom ? 1 : 0
  );
}

export function updateCategory(id: string, title: string): void {
  ensureInitialized();
  statements.updateCategory.run(title, id);
}

export function deleteCategory(id: string): void {
  ensureInitialized();
  statements.deleteCategory.run(id);
}

export function getAllItems(): GuidanceItem[] {
  ensureInitialized();
  const rows = statements.getAllItems.all() as ItemRow[];
  return rows.map(rowToItem);
}

export function getItemById(id: string): GuidanceItem | null {
  ensureInitialized();
  const row = statements.getItemById.get(id) as ItemRow | undefined;
  return row ? rowToItem(row) : null;
}

export function getItemsByCategory(categoryId: string): GuidanceItem[] {
  ensureInitialized();
  const rows = statements.getItemsByCategory.all(categoryId) as ItemRow[];
  return rows.map(rowToItem);
}

export function createItem(item: Omit<GuidanceItem, 'createdAt' | 'updatedAt'>): void {
  ensureInitialized();
  statements.insertItem.run(
    item.id,
    item.title,
    item.categoryId,
    item.order,
    item.isCustom ? 1 : 0
  );
}

export function updateItem(id: string, title: string): void {
  ensureInitialized();
  statements.updateItem.run(title, id);
}

export function deleteItem(id: string): void {
  ensureInitialized();
  statements.deleteItem.run(id);
}

export function reorderItems(items: { id: string; order: number }[]): void {
  ensureInitialized();
  const db = getDatabase();
  const transaction = db.transaction(() => {
    for (const item of items) {
      statements.reorderItem.run(item.order, item.id);
    }
  });
  transaction();
}

export function deleteAllData(): void {
  ensureInitialized();
  const db = getDatabase();
  const transaction = db.transaction(() => {
    statements.deleteAllItems.run();
    statements.deleteAllCategories.run();
  });
  transaction();
}
