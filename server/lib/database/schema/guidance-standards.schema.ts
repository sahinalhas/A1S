import type Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

export function createGuidanceStandardsTables(db: Database.Database): void {
  db.exec(`
    DROP TABLE IF EXISTS drp_uc;
    DROP TABLE IF EXISTS drp_iki;
    DROP TABLE IF EXISTS drp_bir;
    DROP TABLE IF EXISTS drp_hizmet_alani;
    DROP TABLE IF EXISTS ana_kategoriler;
    DROP TABLE IF EXISTS guidance_items;
    DROP TABLE IF EXISTS guidance_categories;

    CREATE TABLE IF NOT EXISTS ana_kategoriler (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drp_hizmet_alani (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ana_kategori_id INTEGER,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ana_kategori_id) REFERENCES ana_kategoriler(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drp_bir (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drp_hizmet_alani_id INTEGER,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drp_hizmet_alani_id) REFERENCES drp_hizmet_alani(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drp_iki (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drp_bir_id INTEGER,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drp_bir_id) REFERENCES drp_bir(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drp_uc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drp_iki_id INTEGER,
      kod TEXT,
      aciklama TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drp_iki_id) REFERENCES drp_iki(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_drp_hizmet_alani_ana ON drp_hizmet_alani(ana_kategori_id);
    CREATE INDEX IF NOT EXISTS idx_drp_bir_hizmet ON drp_bir(drp_hizmet_alani_id);
    CREATE INDEX IF NOT EXISTS idx_drp_iki_bir ON drp_iki(drp_bir_id);
    CREATE INDEX IF NOT EXISTS idx_drp_uc_iki ON drp_uc(drp_iki_id);
  `);

  console.log('✅ Guidance standards tables created (5 tables)');
}

export function seedGuidanceStandards(db: Database.Database): void {
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM ana_kategoriler');
  const result = checkStmt.get() as { count: number };

  if (result.count > 0) {
    console.log('✅ Guidance standards already seeded');
    return;
  }

  // Try multiple paths to find the file
  let jsonPath = path.resolve(process.cwd(), 'shared', 'data', 'guidance-standards.json');
  if (!fs.existsSync(jsonPath)) {
    // Try relative to this file location
    jsonPath = path.resolve(__dirname, '../../../../../shared/data/guidance-standards.json');
  }

  if (!fs.existsSync(jsonPath)) {
    // Fallback for different build structures
    jsonPath = path.resolve(process.cwd(), '../shared/data/guidance-standards.json');
  }

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Guidance standards data file not found. Searched at: ${jsonPath}`);
    console.error(`CWD: ${process.cwd()}`);
    // Do not throw here if you want to avoid breaking the app boot, but better to warn.
    // For now we throw to see it in tests.
    throw new Error(`Guidance standards data file not found`);
  }

  let data: any;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error('❌ Error parsing guidance standards JSON:', err);
    throw err;
  }

  try {
    db.exec('BEGIN TRANSACTION');

    // Insert without specifying IDs to leverage AUTOINCREMENT and avoid conflicts
    const insertAna = db.prepare('INSERT INTO ana_kategoriler (ad) VALUES (?)');
    const insertHA = db.prepare('INSERT INTO drp_hizmet_alani (ana_kategori_id, ad) VALUES (?, ?)');
    const insertBir = db.prepare('INSERT INTO drp_bir (drp_hizmet_alani_id, ad) VALUES (?, ?)');
    const insertIki = db.prepare('INSERT INTO drp_iki (drp_bir_id, ad) VALUES (?, ?)');
    const insertUc = db.prepare('INSERT INTO drp_uc (drp_iki_id, kod, aciklama) VALUES (?, ?, ?)');

    for (const ana of data) {
      const anaResult = insertAna.run(ana.ad);
      const anaId = anaResult.lastInsertRowid;

      if (ana.hizmet_alanlari) {
        for (const ha of ana.hizmet_alanlari) {
          const haResult = insertHA.run(anaId, ha.ad);
          const haId = haResult.lastInsertRowid;

          if (ha.drp_bir) {
            for (const bir of ha.drp_bir) {
              const birResult = insertBir.run(haId, bir.ad);
              const birId = birResult.lastInsertRowid;

              if (bir.drp_iki && bir.drp_iki.length > 0) {
                const subCategories = bir.drp_iki.filter((i: any) => i.ad);
                const directItems = bir.drp_iki.filter((i: any) => !i.ad && (i.kod || i.aciklama));

                for (const iki of subCategories) {
                  const ikiResult = insertIki.run(birId, iki.ad);
                  const ikiId = ikiResult.lastInsertRowid;

                  if (iki.drp_uc) {
                    for (const uc of iki.drp_uc) {
                      insertUc.run(ikiId, uc.kod, uc.aciklama);
                    }
                  }
                }

                if (directItems.length > 0) {
                  // Create surrogate category for direct items
                  const ikiResult = insertIki.run(birId, bir.ad);
                  const ikiId = ikiResult.lastInsertRowid;

                  for (const item of directItems) {
                    insertUc.run(ikiId, item.kod, item.aciklama);
                  }
                }
              }
            }
          }
        }
      }
    }

    db.exec('COMMIT');
    console.log('✅ Guidance standards seeded from JSON file');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Error seeding guidance standards:', error);
    throw error;
  }
}

export function resetGuidanceStandardsToDefaults(db: Database.Database): void {
  try {
    db.exec('DELETE FROM drp_uc');
    db.exec('DELETE FROM drp_iki');
    db.exec('DELETE FROM drp_bir');
    db.exec('DELETE FROM drp_hizmet_alani');
    db.exec('DELETE FROM ana_kategoriler');

    seedGuidanceStandards(db);
    console.log('✅ Guidance standards reset to defaults');
  } catch (error) {
    console.error('❌ Error resetting guidance standards:', error);
    throw error;
  }
}
