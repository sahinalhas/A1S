import * as fs from 'fs';
import * as path from 'path';

const jsonPath = path.resolve(process.cwd(), 'shared/data/guidance-standards.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let total = 0;
let missingCode = 0;
let examples = [];

function check(node) {
    if (node.drp_uc) {
        node.drp_uc.forEach(item => {
            total++;
            if (!item.kod || item.kod.trim() === '') {
                missingCode++;
                if (examples.length < 5) {
                    examples.push(item.aciklama);
                }
            }
        });
    }

    if (node.drp_iki) node.drp_iki.forEach(check);
    if (node.drp_bir) node.drp_bir.forEach(check);
    if (node.hizmet_alanlari) node.hizmet_alanlari.forEach(check);
}

data.forEach(check);

console.log(`Total items checked: ${total}`);
console.log(`Items missing code: ${missingCode}`);
if (missingCode > 0) {
    console.log('Examples of items without code:', examples);
}
