import { getDatabase } from '../../../lib/database/connection.js';

export async function getAllCategories() {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM guidance_categories 
    WHERE parent_id IS NULL
    ORDER BY order_index
  `).all();
}

export async function getCategoryById(id: string) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM guidance_categories WHERE id = ?
  `).get(parseInt(id));
}

export async function getCategoriesByType(type: 'individual' | 'group') {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM guidance_categories 
    WHERE type = ? AND parent_id IS NULL
    ORDER BY order_index
  `).all(type);
}

export async function getCategoriesByParent(parentId: string | null) {
  const db = getDatabase();
  if (!parentId) {
    return db.prepare(`
      SELECT * FROM guidance_categories 
      WHERE parent_id IS NULL
      ORDER BY order_index
    `).all();
  }
  return db.prepare(`
    SELECT * FROM guidance_categories 
    WHERE parent_id = ?
    ORDER BY order_index
  `).all(parseInt(parentId));
}

export async function createCategory(data: { title: string; type: 'individual' | 'group'; parentId: string | null }) {
  const db = getDatabase();
  const maxOrder = db.prepare(`
    SELECT MAX(order_index) as max_order FROM guidance_categories 
    WHERE parent_id = ?
  `).get(data.parentId ? parseInt(data.parentId) : null) as any;
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;
  
  const result = db.prepare(`
    INSERT INTO guidance_categories (parent_id, title, type, level, order_index, is_custom)
    VALUES (?, ?, ?, 
      (SELECT COALESCE(level + 1, 1) FROM guidance_categories WHERE id = ?),
      ?,
      1
    )
  `).run(
    data.parentId ? parseInt(data.parentId) : null,
    data.title,
    data.type,
    data.parentId ? parseInt(data.parentId) : null,
    nextOrder
  ) as any;

  return result.lastInsertRowid;
}

export async function updateCategory(id: string, title: string) {
  const db = getDatabase();
  db.prepare(`
    UPDATE guidance_categories 
    SET title = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, parseInt(id));
}

export async function deleteCategory(id: string) {
  const db = getDatabase();
  db.prepare(`
    DELETE FROM guidance_categories WHERE id = ?
  `).run(parseInt(id));
}

export async function getAllItems() {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM guidance_items
    ORDER BY order_index
  `).all();
}

export async function getItemById(id: string) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM guidance_items WHERE id = ?
  `).get(parseInt(id));
}

export async function getItemsByCategory(categoryId: string) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM guidance_items 
    WHERE category_id = ?
    ORDER BY order_index
  `).all(parseInt(categoryId));
}

export async function createItem(data: { title: string; categoryId: string; code?: string; description?: string }) {
  const db = getDatabase();
  const maxOrder = db.prepare(`
    SELECT MAX(order_index) as max_order FROM guidance_items 
    WHERE category_id = ?
  `).get(parseInt(data.categoryId)) as any;
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;

  const result = db.prepare(`
    INSERT INTO guidance_items (category_id, title, code, description, order_index, is_custom)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(
    parseInt(data.categoryId),
    data.title,
    data.code || '',
    data.description || data.title,
    nextOrder
  ) as any;

  return result.lastInsertRowid;
}

export async function updateItem(id: string, data: { title?: string; code?: string; description?: string }) {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.code !== undefined) {
    updates.push('code = ?');
    values.push(data.code);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(parseInt(id));

  db.prepare(`
    UPDATE guidance_items 
    SET ${updates.join(', ')}
    WHERE id = ?
  `).run(...values);
}

export async function deleteItem(id: string) {
  const db = getDatabase();
  db.prepare(`
    DELETE FROM guidance_items WHERE id = ?
  `).run(parseInt(id));
}

export async function reorderItems(items: { id: string; order: number }[]) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE guidance_items 
    SET order_index = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    items.forEach(item => {
      stmt.run(item.order, parseInt(item.id));
    });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export async function deleteAllData() {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    db.exec('DELETE FROM guidance_items');
    db.exec('DELETE FROM guidance_categories WHERE is_custom = 1');
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
