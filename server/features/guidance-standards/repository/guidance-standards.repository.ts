import { getDatabase } from '../../../lib/database/connection.js';

export interface AnaKategori {
  id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

export interface DrpHizmetAlani {
  id: number;
  ana_kategori_id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

export interface DrpBir {
  id: number;
  drp_hizmet_alani_id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

export interface DrpIki {
  id: number;
  drp_bir_id: number;
  ad: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

export interface DrpUc {
  id: number;
  drp_iki_id: number;
  kod: string;
  aciklama: string;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

export function getAnaKategoriler(): AnaKategori[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM ana_kategoriler ORDER BY id').all() as AnaKategori[];
}

export function getHizmetAlanlari(anaKategoriId?: number): DrpHizmetAlani[] {
  const db = getDatabase();
  if (anaKategoriId) {
    return db.prepare('SELECT * FROM drp_hizmet_alani WHERE ana_kategori_id = ? ORDER BY id').all(anaKategoriId) as DrpHizmetAlani[];
  }
  return db.prepare('SELECT * FROM drp_hizmet_alani ORDER BY id').all() as DrpHizmetAlani[];
}

export function getDrpBirler(hizmetAlaniId?: number): DrpBir[] {
  const db = getDatabase();
  if (hizmetAlaniId) {
    return db.prepare('SELECT * FROM drp_bir WHERE drp_hizmet_alani_id = ? ORDER BY id').all(hizmetAlaniId) as DrpBir[];
  }
  return db.prepare('SELECT * FROM drp_bir ORDER BY id').all() as DrpBir[];
}

export function getDrpIkiler(drpBirId?: number): DrpIki[] {
  const db = getDatabase();
  if (drpBirId) {
    return db.prepare('SELECT * FROM drp_iki WHERE drp_bir_id = ? ORDER BY id').all(drpBirId) as DrpIki[];
  }
  return db.prepare('SELECT * FROM drp_iki ORDER BY id').all() as DrpIki[];
}

export function getDrpUcler(drpIkiId?: number): DrpUc[] {
  const db = getDatabase();
  if (drpIkiId) {
    return db.prepare('SELECT * FROM drp_uc WHERE drp_iki_id = ? ORDER BY id').all(drpIkiId) as DrpUc[];
  }
  return db.prepare('SELECT * FROM drp_uc ORDER BY id').all() as DrpUc[];
}

export function createAnaKategori(ad: string): number {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO ana_kategoriler (ad, is_custom) VALUES (?, 1)').run(ad) as any;
  return result.lastInsertRowid;
}

export function createHizmetAlani(anaKategoriId: number, ad: string): number {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO drp_hizmet_alani (ana_kategori_id, ad, is_custom) VALUES (?, ?, 1)').run(anaKategoriId, ad) as any;
  return result.lastInsertRowid;
}

export function createDrpBir(hizmetAlaniId: number, ad: string): number {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO drp_bir (drp_hizmet_alani_id, ad, is_custom) VALUES (?, ?, 1)').run(hizmetAlaniId, ad) as any;
  return result.lastInsertRowid;
}

export function createDrpIki(drpBirId: number, ad: string): number {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO drp_iki (drp_bir_id, ad, is_custom) VALUES (?, ?, 1)').run(drpBirId, ad) as any;
  return result.lastInsertRowid;
}

export function createDrpUc(drpIkiId: number, kod: string, aciklama: string): number {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO drp_uc (drp_iki_id, kod, aciklama, is_custom) VALUES (?, ?, ?, 1)').run(drpIkiId, kod, aciklama) as any;
  return result.lastInsertRowid;
}

export function updateAnaKategori(id: number, ad: string): void {
  const db = getDatabase();
  db.prepare('UPDATE ana_kategoriler SET ad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, id);
}

export function updateHizmetAlani(id: number, ad: string): void {
  const db = getDatabase();
  db.prepare('UPDATE drp_hizmet_alani SET ad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, id);
}

export function updateDrpBir(id: number, ad: string): void {
  const db = getDatabase();
  db.prepare('UPDATE drp_bir SET ad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, id);
}

export function updateDrpIki(id: number, ad: string): void {
  const db = getDatabase();
  db.prepare('UPDATE drp_iki SET ad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, id);
}

export function updateDrpUc(id: number, kod: string, aciklama: string): void {
  const db = getDatabase();
  db.prepare('UPDATE drp_uc SET kod = ?, aciklama = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(kod, aciklama, id);
}

export function deleteAnaKategori(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM ana_kategoriler WHERE id = ?').run(id);
}

export function deleteHizmetAlani(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM drp_hizmet_alani WHERE id = ?').run(id);
}

export function deleteDrpBir(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM drp_bir WHERE id = ?').run(id);
}

export function deleteDrpIki(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM drp_iki WHERE id = ?').run(id);
}

export function deleteDrpUc(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM drp_uc WHERE id = ?').run(id);
}

export function getFullHierarchy() {
  const db = getDatabase();
  
  const anaKategoriler = getAnaKategoriler();
  const hizmetAlanlari = getHizmetAlanlari();
  const drpBirler = getDrpBirler();
  const drpIkiler = getDrpIkiler();
  const drpUcler = getDrpUcler();
  
  return {
    ana_kategoriler: anaKategoriler,
    drp_hizmet_alani: hizmetAlanlari,
    drp_bir: drpBirler,
    drp_iki: drpIkiler,
    drp_uc: drpUcler
  };
}

export function getStats() {
  const db = getDatabase();
  
  const anaCount = (db.prepare('SELECT COUNT(*) as count FROM ana_kategoriler').get() as any).count;
  const hizmetCount = (db.prepare('SELECT COUNT(*) as count FROM drp_hizmet_alani').get() as any).count;
  const birCount = (db.prepare('SELECT COUNT(*) as count FROM drp_bir').get() as any).count;
  const ikiCount = (db.prepare('SELECT COUNT(*) as count FROM drp_iki').get() as any).count;
  const ucCount = (db.prepare('SELECT COUNT(*) as count FROM drp_uc').get() as any).count;
  
  return {
    ana_kategoriler: anaCount,
    drp_hizmet_alani: hizmetCount,
    drp_bir: birCount,
    drp_iki: ikiCount,
    drp_uc: ucCount,
    total: anaCount + hizmetCount + birCount + ikiCount + ucCount
  };
}
