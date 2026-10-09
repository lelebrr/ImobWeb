// Gera www/offline.html e www/index.html (tela mostrada quando o site não abre)
// com o endereço certo do servidor. Roda automaticamente antes de "cap sync".
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = (process.env.CAP_SERVER_URL || 'https://imobweb2.vercel.app').replace(/\/+$/, '');
const start = process.env.CAP_START_PATH || '/admin/vistoria';

const html = readFileSync(join(root, 'scripts', 'offline.template.html'), 'utf8').replaceAll('__START_URL__', `${server}${start}`);
mkdirSync(join(root, 'www'), { recursive: true });
writeFileSync(join(root, 'www', 'offline.html'), html);
writeFileSync(join(root, 'www', 'index.html'), html);
console.log(`[prepare] app apontando para ${server}${start}`);
