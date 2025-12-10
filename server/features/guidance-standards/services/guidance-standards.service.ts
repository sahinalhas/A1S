import * as repository from '../repository/guidance-standards.repository.js';
import { getDatabase } from '../../../lib/database/connection.js';
import { resetGuidanceStandardsToDefaults } from '../../../lib/database/schema/guidance-standards.schema.js';

export function getAllStandards() {
  return repository.getFullHierarchy();
}

export function getStats() {
  return repository.getStats();
}

export function getAnaKategoriler() {
  return repository.getAnaKategoriler();
}

export function getHizmetAlanlari(anaKategoriId?: number) {
  return repository.getHizmetAlanlari(anaKategoriId);
}

export function getDrpBirler(hizmetAlaniId?: number) {
  return repository.getDrpBirler(hizmetAlaniId);
}

export function getDrpIkiler(drpBirId?: number) {
  return repository.getDrpIkiler(drpBirId);
}

export function getDrpUcler(drpIkiId?: number) {
  return repository.getDrpUcler(drpIkiId);
}

export function createAnaKategori(ad: string) {
  const id = repository.createAnaKategori(ad);
  return { id, ad, is_custom: 1 };
}

export function createHizmetAlani(anaKategoriId: number, ad: string) {
  const id = repository.createHizmetAlani(anaKategoriId, ad);
  return { id, ana_kategori_id: anaKategoriId, ad, is_custom: 1 };
}

export function createDrpBir(hizmetAlaniId: number, ad: string) {
  const id = repository.createDrpBir(hizmetAlaniId, ad);
  return { id, drp_hizmet_alani_id: hizmetAlaniId, ad, is_custom: 1 };
}

export function createDrpIki(drpBirId: number, ad: string) {
  const id = repository.createDrpIki(drpBirId, ad);
  return { id, drp_bir_id: drpBirId, ad, is_custom: 1 };
}

export function createDrpUc(drpIkiId: number, kod: string, aciklama: string) {
  const id = repository.createDrpUc(drpIkiId, kod, aciklama);
  return { id, drp_iki_id: drpIkiId, kod, aciklama, is_custom: 1 };
}

export function updateAnaKategori(id: number, ad: string) {
  repository.updateAnaKategori(id, ad);
  return { success: true };
}

export function updateHizmetAlani(id: number, ad: string) {
  repository.updateHizmetAlani(id, ad);
  return { success: true };
}

export function updateDrpBir(id: number, ad: string) {
  repository.updateDrpBir(id, ad);
  return { success: true };
}

export function updateDrpIki(id: number, ad: string) {
  repository.updateDrpIki(id, ad);
  return { success: true };
}

export function updateDrpUc(id: number, kod: string, aciklama: string) {
  repository.updateDrpUc(id, kod, aciklama);
  return { success: true };
}

export function deleteAnaKategori(id: number) {
  repository.deleteAnaKategori(id);
  return { success: true };
}

export function deleteHizmetAlani(id: number) {
  repository.deleteHizmetAlani(id);
  return { success: true };
}

export function deleteDrpBir(id: number) {
  repository.deleteDrpBir(id);
  return { success: true };
}

export function deleteDrpIki(id: number) {
  repository.deleteDrpIki(id);
  return { success: true };
}

export function deleteDrpUc(id: number) {
  repository.deleteDrpUc(id);
  return { success: true };
}

export function resetToDefaults() {
  const db = getDatabase();
  resetGuidanceStandardsToDefaults(db);
  return { success: true, message: 'Varsayılan veriler yüklendi' };
}

export function getHierarchyByAnaKategori(anaKategoriId: number) {
  const hizmetAlanlari = repository.getHizmetAlanlari(anaKategoriId);

  const result = hizmetAlanlari.map(ha => {
    const drpBirler = repository.getDrpBirler(ha.id);

    return {
      ...ha,
      drp_bir: drpBirler.map(db => {
        const drpIkiler = repository.getDrpIkiler(db.id);

        return {
          ...db,
          drp_iki: drpIkiler.map(di => {
            const drpUcler = repository.getDrpUcler(di.id);
            return {
              ...di,
              drp_uc: drpUcler
            };
          })
        };
      })
    };
  });

  return result;
}

interface CounselingTopic {
  id: string;
  title: string;
  category: string;
  fullPath: string;
  drpHizmetAlaniId: number;
  drpBirId: number;
  drpIkiId: number;
  drpUcId: number;
}

export function getIndividualTopicsFlat(): CounselingTopic[] {
  const topics: CounselingTopic[] = [];

  const bireyselKategori = repository.getAnaKategoriler().find(k => k.ad === 'Bireysel Çalışmalar');
  if (!bireyselKategori) return topics;

  const hizmetAlanlari = repository.getHizmetAlanlari(bireyselKategori.id);

  for (const ha of hizmetAlanlari) {
    const drpBirler = repository.getDrpBirler(ha.id);

    for (const db of drpBirler) {
      const drpIkiler = repository.getDrpIkiler(db.id);

      for (const di of drpIkiler) {
        const drpUcler = repository.getDrpUcler(di.id);

        for (const du of drpUcler) {
          topics.push({
            id: String(du.id),
            title: du.aciklama,
            category: di.ad,
            fullPath: `${ha.ad} > ${db.ad} > ${di.ad}`,
            drpHizmetAlaniId: ha.id,
            drpBirId: db.id,
            drpIkiId: di.id,
            drpUcId: du.id
          });
        }
      }
    }
  }

  return topics;
}
