import type Database from 'better-sqlite3';
import { DEFAULT_GUIDANCE_STANDARDS } from '../../../../shared/data/default-guidance-standards.js';

interface GuidanceCategory {
  id: string;
  title: string;
  type: 'individual' | 'group';
  parentId: string | null;
  level: number;
  order: number;
  isCustom: boolean;
  children?: GuidanceCategory[];
  items?: GuidanceItem[];
}

interface GuidanceItem {
  id: string;
  title: string;
  categoryId: string;
  order: number;
  isCustom: boolean;
}

export function createGuidanceStandardsTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guidance_categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('individual', 'group')),
      parent_id TEXT,
      level INTEGER NOT NULL,
      "order" INTEGER NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES guidance_categories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_guidance_categories_type ON guidance_categories(type);
    CREATE INDEX IF NOT EXISTS idx_guidance_categories_parent_id ON guidance_categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_guidance_categories_order ON guidance_categories("order");

    CREATE TABLE IF NOT EXISTS guidance_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category_id TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES guidance_categories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_guidance_items_category_id ON guidance_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_guidance_items_order ON guidance_items("order");
  `);
}

function insertCategoryRecursive(
  db: Database.Database,
  category: GuidanceCategory,
  insertStmt: Database.Statement,
  itemInsertStmt: Database.Statement
): void {
  insertStmt.run({
    id: category.id,
    title: category.title,
    type: category.type,
    parent_id: category.parentId,
    level: category.level,
    order: category.order,
    is_custom: category.isCustom ? 1 : 0,
  });

  if (category.items && category.items.length > 0) {
    for (const item of category.items) {
      itemInsertStmt.run({
        id: item.id,
        title: item.title,
        category_id: item.categoryId,
        order: item.order,
        is_custom: item.isCustom ? 1 : 0,
      });
    }
  }

  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      insertCategoryRecursive(db, child, insertStmt, itemInsertStmt);
    }
  }
}

export function seedGuidanceStandards(db: Database.Database): void {
  const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM guidance_categories').get() as { count: number };
  
  if (categoriesCount.count > 0) {
    return;
  }

  const insertCategory = db.prepare(`
    INSERT INTO guidance_categories (id, title, type, parent_id, level, "order", is_custom)
    VALUES (@id, @title, @type, @parent_id, @level, @order, @is_custom)
  `);

  const insertItem = db.prepare(`
    INSERT INTO guidance_items (id, title, category_id, "order", is_custom)
    VALUES (@id, @title, @category_id, @order, @is_custom)
  `);

  const seedTransaction = db.transaction(() => {
    for (const category of DEFAULT_GUIDANCE_STANDARDS.individual) {
      insertCategoryRecursive(db, category, insertCategory, insertItem);
    }

    for (const category of DEFAULT_GUIDANCE_STANDARDS.group) {
      insertCategoryRecursive(db, category, insertCategory, insertItem);
    }
  });

  seedTransaction();
  
  console.log('✅ Guidance standards seeded successfully');
}
