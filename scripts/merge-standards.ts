import * as fs from 'fs';
import * as path from 'path';
import {
    DEFAULT_INDIVIDUAL_STANDARDS,
    DEFAULT_GROUP_STANDARDS
} from '../temp_standards';

const JSON_PATH = path.resolve(process.cwd(), 'shared/data/guidance-standards.json');

// Interface types matching the JSON structure
interface DrpUc {
    kod: string;
    aciklama: string;
}

interface DrpIki {
    id: number;
    ad: string;
    drp_uc: DrpUc[];
}

interface DrpBir {
    id: number;
    ad: string;
    drp_iki: DrpIki[];
}

interface HizmetAlani {
    id: number;
    ad: string;
    drp_bir: DrpBir[];
}

interface AnaKategori {
    id: number;
    ad: string;
    hizmet_alanlari: HizmetAlani[];
}

function loadJson(): AnaKategori[] {
    return JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
}

function saveJson(data: AnaKategori[]) {
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function parseItem(title: string): { kod: string, aciklama: string } {
    // Expected format: "CODE - DESCRIPTION"
    // Some might be "CODE DESCRIPTION" or just description?
    // User file example: "ÖSO - Kimden, nereden..."
    const parts = title.split(' - ');
    if (parts.length >= 2) {
        return {
            kod: parts[0].trim(),
            aciklama: parts.slice(1).join(' - ').trim()
        };
    }

    // Alternative: try to split by first space if it looks like a code
    // Regex: start with alphanumeric, then space
    const match = title.match(/^([A-Za-z0-9İıŞşÇçĞğÜüÖö.]+) (.+)$/);
    if (match) {
        return {
            kod: match[1].trim(),
            aciklama: match[2].trim()
        };
    }

    // Fallback
    return {
        kod: '',
        aciklama: title.trim()
    };
}

function findOrAddItem(targetList: DrpUc[], itemTitle: string) {
    const parsed = parseItem(itemTitle);

    // Check if exists
    const exists = targetList.some(
        x => (x.kod === parsed.kod && x.aciklama === parsed.aciklama) ||
            (parsed.kod && x.kod === parsed.kod) // Match by code primarily
    );

    if (!exists) {
        console.log(`Adding item: [${parsed.kod}] ${parsed.aciklama}`);
        targetList.push(parsed);
    }
}

function processLevel(sourceNode: any, target: any, targetType: 'root' | 'hizmet' | 'bir' | 'iki') {
    if (targetType === 'root') {
        // sourceNode is array of Root categories
        // Map 'individual' -> 'Bireysel Çalışmalar'
        // Map 'group' -> 'Grup Çalışmaları'
        const bireyselTarget = target.find((x: any) => x.id === 2); // Bireysel ID 2
        const grupTarget = target.find((x: any) => x.id === 1); // Grup ID 1

        sourceNode.forEach((cat: any) => {
            if (cat.type === 'individual' && bireyselTarget) {
                processLevel(cat, bireyselTarget, 'hizmet');
            } else if (cat.type === 'group' && grupTarget) {
                processLevel(cat, grupTarget, 'hizmet');
            }
        });
    }
    else if (targetType === 'hizmet') {
        // sourceNode is Level 1 category (Hizmet Alani)
        // Find matching target Hizmet Alani
        const targetHizmet = target.hizmet_alanlari?.find((x: any) =>
            x.ad === sourceNode.title || x.ad.includes(sourceNode.title.split(' - ')[0])
        );

        if (targetHizmet) {
            if (sourceNode.children) {
                sourceNode.children.forEach((child: any) => {
                    processLevel(child, targetHizmet, 'bir');
                });
            }
        } else {
            console.warn(`Hizmet Alani not found for: ${sourceNode.title}`);
        }
    }
    else if (targetType === 'bir') {
        // sourceNode is Level 2 (DRP-1)
        const targetBir = target.drp_bir?.find((x: any) =>
            x.ad === sourceNode.title || x.ad.includes(sourceNode.title.split(' - ')[0])
        );

        if (targetBir) {
            // If source has children (Level 3), recurse to DRP-2
            if (sourceNode.children && sourceNode.children.length > 0) {
                sourceNode.children.forEach((child: any) => {
                    processLevel(child, targetBir, 'iki');
                });
            }

            // If source has items (Level 2 items), treat them as DRP-3 belonging to a default DRP-2
            if (sourceNode.items && sourceNode.items.length > 0) {
                // Find a DRP-2 that seems to be the "main" one or "Bireysel/Grup" specific one
                // Strategy: if drp_iki has only 1 item, use it.
                // If multiple, try to find one where name is similar to DRP-1 or contains 'BİREYSEL'/'GRUP'

                // Specific fix for "ÖOB - BİREYİ TANIMA":
                // Target DRP-1 (ÖOB) has DRP-2 (BİREYSEL BİREYİ TANIMA) or (GRUP BİREYİ TANIMA)
                // Check targetBir.drp_iki

                let targetIki = targetBir.drp_iki?.[0]; // Default to first

                // Try to be smarter
                const specificIki = targetBir.drp_iki?.find((x: any) =>
                    x.ad.includes(targetBir.ad) ||
                    x.ad.includes('BİREYSEL') ||
                    x.ad.includes('GRUP')
                );
                if (specificIki) targetIki = specificIki;

                if (targetIki) {
                    sourceNode.items.forEach((item: any) => {
                        findOrAddItem(targetIki.drp_uc, item.title);
                    });
                } else {
                    console.warn(`No DRP-2 found for items in DRP-1: ${targetBir.ad}`);
                }
            }
        } else {
            console.warn(`DRP-1 not found for: ${sourceNode.title}`);
        }
    }
    else if (targetType === 'iki') {
        // sourceNode is Level 3 (DRP-2)
        const targetIki = target.drp_iki?.find((x: any) =>
            x.ad === sourceNode.title || x.ad.includes(sourceNode.title.split(' - ')[0])
        );

        if (targetIki) {
            if (sourceNode.items) {
                sourceNode.items.forEach((item: any) => {
                    findOrAddItem(targetIki.drp_uc, item.title);
                });
            }
        } else {
            console.warn(`DRP-2 not found for: ${sourceNode.title}`);
        }
    }
}

function main() {
    console.log('Starting merge...');
    const data = loadJson(); // Root AnaKategori[]

    // Wrap individual and group into array to process uniformly
    const sourceData = [...DEFAULT_INDIVIDUAL_STANDARDS, ...DEFAULT_GROUP_STANDARDS];

    processLevel(sourceData, data, 'root');

    saveJson(data);
    console.log('Merge completed.');
}

main();
