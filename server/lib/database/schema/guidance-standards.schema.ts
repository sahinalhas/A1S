import type Database from 'better-sqlite3';
import guidanceData from '../../../../shared/data/guidance-standards-data.json' assert { type: 'json' };

export function createGuidanceStandardsTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guidance_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'individual',
      level INTEGER,
      order_index INTEGER,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES guidance_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS guidance_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      code TEXT,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES guidance_categories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_guidance_categories_parent ON guidance_categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_guidance_categories_type ON guidance_categories(type);
    CREATE INDEX IF NOT EXISTS idx_guidance_items_category ON guidance_items(category_id);
  `);

  console.log('✅ Guidance standards tables created');
}

export function seedGuidanceStandards(db: Database.Database): void {
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM guidance_categories');
  const result = checkStmt.get() as { count: number };

  if (result.count > 0) {
    console.log('✅ Guidance standards already seeded');
    return;
  }

  const insertCategory = db.prepare(`
    INSERT INTO guidance_categories (parent_id, title, type, level, order_index, is_custom)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  const insertItem = db.prepare(`
    INSERT INTO guidance_items (category_id, title, code, description, order_index, is_custom)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  try {
    db.exec('BEGIN TRANSACTION');

    // Load ana_kategoriler (type indicator)
    const anaCategoriesMap = new Map<number, string>();
    guidanceData.ana_kategoriler.forEach((cat: any) => {
      anaCategoriesMap.set(cat.id, cat.ad.includes('Grup') ? 'group' : 'individual');
    });

    // Load drp_hizmet_alani as level 1 categories
    const hizmetMap = new Map<number, number>();
    guidanceData.drp_hizmet_alani.forEach((hizmet: any) => {
      const type = anaCategoriesMap.get(hizmet.ana_kategori_id) || 'individual';
      const result = insertCategory.run(null, hizmet.ad, type, 1, hizmet.id) as any;
      hizmetMap.set(hizmet.id, result.lastInsertRowid as number);
    });

    // Load drp_iki as level 2 categories
    const ikiMap = new Map<number, number>();
    guidanceData.drp_iki.forEach((iki: any, idx: number) => {
      const parentDbId = hizmetMap.get(iki.drp_bir_id);
      const parentHizmet = guidanceData.drp_hizmet_alani.find((h: any) => h.id === iki.drp_bir_id);
      const type = parentHizmet ? anaCategoriesMap.get(parentHizmet.ana_kategori_id) || 'individual' : 'individual';
      
      const result = insertCategory.run(parentDbId || null, iki.ad, type, 2, idx + 1) as any;
      ikiMap.set(iki.id, result.lastInsertRowid as number);
    });

    // Load drp_uc as items
    guidanceData.drp_uc.forEach((item: any, idx: number) => {
      const categoryDbId = ikiMap.get(item.drp_iki_id);
      if (categoryDbId) {
        insertItem.run(categoryDbId, item.aciklama, item.kod || '', item.aciklama, idx + 1);
      }
    });

    db.exec('COMMIT');
    console.log('✅ Guidance standards seeded from default data');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Error seeding guidance standards:', error);
    throw error;
  }
}
