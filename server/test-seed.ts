import Database from 'better-sqlite3';
import { createGuidanceStandardsTables, seedGuidanceStandards } from './lib/database/schema/guidance-standards.schema';

const db = new Database(':memory:');

console.log('Creating tables...');
createGuidanceStandardsTables(db);

console.log('Seeding data...');
try {
    seedGuidanceStandards(db);

    const counts = {
        ana: (db.prepare('SELECT COUNT(*) as count FROM ana_kategoriler').get() as any).count,
        hizmet: (db.prepare('SELECT COUNT(*) as count FROM drp_hizmet_alani').get() as any).count,
        bir: (db.prepare('SELECT COUNT(*) as count FROM drp_bir').get() as any).count,
        iki: (db.prepare('SELECT COUNT(*) as count FROM drp_iki').get() as any).count,
        uc: (db.prepare('SELECT COUNT(*) as count FROM drp_uc').get() as any).count
    };

    console.log('Counts:', counts);

    // Previous count was around 155. New count should be significantly higher.
    if (counts.uc > 200) {
        console.log('✅ Test Passed: Data count increased significantly');
    } else {
        console.log(`⚠️ Warning: Data count is ${counts.uc}, check if merge added enough items.`);
    }
} catch (e) {
    console.error('❌ Test Failed with error:', e);
    process.exit(1);
}
